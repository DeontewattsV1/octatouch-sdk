#pragma once

#include <cstdint>
#include <memory>
#include <string>
#include <vector>

#include "FingerTracker.h"
#include "GestureInputFrame.h"
#include "GestureResult.h"
#include "PlatformContext.h"

namespace octatouch::native {

struct LiveCentroid {
    float x{0.0F};
    float y{0.0F};
};

struct LiveState {
    std::string phase{"idle"};
    int activeTouches{0};
    std::string candidateGesture{"unknown"};
    std::vector<std::string> assignedFingers;
    LiveCentroid centroid{};
};

struct GestureDiagnostics {
    int durationMs{0};
    float travelX{0.0F};
    float travelY{0.0F};
    int peakTouches{0};
    std::uint64_t startedAt_us{0};
    std::uint64_t endedAt_us{0};
};

struct NativeGestureResult {
    GestureResult core{};
    GestureDiagnostics diagnostics{};
};

struct IngestResponse {
    bool hasResult{false};
    NativeGestureResult result{};
    LiveState live{};
};

struct RealtimeSession {
    std::uint64_t startedAt_us{0};
    std::uint64_t lastFrameAt_us{0};
    std::uint64_t endedAt_us{0};
    std::vector<RawTouchSample> startSamples;
    std::vector<RawTouchSample> finalSamples;
    std::vector<RawTouchSample> peakSamples;
    int maxTouches{0};
    LiveCentroid startCentroid{};
    LiveCentroid currentCentroid{};
    LiveCentroid travel{};
    ToolType toolType{ToolType::Touch};
    std::string deviceId;
};

struct TapMemory {
    std::uint64_t lastTapAt_us{0};
    LiveCentroid lastTapCentroid{};
    bool hasCentroid{false};
    int tapCount{0};
};

class RealtimeGestureEngine {
public:
    IngestResponse ingestFrame(const GestureInputFrame& frame, const PlatformContext& context);
    void reset();

private:
    FingerTracker fingerTracker_{};
    std::unique_ptr<RealtimeSession> session_{};
    std::unique_ptr<TapMemory> tapMemory_{};
};

}  // namespace octatouch::native
