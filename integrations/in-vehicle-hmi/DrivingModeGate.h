#pragma once

#include <string>

#include "GestureResult.h"

namespace octatouch::vehicle {

struct RestrictionToast {
    bool shouldDisplay{false};
    std::string title;
    std::string message;
    int durationMs{3000};
    bool modal{false};
};

class DrivingModeGate {
public:
    RestrictionToast toastFor(const GestureResult& result) const;
};

}  // namespace octatouch::vehicle
