# Gesture Engine Architecture

> Load this guide when: making changes to `core/`, adding gesture types, or debugging recognition failures.

## The Assembly-Line Analogy

Think of the pipeline like a car assembly line — each station does one job and passes the part forward:

| Station | Component | Responsibility |
|---------|-----------|----------------|
| 1 — Parts Sorter | `FingerTracker` | Assign `FingerId` (L1–L4, R1–R4) to raw touch samples via spatial heuristics |
| 2 — Pattern Inspector | `GestureRecognizer` | Map the active finger set to a `GestureType` |
| 3 — Quality Control | `IntentResolver` | Apply safety gates, map `GestureType` → `GestureIntent`, emit `GestureResult` |

**Analogy limit:** Unlike a real assembly line, the pipeline runs synchronously on every frame — there is no
buffering between stages. Keep each stage's hot path under 1 ms.

---

## Stage 1: FingerTracker

**Input:** `GestureInputFrame` (vector of `RawTouchSample`)
**Output:** `std::map<FingerId, RawTouchSample>`

Uses deterministic spatial heuristics (left/right half, vertical position) to assign stable `FingerId` labels
across frames. This is not a biometric model — identity is positional, not biometric.

**Key invariant:** A `FingerId` assigned on frame N must not switch to a different finger on frame N+1
without a contact-lift event.

---

## Stage 2: GestureRecognizer

**Input:** `std::map<FingerId, RawTouchSample>`
**Output:** `GestureType`

Recognition decision tree (current heuristics in `core/src/GestureRecognizer.cpp`):

```
fingers.size() == 0  → Unknown
fingers.size() == 1  → LongPress | SwipeLeft/Right/Up/Down | Tap
fingers.size() == 2  → TwoFingerTap
fingers.size() == 3  → ThreeFingerPinchIn | ThreeFingerPinchOut | ThreeFingerSwipeLeft/Right | ThreeFingerTap
fingers.size() >= 8  → EightFingerSpread (other 8-finger types TBD)
```

**When adding a new GestureType:**
1. Add the enum value to `Types.h`.
2. Add the recognition branch to `GestureRecognizer::recognize()`.
3. Add the intent mapping in `IntentResolver::mapPrimitiveToIntent()`.
4. Update `docs/gesture-vocabulary.md` — this is the binding declaration.
5. Add a unit test in `tests/unit/smoke_test.cpp`.

---

## Stage 3: IntentResolver

**Input:** `GestureType`, `FingerSet`, `PlatformContext`, `timestamp_us`
**Output:** `GestureResult`

Two safety gates run before intent mapping (in this order):

```cpp
// Gate 1: Accessibility conflict
if (isAccessibilityConflict(primitive, ctx))
    return BlockedAccessibilityConflict;

// Gate 2: Driving mode
if (ctx.vehicleState == Driving && isStationaryOnly(primitive))
    return BlockedDrivingMode;

// Safe — map to intent
return mapPrimitiveToIntent(primitive);
```

**Rule:** `IntentResolver` is the **only** place in the codebase that should block or remap intents.
Adapter code must never gate intents based on vehicle state or accessibility flags.

---

## Data Types Quick Reference

```cpp
struct GestureInputFrame {
    std::vector<RawTouchSample> samples;
    std::uint64_t capturedAt_us;
};

struct GestureResult {
    GestureType type;
    GestureIntent intent;
    FingerSet activeFingers;
    float confidence;           // 0.0 – 1.0
    std::uint64_t resolvedAt_us;
    std::string gestureName;
};

struct PlatformContext {
    VehicleState vehicleState;
    AccessibilityFlags accessibility;
    CapabilityFlags capabilities;
};
```

---

## Latency Budget

| Stage | Budget |
|-------|--------|
| FingerTracker | < 0.5 ms |
| GestureRecognizer | < 0.5 ms |
| IntentResolver | < 0.1 ms |
| **Total pipeline** | **≤ 1.0 ms** |
| **Driving-safe event delivery** | **≤ 16 ms** (end-to-end from hardware interrupt) |

Latency tests live in `tests/latency/`. Any regression is a **release blocker**.
