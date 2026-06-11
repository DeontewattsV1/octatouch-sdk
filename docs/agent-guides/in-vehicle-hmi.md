# In-Vehicle HMI Integration Guide

> Load this guide when: working in `integrations/in-vehicle-hmi/`, designing automotive UX screens,
> or modifying the driving-mode gate in `IntentResolver`.

## Safety-First Architecture Principle

The in-vehicle integration uses a **deliberately asymmetric** design:

| State | Available Gestures | Rationale |
|-------|--------------------|-----------|
| Driving | Single-tap, short swipe | Minimize eyes-off-road time |
| Parked | Full OctaTouch gesture set | Safe to use rich interactions |

This asymmetry is enforced **at the architecture level** in `IntentResolver::resolve()`, not through
UI warnings alone. Never move safety gates into the adapter or UI layer.

---

## State Detection

Vehicle state is determined by CAN bus signals:

```cpp
// integrations/in-vehicle-hmi/CANBusMonitor.cpp
// Reads gear position + handbrake status → VehicleState
VehicleState CANBusMonitor::poll() const;
```

The `DrivingModeGate` translates `CANBusMonitor` output into `PlatformContext.vehicleState`.
All adapters must keep `PlatformContext.vehicleState` current on every frame.

---

## UI Screen Inventory (from spec)

### Section 1.1 — Home Screen (Gesture Panel)
Three regions:
- **Region A (Header):** OctaTouch icon, mode pill ("Driving" | "Parked")
- **Region B (Cards):** Toggle basic gestures, audio feedback, clipboard access (parked only)
- **Region C (Footer):** Safety notice + link to gesture rules

### Section 1.2 — Gesture Rules Detail Screen
- "While Driving — Allowed": single-tap, short swipe
- "While Driving — Blocked": multi-finger, complex shortcuts
- "When Parked — Allowed": full gesture set, practice mode CTA

### Section 1.3 — Gesture Practice Screen (Parked Only)
State enforced at system level before screen renders.
Three step-cards: Select Text → Save & Copy → Undo & Redo.

### Section 1.4 — Toast Notifications
- **Driving-Mode Restriction Toast:** auto-dismisses in 3 s, no modal
- **Error Toast (gesture not recognized):** auto-dismisses in 3 s, logged to analytics

---

## OEM Integration Points

| Setting | Where to configure |
|---------|--------------------|
| Toast display duration | `OctaTouch in-vehicle SDK configuration manifest` |
| Fade animation timing | Manifest |
| Audio trigger threshold | Manifest |
| Localization strings | Externalized — all toast copy is i18n-ready |

---

## Analytics Pipeline
All gesture errors, usage events, and state transitions are logged to the OctaTouch web controller.
This telemetry supports gesture model refinement and OEM reporting dashboards.
Logging is non-blocking — never wait on analytics in the hot path.

---

## AD7879 Resistive Hardware
For panels using the AD7879 resistive touch controller, see `docs/agent-guides/ad7879-firmware.md`.
Key constraint: interrupt-driven touch delivery must meet the **≤ 16 ms** latency budget.
