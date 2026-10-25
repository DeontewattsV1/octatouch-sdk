#include <cassert>
#include <cstdint>
#include <iostream>
#include <vector>

#include "OctaTouchRealtimeEngine.h"

using octatouch::CapabilityFlags;
using octatouch::GestureInputFrame;
using octatouch::PlatformContext;
using octatouch::RawTouchSample;
using octatouch::ToolType;
using octatouch::VehicleState;
using octatouch::native::IngestResponse;
using octatouch::native::RealtimeGestureEngine;

namespace {

RawTouchSample touch(float x, float y, int nativeId, float pressure = 0.6F) {
    return RawTouchSample{x, y, pressure, 16.0F, 0, nativeId};
}

GestureInputFrame frame(std::uint64_t timestamp_us, std::vector<RawTouchSample> samples) {
    GestureInputFrame input;
    input.timestamp_us = timestamp_us;
    input.samples = std::move(samples);
    input.deviceId = "native-runtime-smoke";
    input.toolType = ToolType::Touch;
    input.capabilities = CapabilityFlags{};
    return input;
}

IngestResponse runSequence(RealtimeGestureEngine& engine, const std::vector<GestureInputFrame>& frames,
                           const PlatformContext& context) {
    IngestResponse last;
    for (const auto& value : frames) {
        auto response = engine.ingestFrame(value, context);
        if (response.hasResult) {
            last = response;
        }
    }
    return last;
}

}  // namespace

int main() {
    RealtimeGestureEngine engine;

    PlatformContext parked;
    parked.vehicleState = VehicleState::Parked;

    auto tap = runSequence(engine,
                           {
                               frame(0, {touch(0.4F, 0.4F, 1)}),
                               frame(120000, {}),
                           },
                           parked);
    assert(tap.hasResult);
    assert(tap.result.core.gestureName == "tap");
    assert(octatouch::to_string(tap.result.core.intent) == "select");

    engine.reset();
    auto pinchIn = runSequence(engine,
                               {
                                   frame(0, {touch(0.2F, 0.5F, 1), touch(0.5F, 0.5F, 2), touch(0.8F, 0.5F, 3)}),
                                   frame(100000, {touch(0.38F, 0.5F, 1), touch(0.5F, 0.5F, 2), touch(0.62F, 0.5F, 3)}),
                                   frame(140000, {}),
                               },
                               parked);
    assert(pinchIn.hasResult);
    assert(pinchIn.result.core.gestureName == "three_finger_pinch_in");
    assert(octatouch::to_string(pinchIn.result.core.intent) == "copy");

    engine.reset();
    auto swipeLeft = runSequence(engine,
                                 {
                                     frame(0, {touch(0.55F, 0.4F, 1), touch(0.65F, 0.5F, 2), touch(0.75F, 0.6F, 3)}),
                                     frame(100000, {touch(0.25F, 0.4F, 1), touch(0.35F, 0.5F, 2), touch(0.45F, 0.6F, 3)}),
                                     frame(160000, {}),
                                 },
                                 parked);
    assert(swipeLeft.hasResult);
    assert(swipeLeft.result.core.gestureName == "three_finger_swipe_left");
    assert(octatouch::to_string(swipeLeft.result.core.intent) == "undo");

    engine.reset();
    PlatformContext driving;
    driving.vehicleState = VehicleState::Driving;
    auto blockedDriving = runSequence(engine,
                                      {
                                          frame(0, {touch(0.2F, 0.5F, 1), touch(0.5F, 0.5F, 2), touch(0.8F, 0.5F, 3)}),
                                          frame(100000, {touch(0.38F, 0.5F, 1), touch(0.5F, 0.5F, 2), touch(0.62F, 0.5F, 3)}),
                                          frame(140000, {}),
                                      },
                                      driving);
    assert(blockedDriving.hasResult);
    assert(octatouch::to_string(blockedDriving.result.core.intent) == "blocked_driving_mode");
    assert(blockedDriving.result.core.blocked);
    assert(blockedDriving.result.core.userMessage == "Complex gestures are limited while driving.");

    engine.reset();
    PlatformContext accessibility;
    accessibility.vehicleState = VehicleState::Parked;
    accessibility.accessibility.screenReaderActive = true;
    auto blockedAccessibility = runSequence(engine,
                                            {
                                                frame(0, {touch(0.4F, 0.4F, 1), touch(0.5F, 0.5F, 2), touch(0.6F, 0.6F, 3)}),
                                                frame(140000, {}),
                                            },
                                            accessibility);
    assert(blockedAccessibility.hasResult);
    assert(blockedAccessibility.result.core.gestureName == "three_finger_tap");
    assert(octatouch::to_string(blockedAccessibility.result.core.intent) == "blocked_accessibility_conflict");
    assert(blockedAccessibility.result.core.blocked);
    assert(octatouch::to_string(blockedAccessibility.result.core.fallbackIntent) == "screen_curtain_toggle");

    std::cout << "native runtime smoke tests passed\n";
    return 0;
}
