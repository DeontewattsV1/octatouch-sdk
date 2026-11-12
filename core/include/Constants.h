#pragma once

// OctaTouch Recognition Constants
// All gesture detection thresholds live here. Change a value in one place and
// it propagates to every recognition path — C++, tests, and future adapters.
//
// When porting to a new platform, verify these defaults against the device's
// reported contact-area units and adjust in a platform-specific override if
// needed, rather than editing the values here.

namespace octatouch {
namespace constants {

// ── Gesture Recognition ──────────────────────────────────────────────────────

// Minimum contact area (arbitrary sensor units) that distinguishes a held
// long-press from a light tap. Values above this threshold, combined with
// sufficient pressure, trigger LongPress rather than Tap.
constexpr float kLongPressContactAreaMin = 18.0F;

// Minimum normalized pressure (0–1) required for a long press to register.
constexpr float kLongPressPressureMin = 0.7F;

// Swipe detection: normalized x/y position beyond this boundary is treated as
// a directional swipe. 0.2 = left/top edge; 0.8 = right/bottom edge.
constexpr float kSwipeEdgeLow = 0.2F;
constexpr float kSwipeEdgeHigh = 0.8F;

// Three-finger pinch: if the horizontal spread of touch points is tighter
// than this, the gesture is a pinch-in (copy intent).
constexpr float kPinchInSpreadMax = 0.15F;

// Three-finger spread: if horizontal spread exceeds this, the gesture is a
// pinch-out (paste intent).
constexpr float kPinchOutSpreadMin = 0.55F;

// Average pressure above this level triggers a ThreeFingerTap rather than a
// swipe when all three fingers are within the pinch spread range.
constexpr float kThreeFingerTapPressureMin = 0.7F;

// Swipe detection for three-finger gestures: the rightmost touch point must
// exceed this x value for a right-swipe, or the leftmost must be below 1-this
// for a left-swipe.
constexpr float kThreeFingerSwipeEdge = 0.75F;

// ── JS Parity Runtime ─────────────────────────────────────────────────────────
// These are duplicated in octatouchConstants.js. If you update one set,
// update the other to keep JS/C++ behaviour in sync.

// Maximum tap duration in milliseconds. A touch shorter than this that also
// stays within kTapMoveThreshold is classified as a tap.
constexpr int kTapMaxDurationMs = 250;

// Gap between consecutive taps (ms) within which a second tap is counted as
// a double-tap or triple-tap.
constexpr int kDoubleTapGapMs = 350;

// Minimum hold duration (ms) before a stationary touch becomes a long press.
constexpr int kLongPressMs = 500;

// Normalized positional movement below this value is treated as stationary
// (used for tap and long-press disambiguation).
constexpr float kTapMoveThreshold = 0.035F;

// Minimum normalized movement on any axis to qualify as a swipe.
constexpr float kSwipeMoveThreshold = 0.14F;

// Minimum normalized change in three-finger spread radius to qualify as a
// pinch (either direction).
constexpr float kPinchDeltaThreshold = 0.12F;

// ── Confidence Values ─────────────────────────────────────────────────────────

// Baseline confidence emitted for any successfully recognised gesture.
constexpr float kBaseConfidence = 0.82F;

// Elevated confidence for accessibility-conflict blocks (routing is
// deterministic, not probabilistic).
constexpr float kAccessibilityBlockConfidence = 0.96F;

// Elevated confidence for driving-mode blocks.
constexpr float kDrivingModeBlockConfidence = 0.98F;

// Elevated confidence for accessibility-conflict blocks in C++ runtime.
constexpr float kCppAccessibilityBlockConfidence = 0.95F;

// Elevated confidence for driving-mode blocks in C++ runtime.
constexpr float kCppDrivingModeBlockConfidence = 0.98F;

// Baseline confidence in the C++ runtime (slightly different because
// the C++ recogniser uses contact-area heuristics rather than time-based).
constexpr float kCppBaseConfidence = 0.82F;

}  // namespace constants
}  // namespace octatouch
