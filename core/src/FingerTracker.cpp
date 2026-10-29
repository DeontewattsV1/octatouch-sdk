#include "FingerTracker.h"

#include <algorithm>
#include <array>
#include <vector>

namespace octatouch {

namespace {
constexpr std::array<FingerId, 4> kLeftIds{FingerId::L1, FingerId::L2, FingerId::L3, FingerId::L4};
constexpr std::array<FingerId, 4> kRightIds{FingerId::R1, FingerId::R2, FingerId::R3, FingerId::R4};
}  // namespace

std::map<FingerId, RawTouchSample> FingerTracker::assignIdentities(const GestureInputFrame& frame) const {
    std::vector<RawTouchSample> left;
    std::vector<RawTouchSample> right;

    for (const auto& sample : frame.samples) {
        if (sample.x < 0.5F) {
            left.push_back(sample);
        } else {
            right.push_back(sample);
        }
    }

    auto byYThenX = [](const RawTouchSample& a, const RawTouchSample& b) {
        if (a.y == b.y) {
            return a.x < b.x;
        }
        return a.y < b.y;
    };

    std::sort(left.begin(), left.end(), byYThenX);
    std::sort(right.begin(), right.end(), byYThenX);

    std::map<FingerId, RawTouchSample> assigned;

    for (std::size_t index = 0; index < left.size() && index < kLeftIds.size(); ++index) {
        assigned[kLeftIds[index]] = left[index];
    }
    for (std::size_t index = 0; index < right.size() && index < kRightIds.size(); ++index) {
        assigned[kRightIds[index]] = right[index];
    }

    return assigned;
}

}  // namespace octatouch
