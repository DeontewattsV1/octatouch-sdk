#pragma once

#include <cstdint>
#include <string>
#include <vector>

namespace octatouch {

enum class FingerId {
    L1,
    L2,
    L3,
    L4,
    R1,
    R2,
    R3,
    R4,
    Unknown,
};

enum class GestureType {
    Tap,
    DoubleTap,
    TripleTap,
    LongPress,
    LongPressDrag,
    SwipeLeft,
    SwipeRight,
    SwipeUp,
    SwipeDown,
    TwoFingerTap,
    ThreeFingerTap,
    ThreeFingerPinchIn,
    ThreeFingerPinchOut,
    ThreeFingerSwipeLeft,
    ThreeFingerSwipeRight,
    EightFingerRotate,
    EightFingerSpread,
    EightFingerSweep,
    EightFingerMultiTap,
    Unknown,
};

enum class GestureIntent {
    Select,
    Confirm,
    SelectWord,
    SelectParagraph,
    SelectBlock,
    TrackChange,
    PageChange,
    Copy,
    Cut,
    Paste,
    Undo,
    Redo,
    SaveHighlight,
    OpenClipboard,
    ZoomToggle,
    ScreenCurtainToggle,
    BlockedDrivingMode,
    BlockedAccessibilityConflict,
    Unknown,
};

enum class ToolType {
    Touch,
    Stylus,
    Mouse,
};

enum class VehicleState {
    Unknown,
    Parked,
    Driving,
};

struct CapabilityFlags {
    bool multiTouch{true};
    bool hover{false};
    bool pressure{true};
    bool stylus{false};
};

struct RawTouchSample {
    float x{0.0F};
    float y{0.0F};
    float pressure{0.0F};
    float contactArea{0.0F};
    std::uint64_t timestamp_us{0};
    int nativeId{0};
};

using FingerSet = std::vector<FingerId>;

std::string to_string(FingerId fingerId);
std::string to_string(GestureType gestureType);
std::string to_string(GestureIntent intent);

}  // namespace octatouch
