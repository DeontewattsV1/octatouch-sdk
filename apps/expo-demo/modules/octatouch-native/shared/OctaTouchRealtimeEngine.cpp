#include "OctaTouchRealtimeEngine.h"

#include <algorithm>
#include <cmath>
#include <limits>
#include <map>
#include <memory>
#include <utility>

#include "IntentResolver.h"
#include "Types.h"

namespace octatouch::native {

namespace {
constexpr float kTapMaxDurationMs = 250.0F;
constexpr float kDoubleTapGapMs = 350.0F;
constexpr float kLongPressMs = 500.0F;
constexpr float kTapMoveThreshold = 0.035F;
constexpr float kSwipeMoveThreshold = 0.14F;
constexpr float kPinchDeltaThreshold = 0.12F;
constexpr float kTapCentroidThreshold = 0.08F;

LiveCentroid centroid(const std::vector<RawTouchSample>& samples) {
    if (samples.empty()) {
        return {};
    }

    LiveCentroid total{};
    for (const auto& sample : samples) {
        total.x += sample.x;
        total.y += sample.y;
    }
    total.x /= static_cast<float>(samples.size());
    total.y /= static_cast<float>(samples.size());
    return total;
}

float averageDistanceFromCentroid(const std::vector<RawTouchSample>& samples) {
    if (samples.empty()) {
        return 0.0F;
    }

    const auto center = centroid(samples);
    float total = 0.0F;
    for (const auto& sample : samples) {
        total += std::hypot(sample.x - center.x, sample.y - center.y);
    }
    return total / static_cast<float>(samples.size());
}

std::vector<RawTouchSample> cloneSamples(const std::vector<RawTouchSample>& samples) {
    return samples;
}

std::vector<std::string> assignedFingerStrings(const FingerTracker& tracker, const std::vector<RawTouchSample>& samples,
                                               ToolType toolType, const std::string& deviceId,
                                               std::uint64_t timestamp_us) {
    GestureInputFrame frame;
    frame.timestamp_us = timestamp_us;
    frame.samples = samples;
    frame.deviceId = deviceId;
    frame.toolType = toolType;

    std::vector<std::string> output;
    for (const auto& [fingerId, _] : tracker.assignIdentities(frame)) {
        output.push_back(to_string(fingerId));
    }
    return output;
}

FingerSet assignedFingerSet(const FingerTracker& tracker, const std::vector<RawTouchSample>& samples, ToolType toolType,
                            const std::string& deviceId, std::uint64_t timestamp_us) {
    GestureInputFrame frame;
    frame.timestamp_us = timestamp_us;
    frame.samples = samples;
    frame.deviceId = deviceId;
    frame.toolType = toolType;

    FingerSet output;
    for (const auto& [fingerId, _] : tracker.assignIdentities(frame)) {
        output.push_back(fingerId);
    }
    return output;
}


GestureType candidateFromActiveSamples(const std::vector<RawTouchSample>& samples) {
    if (samples.empty()) {
        return GestureType::Unknown;
    }
    if (samples.size() == 1U) {
        return GestureType::Tap;
    }
    if (samples.size() == 2U) {
        return GestureType::TwoFingerTap;
    }
    if (samples.size() == 3U) {
        return GestureType::ThreeFingerTap;
    }
    if (samples.size() >= 8U) {
        return GestureType::EightFingerSpread;
    }
    return GestureType::Unknown;
}

GestureType classifySingleFinger(const RealtimeSession& session,
                                 const TapMemory& tapMemory) {
    const float durationMs = static_cast<float>(session.endedAt_us - session.startedAt_us) / 1000.0F;
    const float moveMagnitude = std::hypot(session.travel.x, session.travel.y);

    if (durationMs >= kLongPressMs && moveMagnitude <= kTapMoveThreshold) {
        return GestureType::LongPress;
    }
    if (durationMs >= kLongPressMs && moveMagnitude > kTapMoveThreshold) {
        return GestureType::LongPressDrag;
    }
    if (std::fabs(session.travel.x) >= kSwipeMoveThreshold || std::fabs(session.travel.y) >= kSwipeMoveThreshold) {
        if (std::fabs(session.travel.x) > std::fabs(session.travel.y)) {
            return session.travel.x > 0.0F ? GestureType::SwipeRight : GestureType::SwipeLeft;
        }
        return session.travel.y > 0.0F ? GestureType::SwipeDown : GestureType::SwipeUp;
    }
    if (durationMs <= kTapMaxDurationMs && moveMagnitude <= kTapMoveThreshold) {
        const bool withinTapWindow = tapMemory.lastTapAt_us > 0 &&
                                     static_cast<float>(session.endedAt_us - tapMemory.lastTapAt_us) / 1000.0F <=
                                         kDoubleTapGapMs;
        const auto currentCentroid = centroid(session.finalSamples);
        const bool closeToLastTap = tapMemory.hasCentroid &&
                                    std::hypot(currentCentroid.x - tapMemory.lastTapCentroid.x,
                                               currentCentroid.y - tapMemory.lastTapCentroid.y) <=
                                        kTapCentroidThreshold;
        if (withinTapWindow && closeToLastTap) {
            if (tapMemory.tapCount == 2) {
                return GestureType::TripleTap;
            }
            return GestureType::DoubleTap;
        }
        return GestureType::Tap;
    }
    return GestureType::Unknown;
}

GestureType classifyMultiFinger(const RealtimeSession& session) {
    const float durationMs = static_cast<float>(session.endedAt_us - session.startedAt_us) / 1000.0F;
    const float moveMagnitude = std::hypot(session.travel.x, session.travel.y);

    if (session.maxTouches == 2) {
        if (durationMs <= kTapMaxDurationMs && moveMagnitude <= kTapMoveThreshold) {
            return GestureType::TwoFingerTap;
        }
        return GestureType::Unknown;
    }

    if (session.maxTouches == 3) {
        const float startSpread = averageDistanceFromCentroid(session.startSamples);
        const float endSpread = averageDistanceFromCentroid(session.finalSamples);
        const float spreadDelta = endSpread - startSpread;
        if (spreadDelta <= -kPinchDeltaThreshold) {
            return GestureType::ThreeFingerPinchIn;
        }
        if (spreadDelta >= kPinchDeltaThreshold) {
            return GestureType::ThreeFingerPinchOut;
        }
        if (std::fabs(session.travel.x) >= kSwipeMoveThreshold && std::fabs(session.travel.x) > std::fabs(session.travel.y)) {
            return session.travel.x > 0.0F ? GestureType::ThreeFingerSwipeRight : GestureType::ThreeFingerSwipeLeft;
        }
        if (durationMs <= kTapMaxDurationMs && moveMagnitude <= kTapMoveThreshold) {
            return GestureType::ThreeFingerTap;
        }
        return GestureType::Unknown;
    }

    if (session.maxTouches >= 8) {
        return moveMagnitude >= kSwipeMoveThreshold ? GestureType::EightFingerSweep : GestureType::EightFingerSpread;
    }

    return GestureType::Unknown;
}

NativeGestureResult resolveResult(const FingerTracker& tracker, GestureType primitive,
                                  const RealtimeSession& session, const PlatformContext& context) {
    NativeGestureResult output{};
    const auto activeFingers = assignedFingerSet(tracker, session.peakSamples, session.toolType, session.deviceId,
                                                 session.endedAt_us);

    IntentResolver resolver;
    auto resolved = resolver.resolve(primitive, activeFingers, context, session.endedAt_us);
    if (primitive != GestureType::Unknown && resolved.intent != GestureIntent::BlockedAccessibilityConflict &&
        resolved.intent != GestureIntent::BlockedDrivingMode) {
        resolved.confidence = 0.84F;
    }
    if (resolved.intent == GestureIntent::BlockedAccessibilityConflict) {
        resolved.confidence = 0.96F;
    }
    if (resolved.intent == GestureIntent::BlockedDrivingMode) {
        resolved.confidence = 0.98F;
    }

    output.core = std::move(resolved);
    output.diagnostics.durationMs =
        static_cast<int>((session.endedAt_us - session.startedAt_us) / 1000ULL);
    output.diagnostics.travelX = session.travel.x;
    output.diagnostics.travelY = session.travel.y;
    output.diagnostics.peakTouches = session.maxTouches;
    output.diagnostics.startedAt_us = session.startedAt_us;
    output.diagnostics.endedAt_us = session.endedAt_us;
    return output;
}

std::unique_ptr<RealtimeSession> makeSession(const GestureInputFrame& frame) {
    auto session = std::make_unique<RealtimeSession>();
    session->startedAt_us = frame.timestamp_us;
    session->lastFrameAt_us = frame.timestamp_us;
    session->endedAt_us = frame.timestamp_us;
    session->startSamples = cloneSamples(frame.samples);
    session->finalSamples = cloneSamples(frame.samples);
    session->peakSamples = cloneSamples(frame.samples);
    session->maxTouches = static_cast<int>(frame.samples.size());
    session->startCentroid = centroid(frame.samples);
    session->currentCentroid = centroid(frame.samples);
    session->toolType = frame.toolType;
    session->deviceId = frame.deviceId;
    return session;
}

std::unique_ptr<TapMemory> makeTapMemory() {
    return std::make_unique<TapMemory>();
}

}  // namespace

IngestResponse RealtimeGestureEngine::ingestFrame(const GestureInputFrame& frame, const PlatformContext& context) {
    if (!tapMemory_) {
        tapMemory_ = makeTapMemory();
    }

    IngestResponse response{};
    response.live.phase = "idle";

    if (!frame.samples.empty()) {
        if (!session_) {
            session_ = makeSession(frame);
        } else {
            session_->lastFrameAt_us = frame.timestamp_us;
            session_->finalSamples = cloneSamples(frame.samples);
            session_->currentCentroid = centroid(frame.samples);
            session_->travel = {
                session_->currentCentroid.x - session_->startCentroid.x,
                session_->currentCentroid.y - session_->startCentroid.y,
            };
            if (static_cast<int>(frame.samples.size()) >= session_->maxTouches) {
                session_->maxTouches = static_cast<int>(frame.samples.size());
                session_->peakSamples = cloneSamples(frame.samples);
            }
        }

        response.live.phase = "tracking";
        response.live.activeTouches = static_cast<int>(frame.samples.size());
        response.live.candidateGesture = to_string(candidateFromActiveSamples(frame.samples));
        response.live.assignedFingers =
            assignedFingerStrings(fingerTracker_, frame.samples, frame.toolType, frame.deviceId, frame.timestamp_us);
        const auto liveCentroid = centroid(frame.samples);
        response.live.centroid.x = liveCentroid.x;
        response.live.centroid.y = liveCentroid.y;
        return response;
    }

    if (session_ == nullptr) {
        return response;
    }

    session_->endedAt_us = frame.timestamp_us == 0 ? session_->lastFrameAt_us : frame.timestamp_us;
    const auto type = session_->maxTouches <= 1 ? classifySingleFinger(*session_, *tapMemory_) : classifyMultiFinger(*session_);

    response.result = resolveResult(fingerTracker_, type, *session_, context);
    response.hasResult = true;

    if (type == GestureType::Tap || type == GestureType::DoubleTap || type == GestureType::TripleTap) {
        const bool sameWindow = tapMemory_->lastTapAt_us > 0 &&
                                static_cast<float>(session_->endedAt_us - tapMemory_->lastTapAt_us) / 1000.0F <=
                                    kDoubleTapGapMs;
        tapMemory_->lastTapAt_us = session_->endedAt_us;
        tapMemory_->lastTapCentroid = centroid(session_->finalSamples);
        tapMemory_->hasCentroid = true;
        tapMemory_->tapCount = sameWindow ? std::min(3, tapMemory_->tapCount + 1) : 1;
    } else {
        *tapMemory_ = {};
    }

    session_.reset();
    return response;
}

void RealtimeGestureEngine::reset() {
    session_.reset();

    if (!tapMemory_) {
        tapMemory_ = makeTapMemory();
        return;
    }
    *tapMemory_ = {};
}

}  // namespace octatouch::native
