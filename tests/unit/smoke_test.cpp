#include <cstdlib>
#include <iostream>

#include "GestureEngine.h"

int main() {
    using namespace octatouch;

    GestureEngine engine;
    GestureInputFrame frame;
    frame.timestamp_us = 123456;
    frame.deviceId = "smoke-device";
    frame.samples = {
        RawTouchSample{0.10F, 0.35F, 0.50F, 12.0F, 123456, 1},
        RawTouchSample{0.15F, 0.42F, 0.55F, 13.0F, 123456, 2},
        RawTouchSample{0.18F, 0.50F, 0.60F, 14.0F, 123456, 3},
    };

    PlatformContext context;
    context.vehicleState = VehicleState::Parked;

    const auto result = engine.feedFrame(frame, context);

    if (result.type == GestureType::Unknown) {
        std::cerr << "Gesture recognition smoke test failed\n";
        return EXIT_FAILURE;
    }

    std::cout << "gesture=" << result.gestureName << " intent=" << to_string(result.intent) << "\n";
    return EXIT_SUCCESS;
}
