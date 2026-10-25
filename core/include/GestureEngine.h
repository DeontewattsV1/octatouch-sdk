#pragma once

#include <functional>

#include "FingerTracker.h"
#include "GestureRecognizer.h"
#include "IntentResolver.h"

namespace octatouch {

class GestureEngine {
public:
    using ResultCallback = std::function<void(const GestureResult&)>;

    void setCallback(ResultCallback callback);
    GestureResult feedFrame(const GestureInputFrame& frame, const PlatformContext& context) const;

private:
    FingerTracker fingerTracker_{};
    GestureRecognizer gestureRecognizer_{};
    IntentResolver intentResolver_{};
    ResultCallback callback_{};
};

}  // namespace octatouch
