#include <cassert>
#include <iostream>

#include "CANBusMonitor.h"

int main() {
    using namespace octatouch;
    using namespace octatouch::vehicle;

    CANBusMonitor monitor;

    CANFrame gear{};
    gear.id = 0x100;
    gear.data[0] = 0;
    monitor.ingest(gear);

    CANFrame brake{};
    brake.id = 0x101;
    brake.data[0] = 1;
    monitor.ingest(brake);

    CANFrame speed{};
    speed.id = 0x102;
    speed.data[0] = 0;
    speed.data[1] = 0;
    monitor.ingest(speed);

    assert(monitor.vehicleState() == VehicleState::Parked);

    speed.data[0] = 0xFA; // 2.50 kph
    speed.data[1] = 0x00;
    monitor.ingest(speed);
    assert(monitor.vehicleState() == VehicleState::Driving);

    const auto snapshot = monitor.snapshot();
    assert(snapshot.hasGear);
    assert(snapshot.hasHandbrake);
    assert(snapshot.hasSpeed);
    assert(snapshot.speedKph == 2.5F);

    std::cout << "can bus monitor tests passed\n";
    return 0;
}
