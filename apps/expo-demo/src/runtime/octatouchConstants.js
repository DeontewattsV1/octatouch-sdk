/**
 * OctaTouch Recognition Constants — JS Parity Module
 *
 * This file mirrors core/include/Constants.h. If you change a threshold in
 * Constants.h you MUST update the corresponding value here to keep the JS
 * parity runtime and the C++ runtime in sync.
 *
 * The naming convention deliberately matches the C++ side (kCamelCase) so
 * diffs between the two files are easy to scan.
 */

// ── Gesture Recognition ──────────────────────────────────────────────────────

/** Minimum contact area that distinguishes a long-press from a light tap. */
export const kLongPressContactAreaMin = 18.0;

/** Minimum normalized pressure (0–1) required for a long press. */
export const kLongPressPressureMin = 0.7;

/** Swipe edge detection — positions beyond these boundaries are swipes. */
export const kSwipeEdgeLow = 0.2;
export const kSwipeEdgeHigh = 0.8;

/** Three-finger pinch-in: max horizontal spread to classify as copy intent. */
export const kPinchInSpreadMax = 0.15;

/** Three-finger pinch-out: min horizontal spread to classify as paste intent. */
export const kPinchOutSpreadMin = 0.55;

/** Average pressure above which a three-finger contact becomes a tap. */
export const kThreeFingerTapPressureMin = 0.7;

/** Swipe edge threshold for three-finger directional swipes. */
export const kThreeFingerSwipeEdge = 0.75;

// ── JS Parity Runtime ─────────────────────────────────────────────────────────

/** Maximum tap duration (ms). Touches shorter than this are taps. */
export const kTapMaxDurationMs = 250;

/**
 * Gap between consecutive taps (ms) within which a second touch is a
 * double-tap or triple-tap.
 */
export const kDoubleTapGapMs = 350;

/** Minimum hold duration (ms) before a stationary touch becomes a long press. */
export const kLongPressMs = 500;

/**
 * Normalized positional movement below this value is treated as stationary
 * (used for tap and long-press disambiguation).
 */
export const kTapMoveThreshold = 0.035;

/** Minimum normalized movement on any axis to qualify as a swipe. */
export const kSwipeMoveThreshold = 0.14;

/**
 * Minimum normalized change in three-finger spread radius to qualify as a
 * pinch (either direction).
 */
export const kPinchDeltaThreshold = 0.12;

/** Minimum normalized proximity of two tap centroids to count as same-spot. */
export const kDoubleTapProximity = 0.08;

// ── Confidence Values ─────────────────────────────────────────────────────────

/** Baseline confidence for any successfully recognised gesture. */
export const kBaseConfidence = 0.84;

/** Elevated confidence for accessibility-conflict policy blocks. */
export const kAccessibilityBlockConfidence = 0.96;

/** Elevated confidence for driving-mode policy blocks. */
export const kDrivingModeBlockConfidence = 0.98;
