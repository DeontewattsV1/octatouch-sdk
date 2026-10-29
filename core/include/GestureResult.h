#pragma once

#include <cstdint>
#include <string>

#include "Types.h"

namespace octatouch {

struct GestureResult {
    std::string gestureName;
    GestureType type{GestureType::Unknown};
    GestureIntent intent{GestureIntent::Unknown};
    FingerSet activeFingers;
    float confidence{0.0F};
    std::uint64_t resolvedAt_us{0};
};

}  // namespace octatouch
