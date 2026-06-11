# OctaTouch Architecture

## Eight-channel finger identity

OctaTouch tracks up to eight fingers simultaneously using spatial heuristics. Fingers on the left half of the screen are assigned L1–L4 (sorted top-to-bottom then left-to-right). Fingers on the right half are assigned R1–R4 the same way.

```
Left half             Right half
  L1 L2 L3 L4        R1 R2 R3 R4
  (finger 1–4)       (finger 5–8)
```

This assignment is deterministic: the same physical gesture always produces the same channel mapping, which makes per-finger long-press labels predictable.

## Pipeline stages

### 1. Adapter (platform layer)
Converts raw platform events (UITouch, PointerEvent, etc.) into normalized `GestureInputFrame` structs with `x`/`y` in [0, 1] and `timestamp_us` in microseconds. No gesture interpretation happens here.

### 2. FingerTracker
Takes a `GestureInputFrame` and assigns channel identities (L1–R4) to each touch sample. Returns a `std::map<FingerId, RawTouchSample>`.

### 3. GestureRecognizer
Takes the channel map and classifies it into a `GestureType`. For single-finger contacts it uses contact-area and pressure thresholds (C++) or hold-duration and movement (JS parity). Multi-finger contacts use spread, movement, and tap-count heuristics.

### 4. IntentResolver
Takes the `GestureType`, the active `FingerSet`, and the `PlatformContext` (vehicle state + accessibility flags). It applies two policy gates:

- **Accessibility gate**: if a system accessibility mode conflicts with a three-finger gesture, the intent is set to `BlockedAccessibilityConflict` and a `fallbackIntent` is provided where possible.
- **Driving-mode gate**: if the vehicle is moving, stationary-only multi-finger gestures are blocked with `BlockedDrivingMode`.

If neither gate fires, the type is mapped to a semantic `GestureIntent` (copy, paste, undo, select, etc.).

## GestureResult contract

```
gestureName       "long_press" | "tap" | …    (snake_case, matches to_string())
type              GestureType enum value
intent            GestureIntent enum value
fallbackIntent    GestureIntent (Unknown if no fallback)
activeFingers     ["L1", "R2", …]
confidence        float 0–1
blocked           bool
userMessage       string (empty when not blocked)
recognitionLabel  "finger_N_long_press" | ""
resolvedAt_us     uint64 microseconds
```

All runtimes (C++, JS, iOS native bridge) emit this shape. The iOS bridge serializes the struct to a dictionary before crossing the Objective-C++ boundary.

## 16 ms latency budget

The pipeline must resolve intent within 16 ms of the last touch event to stay within one frame of a 60 Hz display. The C++ core is designed to be allocation-free on the hot path. The JS parity runtime is intended for prototyping and developer-device testing only — do not use it in a production automotive HMI.

## Policy messages

Blocked gestures produce a `userMessage` suitable for a non-modal 3-second toast (`DrivingModeGate::toastFor()`). The message must not use technical language — it is shown to end users.
