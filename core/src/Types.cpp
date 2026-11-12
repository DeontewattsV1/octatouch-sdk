#include "Types.h"

namespace octatouch {

std::string to_string(FingerId fingerId) {
    switch (fingerId) {
        case FingerId::L1: return "L1";
        case FingerId::L2: return "L2";
        case FingerId::L3: return "L3";
        case FingerId::L4: return "L4";
        case FingerId::R1: return "R1";
        case FingerId::R2: return "R2";
        case FingerId::R3: return "R3";
        case FingerId::R4: return "R4";
        default: return "Unknown";
    }
}

std::string to_string(GestureType gestureType) {
    switch (gestureType) {
        case GestureType::Tap: return "tap";
        case GestureType::DoubleTap: return "double_tap";
        case GestureType::TripleTap: return "triple_tap";
        case GestureType::LongPress: return "long_press";
        case GestureType::LongPressDrag: return "long_press_drag";
        case GestureType::SwipeLeft: return "swipe_left";
        case GestureType::SwipeRight: return "swipe_right";
        case GestureType::SwipeUp: return "swipe_up";
        case GestureType::SwipeDown: return "swipe_down";
        case GestureType::TwoFingerTap: return "two_finger_tap";
        case GestureType::ThreeFingerTap: return "three_finger_tap";
        case GestureType::ThreeFingerPinchIn: return "three_finger_pinch_in";
        case GestureType::ThreeFingerPinchOut: return "three_finger_pinch_out";
        case GestureType::ThreeFingerSwipeLeft: return "three_finger_swipe_left";
        case GestureType::ThreeFingerSwipeRight: return "three_finger_swipe_right";
        case GestureType::EightFingerRotate: return "eight_finger_rotate";
        case GestureType::EightFingerSpread: return "eight_finger_spread";
        case GestureType::EightFingerSweep: return "eight_finger_sweep";
        case GestureType::EightFingerMultiTap: return "eight_finger_multi_tap";
        default: return "unknown";
    }
}

std::string to_string(GestureIntent intent) {
    switch (intent) {
        case GestureIntent::Select: return "select";
        case GestureIntent::Confirm: return "confirm";
        case GestureIntent::SelectWord: return "select_word";
        case GestureIntent::SelectParagraph: return "select_paragraph";
        case GestureIntent::SelectBlock: return "select_block";
        case GestureIntent::TrackChange: return "track_change";
        case GestureIntent::PageChange: return "page_change";
        case GestureIntent::Copy: return "copy";
        case GestureIntent::Cut: return "cut";
        case GestureIntent::Paste: return "paste";
        case GestureIntent::Undo: return "undo";
        case GestureIntent::Redo: return "redo";
        case GestureIntent::SaveHighlight: return "save_highlight";
        case GestureIntent::OpenClipboard: return "open_clipboard";
        case GestureIntent::ZoomToggle: return "zoom_toggle";
        case GestureIntent::ScreenCurtainToggle: return "screen_curtain_toggle";
        case GestureIntent::BlockedDrivingMode: return "blocked_driving_mode";
        case GestureIntent::BlockedAccessibilityConflict: return "blocked_accessibility_conflict";
        default: return "unknown";
    }
}

}  // namespace octatouch
