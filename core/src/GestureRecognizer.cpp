#include "GestureRecognizer.h"

#include <algorithm>
#include <cmath>
#include <limits>

namespace octatouch {

GestureType GestureRecognizer::recognize(const std::map<FingerId, RawTouchSample>& fingers) const {
    if (fingers.empty()) {
        return GestureType::Unknown;
    }

    if (fingers.size() == 1U) {
        const auto& sample = fingers.begin()->second;
        if (sample.contactArea > 18.0F && sample.pressure > 0.7F) {
            return GestureType::LongPress;
        }
        if (sample.x > 0.8F) {
            return GestureType::SwipeRight;
        }
        if (sample.x < 0.2F) {
            return GestureType::SwipeLeft;
        }
        if (sample.y < 0.2F) {
            return GestureType::SwipeUp;
        }
        if (sample.y > 0.8F) {
            return GestureType::SwipeDown;
        }
        return GestureType::Tap;
    }

    if (fingers.size() == 2U) {
        return GestureType::TwoFingerTap;
    }

    if (fingers.size() == 3U) {
        float minX = std::numeric_limits<float>::max();
        float maxX = std::numeric_limits<float>::lowest();
        float totalPressure = 0.0F;

        for (const auto& [_, sample] : fingers) {
            minX = std::min(minX, sample.x);
            maxX = std::max(maxX, sample.x);
            totalPressure += sample.pressure;
        }

        const float spread = maxX - minX;
        const float averagePressure = totalPressure / 3.0F;

        if (spread < 0.15F) {
            return GestureType::ThreeFingerPinchIn;
        }
        if (spread > 0.55F) {
            return GestureType::ThreeFingerPinchOut;
        }
        if (averagePressure > 0.7F) {
            return GestureType::ThreeFingerTap;
        }
        if (maxX > 0.75F) {
            return GestureType::ThreeFingerSwipeRight;
        }
        if (minX < 0.25F) {
            return GestureType::ThreeFingerSwipeLeft;
        }
        return GestureType::ThreeFingerTap;
    }

    if (fingers.size() >= 8U) {
        return GestureType::EightFingerSpread;
    }

    return GestureType::Unknown;
}

}  // namespace octatouch
