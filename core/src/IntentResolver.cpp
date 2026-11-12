#include "IntentResolver.h"

namespace octatouch {

namespace {
bool isAccessibilityConflict(GestureType primitive, const PlatformContext& ctx) {
    if (!(ctx.accessibility.screenReaderActive || ctx.accessibility.zoomActive || ctx.accessibility.switchControlActive)) {
        return false;
    }

    return primitive == GestureType::ThreeFingerTap || primitive == GestureType::ThreeFingerPinchIn ||
           primitive == GestureType::ThreeFingerPinchOut;
}

bool isStationaryOnly(GestureType primitive) {
    switch (primitive) {
        case GestureType::TwoFingerTap:
        case GestureType::ThreeFingerTap:
        case GestureType::ThreeFingerPinchIn:
        case GestureType::ThreeFingerPinchOut:
        case GestureType::ThreeFingerSwipeLeft:
        case GestureType::ThreeFingerSwipeRight:
        case GestureType::TripleTap:
        case GestureType::LongPressDrag:
        case GestureType::EightFingerRotate:
        case GestureType::EightFingerSpread:
        case GestureType::EightFingerSweep:
        case GestureType::EightFingerMultiTap:
            return true;
        default:
            return false;
    }
}

GestureIntent mapPrimitiveToIntent(GestureType primitive) {
    switch (primitive) {
        case GestureType::Tap: return GestureIntent::Select;
        case GestureType::DoubleTap: return GestureIntent::SelectWord;
        case GestureType::TripleTap: return GestureIntent::SelectParagraph;
        case GestureType::LongPressDrag: return GestureIntent::SelectBlock;
        case GestureType::SwipeLeft:
        case GestureType::SwipeRight:
        case GestureType::SwipeUp:
        case GestureType::SwipeDown:
            return GestureIntent::TrackChange;
        case GestureType::TwoFingerTap: return GestureIntent::SaveHighlight;
        case GestureType::ThreeFingerPinchIn: return GestureIntent::Copy;
        case GestureType::ThreeFingerPinchOut: return GestureIntent::Paste;
        case GestureType::ThreeFingerSwipeLeft: return GestureIntent::Undo;
        case GestureType::ThreeFingerSwipeRight: return GestureIntent::Redo;
        case GestureType::ThreeFingerTap: return GestureIntent::OpenClipboard;
        case GestureType::EightFingerSpread: return GestureIntent::ZoomToggle;
        default: return GestureIntent::Unknown;
    }
}
}  // namespace

GestureResult IntentResolver::resolve(GestureType primitive, const FingerSet& activeFingers, const PlatformContext& ctx,
                                      std::uint64_t resolvedAt_us) const {
    GestureResult result;
    result.gestureName = to_string(primitive);
    result.type = primitive;
    result.activeFingers = activeFingers;
    result.resolvedAt_us = resolvedAt_us;
    result.confidence = primitive == GestureType::Unknown ? 0.0F : 0.82F;

    if (isAccessibilityConflict(primitive, ctx)) {
        result.intent = GestureIntent::BlockedAccessibilityConflict;
        result.confidence = 0.95F;
        return result;
    }

    if (ctx.vehicleState == VehicleState::Driving && isStationaryOnly(primitive)) {
        result.intent = GestureIntent::BlockedDrivingMode;
        result.confidence = 0.98F;
        return result;
    }

    result.intent = mapPrimitiveToIntent(primitive);
    return result;
}

}  // namespace octatouch
