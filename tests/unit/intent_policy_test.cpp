#include <cassert>
#include <iostream>

#include "IntentResolver.h"

int main() {
    using namespace octatouch;

    IntentResolver resolver;
    FingerSet fingers{FingerId::L1, FingerId::R1, FingerId::R2};

    PlatformContext driving;
    driving.vehicleState = VehicleState::Driving;
    const auto blockedDriving = resolver.resolve(GestureType::ThreeFingerPinchIn, fingers, driving, 1000);
    assert(blockedDriving.blocked);
    assert(blockedDriving.intent == GestureIntent::BlockedDrivingMode);
    assert(blockedDriving.userMessage == "Complex gestures are limited while driving.");

    PlatformContext accessibility;
    accessibility.vehicleState = VehicleState::Parked;
    accessibility.accessibility.screenReaderActive = true;
    const auto blockedAccessibility = resolver.resolve(GestureType::ThreeFingerTap, fingers, accessibility, 2000);
    assert(blockedAccessibility.blocked);
    assert(blockedAccessibility.intent == GestureIntent::BlockedAccessibilityConflict);
    assert(blockedAccessibility.fallbackIntent == GestureIntent::ScreenCurtainToggle);

    PlatformContext parked;
    parked.vehicleState = VehicleState::Parked;
    const auto allowed = resolver.resolve(GestureType::Tap, {FingerId::L1}, parked, 3000);
    assert(!allowed.blocked);
    assert(allowed.intent == GestureIntent::Select);

    std::cout << "intent policy tests passed\n";
    return 0;
}
