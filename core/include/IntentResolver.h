#pragma once

#include "GestureResult.h"
#include "PlatformContext.h"

namespace octatouch {

class IntentResolver {
public:
    GestureResult resolve(GestureType primitive, const FingerSet& activeFingers, const PlatformContext& ctx,
                          std::uint64_t resolvedAt_us) const;
};

}  // namespace octatouch
