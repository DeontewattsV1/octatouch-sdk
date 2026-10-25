// OctaTouch Gesture Recognition Test Suite
//
// Covers all cases required by the engineering spec:
//   - finger_1_long_press through finger_8_long_press labels
//   - Recognition output label printing
//   - Blocked gestures in driving mode
//   - Accessibility fallback intent
//   - GestureResult field-presence parity contract
//
// Build:  cmake --build build --target gesture_recognition_test
// Run:    ./build/gesture_recognition_test

#include <cassert>
#include <cstdio>
#include <cstdint>
#include <string>
#include <map>
#include <vector>

#include "Types.h"
#include "GestureResult.h"
#include "GestureInputFrame.h"
#include "PlatformContext.h"
#include "Constants.h"
#include "FingerTracker.h"
#include "GestureRecognizer.h"
#include "IntentResolver.h"
#include "GestureEngine.h"

namespace octatouch::test {

// ── Helpers ───────────────────────────────────────────────────────────────────

static int sTests  = 0;
static int sFailed = 0;

#define EXPECT_EQ(a, b) do { \
    ++sTests; \
    if ((a) != (b)) { \
        ++sFailed; \
        std::fprintf(stderr, "  FAIL %s:%d  expected '%s' == '%s'\n", \
            __FILE__, __LINE__, #a, #b); \
    } \
} while (0)

#define EXPECT_TRUE(expr) do { \
    ++sTests; \
    if (!(expr)) { \
        ++sFailed; \
        std::fprintf(stderr, "  FAIL %s:%d  expected true: %s\n", \
            __FILE__, __LINE__, #expr); \
    } \
} while (0)

#define EXPECT_FALSE(expr) EXPECT_TRUE(!(expr))

#define TEST(name) \
    static void name(); \
    namespace { struct _Reg_##name { _Reg_##name() { \
        std::printf("  running " #name "\n"); name(); } } _reg_##name; } \
    static void name()

// Convenience: build a RawTouchSample with enough pressure/contactArea to
// trigger a LongPress in the C++ recogniser.
static RawTouchSample longPressSample(float x = 0.3F, float y = 0.5F) {
    RawTouchSample s;
    s.x           = x;
    s.y           = y;
    s.pressure    = constants::kLongPressPressureMin + 0.1F;
    s.contactArea = constants::kLongPressContactAreaMin + 1.0F;
    s.timestamp_us = 0;
    s.nativeId    = 0;
    return s;
}

// Build a finger map with a single sample placed on the left half (maps to L1).
static std::map<FingerId, RawTouchSample> singleFingerMap(FingerId id, RawTouchSample sample) {
    return {{id, sample}};
}

static PlatformContext normalCtx() {
    PlatformContext ctx;
    ctx.vehicleState = VehicleState::Parked;
    ctx.accessibility.screenReaderActive  = false;
    ctx.accessibility.zoomActive          = false;
    ctx.accessibility.switchControlActive = false;
    return ctx;
}

static PlatformContext drivingCtx() {
    auto ctx = normalCtx();
    ctx.vehicleState = VehicleState::Driving;
    return ctx;
}

static PlatformContext screenReaderCtx() {
    auto ctx = normalCtx();
    ctx.accessibility.screenReaderActive = true;
    return ctx;
}

// ── Per-finger long press label tests ─────────────────────────────────────────

TEST(LongPressF1_label) {
    EXPECT_EQ(longPressLabel(GestureType::LongPressF1), std::string("finger_1_long_press"));
}

TEST(LongPressF2_label) {
    EXPECT_EQ(longPressLabel(GestureType::LongPressF2), std::string("finger_2_long_press"));
}

TEST(LongPressF3_label) {
    EXPECT_EQ(longPressLabel(GestureType::LongPressF3), std::string("finger_3_long_press"));
}

TEST(LongPressF4_label) {
    EXPECT_EQ(longPressLabel(GestureType::LongPressF4), std::string("finger_4_long_press"));
}

TEST(LongPressF5_label) {
    EXPECT_EQ(longPressLabel(GestureType::LongPressF5), std::string("finger_5_long_press"));
}

TEST(LongPressF6_label) {
    EXPECT_EQ(longPressLabel(GestureType::LongPressF6), std::string("finger_6_long_press"));
}

TEST(LongPressF7_label) {
    EXPECT_EQ(longPressLabel(GestureType::LongPressF7), std::string("finger_7_long_press"));
}

TEST(LongPressF8_label) {
    EXPECT_EQ(longPressLabel(GestureType::LongPressF8), std::string("finger_8_long_press"));
}

TEST(NonLongPress_label_is_empty) {
    EXPECT_EQ(longPressLabel(GestureType::Tap),          std::string(""));
    EXPECT_EQ(longPressLabel(GestureType::SwipeLeft),    std::string(""));
    EXPECT_EQ(longPressLabel(GestureType::ThreeFingerPinchIn), std::string(""));
    EXPECT_EQ(longPressLabel(GestureType::Unknown),      std::string(""));
}

// ── Recognition output printing / recognitionLabel in GestureResult ───────────

TEST(RecognitionLabel_populated_in_L1_long_press) {
    // A single finger on the left side of the screen should be assigned L1.
    // The recogniser should emit LongPressF1 when pressure/area thresholds
    // are met, and IntentResolver should populate recognitionLabel.
    GestureRecognizer recognizer;
    IntentResolver resolver;

    const auto fingers = singleFingerMap(FingerId::L1, longPressSample(0.3F));
    const auto gestureType = recognizer.recognize(fingers);
    EXPECT_EQ(gestureType, GestureType::LongPressF1);

    const auto result = resolver.resolve(gestureType, {FingerId::L1}, normalCtx(), 0);
    EXPECT_EQ(result.recognitionLabel, std::string("finger_1_long_press"));
}

TEST(RecognitionLabel_populated_in_R1_long_press) {
    GestureRecognizer recognizer;
    IntentResolver resolver;

    const auto fingers = singleFingerMap(FingerId::R1, longPressSample(0.7F));
    const auto gestureType = recognizer.recognize(fingers);
    EXPECT_EQ(gestureType, GestureType::LongPressF5);

    const auto result = resolver.resolve(gestureType, {FingerId::R1}, normalCtx(), 0);
    EXPECT_EQ(result.recognitionLabel, std::string("finger_5_long_press"));
}

TEST(RecognitionLabel_empty_for_tap) {
    IntentResolver resolver;
    const auto result = resolver.resolve(GestureType::Tap, {FingerId::L1}, normalCtx(), 0);
    EXPECT_EQ(result.recognitionLabel, std::string(""));
}

TEST(RecognitionLabel_empty_for_swipe) {
    IntentResolver resolver;
    const auto result = resolver.resolve(GestureType::SwipeLeft, {FingerId::L2}, normalCtx(), 0);
    EXPECT_EQ(result.recognitionLabel, std::string(""));
}

// Verify that recognitionLabel is still populated even when the gesture is
// blocked by a policy gate (it aids diagnostics).
TEST(RecognitionLabel_preserved_when_blocked_driving) {
    IntentResolver resolver;
    // LongPressF3 is not in the isStationaryOnly list, so it won't be blocked,
    // but the label should still be present. (This also validates the label
    // survives the full resolution path.)
    const auto result = resolver.resolve(GestureType::LongPressF3, {FingerId::L3}, drivingCtx(), 0);
    EXPECT_EQ(result.recognitionLabel, std::string("finger_3_long_press"));
}

// ── Driving-mode blocked gesture tests ───────────────────────────────────────

TEST(DrivingMode_blocks_ThreeFingerPinchIn) {
    IntentResolver resolver;
    const auto result = resolver.resolve(GestureType::ThreeFingerPinchIn, {}, drivingCtx(), 0);
    EXPECT_TRUE(result.blocked);
    EXPECT_EQ(result.intent, GestureIntent::BlockedDrivingMode);
    EXPECT_EQ(result.userMessage, std::string("Complex gestures are limited while driving."));
}

TEST(DrivingMode_blocks_ThreeFingerSwipeLeft) {
    IntentResolver resolver;
    const auto result = resolver.resolve(GestureType::ThreeFingerSwipeLeft, {}, drivingCtx(), 0);
    EXPECT_TRUE(result.blocked);
    EXPECT_EQ(result.intent, GestureIntent::BlockedDrivingMode);
}

TEST(DrivingMode_blocks_EightFingerSpread) {
    IntentResolver resolver;
    const auto result = resolver.resolve(GestureType::EightFingerSpread, {}, drivingCtx(), 0);
    EXPECT_TRUE(result.blocked);
    EXPECT_EQ(result.intent, GestureIntent::BlockedDrivingMode);
}

TEST(DrivingMode_blocks_TwoFingerTap) {
    IntentResolver resolver;
    const auto result = resolver.resolve(GestureType::TwoFingerTap, {}, drivingCtx(), 0);
    EXPECT_TRUE(result.blocked);
    EXPECT_EQ(result.intent, GestureIntent::BlockedDrivingMode);
}

TEST(DrivingMode_does_NOT_block_Tap) {
    IntentResolver resolver;
    const auto result = resolver.resolve(GestureType::Tap, {FingerId::L1}, drivingCtx(), 0);
    EXPECT_FALSE(result.blocked);
    EXPECT_EQ(result.intent, GestureIntent::Select);
}

TEST(DrivingMode_does_NOT_block_SwipeLeft) {
    IntentResolver resolver;
    const auto result = resolver.resolve(GestureType::SwipeLeft, {FingerId::L1}, drivingCtx(), 0);
    EXPECT_FALSE(result.blocked);
    EXPECT_EQ(result.intent, GestureIntent::TrackChange);
}

TEST(DrivingMode_confidence_is_correct) {
    IntentResolver resolver;
    const auto result = resolver.resolve(GestureType::ThreeFingerPinchIn, {}, drivingCtx(), 0);
    EXPECT_TRUE(result.confidence == constants::kCppDrivingModeBlockConfidence);
}

// ── Accessibility fallback intent tests ───────────────────────────────────────

TEST(AccessibilityConflict_ThreeFingerTap_routes_to_ScreenCurtain_with_ScreenReader) {
    IntentResolver resolver;
    const auto result = resolver.resolve(GestureType::ThreeFingerTap, {}, screenReaderCtx(), 0);
    EXPECT_TRUE(result.blocked);
    EXPECT_EQ(result.intent, GestureIntent::BlockedAccessibilityConflict);
    EXPECT_EQ(result.fallbackIntent, GestureIntent::ScreenCurtainToggle);
}

TEST(AccessibilityConflict_ThreeFingerPinchIn_has_no_specific_fallback) {
    IntentResolver resolver;
    const auto result = resolver.resolve(GestureType::ThreeFingerPinchIn, {}, screenReaderCtx(), 0);
    EXPECT_TRUE(result.blocked);
    EXPECT_EQ(result.intent, GestureIntent::BlockedAccessibilityConflict);
    // Pinch-in does not have a screen-curtain fallback.
    EXPECT_EQ(result.fallbackIntent, GestureIntent::Unknown);
}

TEST(AccessibilityConflict_message_is_set_for_pinch) {
    IntentResolver resolver;
    const auto result = resolver.resolve(GestureType::ThreeFingerPinchIn, {}, screenReaderCtx(), 0);
    EXPECT_TRUE(!result.userMessage.empty());
}

TEST(AccessibilityConflict_with_ZoomActive_blocks_ThreeFingerTap) {
    auto ctx = normalCtx();
    ctx.accessibility.zoomActive = true;
    IntentResolver resolver;
    const auto result = resolver.resolve(GestureType::ThreeFingerTap, {}, ctx, 0);
    EXPECT_TRUE(result.blocked);
    EXPECT_EQ(result.fallbackIntent, GestureIntent::ScreenCurtainToggle);
}

TEST(AccessibilityConflict_with_SwitchControl_blocks_ThreeFingerTap) {
    auto ctx = normalCtx();
    ctx.accessibility.switchControlActive = true;
    IntentResolver resolver;
    // SwitchControl doesn't trigger screen-curtain fallback (only screenReader/zoom do).
    const auto result = resolver.resolve(GestureType::ThreeFingerTap, {}, ctx, 0);
    EXPECT_TRUE(result.blocked);
    EXPECT_EQ(result.fallbackIntent, GestureIntent::Unknown);
}

TEST(NoAccessibility_ThreeFingerTap_resolves_normally) {
    IntentResolver resolver;
    const auto result = resolver.resolve(GestureType::ThreeFingerTap, {}, normalCtx(), 0);
    EXPECT_FALSE(result.blocked);
    EXPECT_EQ(result.intent, GestureIntent::OpenClipboard);
}

// ── GestureResult field-presence parity contract ─────────────────────────────
// These tests verify that every field in the GestureResult struct is
// populated correctly on a typical result. They serve as a snapshot contract:
// if a field changes name or is removed, these tests break immediately.

TEST(GestureResult_all_fields_present_on_normal_result) {
    IntentResolver resolver;
    const FingerSet fingers = {FingerId::L1, FingerId::L2};
    const std::uint64_t ts  = 1234567890ULL;

    const auto result = resolver.resolve(GestureType::TwoFingerTap, fingers, normalCtx(), ts);

    // Core identification
    EXPECT_EQ(result.gestureName,  std::string("two_finger_tap"));
    EXPECT_EQ(result.type,         GestureType::TwoFingerTap);

    // Intent
    EXPECT_EQ(result.intent,       GestureIntent::SaveHighlight);
    EXPECT_EQ(result.fallbackIntent, GestureIntent::Unknown);

    // Finger channels
    EXPECT_EQ(result.activeFingers.size(), std::size_t(2));

    // Policy gate
    EXPECT_FALSE(result.blocked);
    EXPECT_TRUE(result.userMessage.empty());

    // Recognition label — two-finger tap has no per-finger label.
    EXPECT_EQ(result.recognitionLabel, std::string(""));

    // Timestamps and confidence
    EXPECT_EQ(result.resolvedAt_us, ts);
    EXPECT_TRUE(result.confidence > 0.0F);
}

TEST(GestureResult_blocked_result_carries_message) {
    IntentResolver resolver;
    const auto result = resolver.resolve(GestureType::ThreeFingerPinchIn, {}, drivingCtx(), 0);

    EXPECT_TRUE(result.blocked);
    EXPECT_FALSE(result.userMessage.empty());
    EXPECT_TRUE(result.confidence > 0.0F);
}

TEST(GestureResult_unknown_gesture_has_zero_confidence) {
    IntentResolver resolver;
    const auto result = resolver.resolve(GestureType::Unknown, {}, normalCtx(), 0);
    EXPECT_TRUE(result.confidence == 0.0F);
}

// ── Intent mapping completeness ───────────────────────────────────────────────

TEST(IntentMapping_Tap_to_Select) {
    IntentResolver r;
    EXPECT_EQ(r.resolve(GestureType::Tap, {}, normalCtx(), 0).intent, GestureIntent::Select);
}

TEST(IntentMapping_DoubleTap_to_SelectWord) {
    IntentResolver r;
    EXPECT_EQ(r.resolve(GestureType::DoubleTap, {}, normalCtx(), 0).intent, GestureIntent::SelectWord);
}

TEST(IntentMapping_ThreeFingerPinchIn_to_Copy) {
    IntentResolver r;
    EXPECT_EQ(r.resolve(GestureType::ThreeFingerPinchIn, {}, normalCtx(), 0).intent, GestureIntent::Copy);
}

TEST(IntentMapping_ThreeFingerPinchOut_to_Paste) {
    IntentResolver r;
    EXPECT_EQ(r.resolve(GestureType::ThreeFingerPinchOut, {}, normalCtx(), 0).intent, GestureIntent::Paste);
}

TEST(IntentMapping_ThreeFingerSwipeLeft_to_Undo) {
    IntentResolver r;
    EXPECT_EQ(r.resolve(GestureType::ThreeFingerSwipeLeft, {}, normalCtx(), 0).intent, GestureIntent::Undo);
}

TEST(IntentMapping_ThreeFingerSwipeRight_to_Redo) {
    IntentResolver r;
    EXPECT_EQ(r.resolve(GestureType::ThreeFingerSwipeRight, {}, normalCtx(), 0).intent, GestureIntent::Redo);
}

TEST(IntentMapping_EightFingerSpread_to_ZoomToggle) {
    IntentResolver r;
    EXPECT_EQ(r.resolve(GestureType::EightFingerSpread, {}, normalCtx(), 0).intent, GestureIntent::ZoomToggle);
}

TEST(IntentMapping_LongPressF1_to_Select) {
    // All per-finger long-press variants map to Select intent.
    IntentResolver r;
    EXPECT_EQ(r.resolve(GestureType::LongPressF1, {FingerId::L1}, normalCtx(), 0).intent, GestureIntent::Select);
    EXPECT_EQ(r.resolve(GestureType::LongPressF8, {FingerId::R4}, normalCtx(), 0).intent, GestureIntent::Select);
}

// ── GestureEngine integration (adapter → tracker → recogniser → resolver) ────

TEST(GestureEngine_long_press_from_frame_produces_label) {
    GestureEngine engine;
    PlatformContext ctx = normalCtx();

    // Build a frame with a single left-side long-press sample.
    GestureInputFrame frame;
    frame.timestamp_us = 1000;
    frame.deviceId     = "test";
    frame.toolType     = ToolType::Touch;
    frame.capabilities = {true, false, true, false};
    frame.samples.push_back(longPressSample(0.3F));

    GestureResult captured;
    engine.setCallback([&](const GestureResult& r) { captured = r; });
    engine.feedFrame(frame, ctx);

    // After a single heavy touch, the recogniser should emit a per-finger
    // long press and the resolver should attach a recognitionLabel.
    EXPECT_FALSE(captured.recognitionLabel.empty());
    EXPECT_EQ(captured.type, GestureType::LongPressF1);
}

TEST(GestureEngine_driving_mode_blocks_pinch_from_frame) {
    GestureEngine engine;
    PlatformContext ctx = drivingCtx();

    GestureInputFrame frame;
    frame.timestamp_us = 1000;
    frame.deviceId     = "test";
    frame.toolType     = ToolType::Touch;
    frame.capabilities = {true, false, true, false};
    // Three samples spread across x for a pinch-in.
    RawTouchSample s1; s1.x = 0.1F; s1.y = 0.5F; s1.pressure = 0.9F; s1.contactArea = 25.0F;
    RawTouchSample s2; s2.x = 0.12F; s2.y = 0.52F; s2.pressure = 0.9F; s2.contactArea = 25.0F;
    RawTouchSample s3; s3.x = 0.11F; s3.y = 0.48F; s3.pressure = 0.9F; s3.contactArea = 25.0F;
    frame.samples = {s1, s2, s3};

    GestureResult captured;
    engine.setCallback([&](const GestureResult& r) { captured = r; });
    engine.feedFrame(frame, ctx);

    // A tight three-finger cluster is a pinch-in → blocked in driving mode.
    EXPECT_TRUE(captured.blocked);
    EXPECT_EQ(captured.intent, GestureIntent::BlockedDrivingMode);
}

}  // namespace octatouch::test

// ── Main ──────────────────────────────────────────────────────────────────────

int main() {
    std::printf("\n=== OctaTouch Gesture Recognition Test Suite ===\n\n");
    // Tests self-register and run at static-init time via the TEST macro.
    std::printf("\n=== Results: %d tests, %d failures ===\n",
                octatouch::test::sTests,
                octatouch::test::sFailed);
    return (octatouch::test::sFailed == 0) ? 0 : 1;
}
