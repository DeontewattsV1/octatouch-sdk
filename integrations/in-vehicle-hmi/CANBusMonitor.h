#pragma once

#include <array>
#include <cstddef>
#include <cstdint>
#include <optional>
#include <vector>

#include "Types.h"

namespace octatouch::vehicle {

enum class GearPosition {
    Park,
    Reverse,
    Neutral,
    Drive,
    Low,
    Unknown,
};

struct CANFrame {
    std::uint32_t id{0};
    std::array<std::uint8_t, 8> data{};
    std::size_t size{8};
};

struct CANSignalSnapshot {
    GearPosition gear{GearPosition::Unknown};
    bool handbrakeEngaged{false};
    float speedKph{0.0F};
    bool hasGear{false};
    bool hasHandbrake{false};
    bool hasSpeed{false};
};

class CANBusMonitor {
public:
    void ingest(const CANFrame& frame);
    void reset();
    CANSignalSnapshot snapshot() const;
    VehicleState vehicleState() const;

private:
    std::optional<GearPosition> gear_{};
    std::optional<bool> handbrakeEngaged_{};
    std::optional<float> speedKph_{};
};

}  // namespace octatouch::vehicle
