#pragma once

#include <map>

#include "GestureResult.h"
#include "PlatformContext.h"

namespace octatouch {

class GestureRecognizer {
public:
    GestureType recognize(const std::map<FingerId, RawTouchSample>& fingers) const;
};

}  // namespace octatouch
