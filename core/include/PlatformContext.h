#pragma once

#include "Types.h"

namespace octatouch {

struct AccessibilityFlags {
    bool screenReaderActive{false};
    bool zoomActive{false};
    bool switchControlActive{false};
};

struct PlatformContext {
    AccessibilityFlags accessibility{};
    VehicleState vehicleState{VehicleState::Unknown};
    CapabilityFlags capabilities{};
};

}  // namespace octatouch
