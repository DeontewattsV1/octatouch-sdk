#pragma once

#include <map>

#include "GestureInputFrame.h"

namespace octatouch {

class FingerTracker {
public:
    std::map<FingerId, RawTouchSample> assignIdentities(const GestureInputFrame& frame) const;
};

}  // namespace octatouch
