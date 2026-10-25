#include <utility>

#include "GestureEngine.h"

namespace octatouch {

void GestureEngine::setCallback(ResultCallback callback) {
    callback_ = std::move(callback);
}

GestureResult GestureEngine::feedFrame(const GestureInputFrame& frame, const PlatformContext& context) const {
    const auto assigned = fingerTracker_.assignIdentities(frame);
    const auto gestureType = gestureRecognizer_.recognize(assigned);

    FingerSet activeFingers;
    activeFingers.reserve(assigned.size());
    for (const auto& [fingerId, _] : assigned) {
        activeFingers.push_back(fingerId);
    }

    const auto result = intentResolver_.resolve(gestureType, activeFingers, context, frame.timestamp_us);

    if (callback_) {
        callback_(result);
    }

    return result;
}

}  // namespace octatouch
