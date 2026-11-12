#pragma once

#include <cstdint>
#include <string>
#include <vector>

#include "Types.h"

namespace octatouch {

struct GestureInputFrame {
    std::uint64_t timestamp_us{0};
    std::vector<RawTouchSample> samples;
    std::string deviceId;
    ToolType toolType{ToolType::Touch};
    CapabilityFlags capabilities{};
};

}  // namespace octatouch
