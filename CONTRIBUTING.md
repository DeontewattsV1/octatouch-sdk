# Contributing to OctaTouch

OctaTouch is a universal gesture engine. It runs on C++, iOS native, and as a JS parity fallback. The eight-channel finger identity model and the `GestureResult` contract are the two things you must understand before touching any runtime code.

---

## Architecture in 30 seconds

```
touch hardware / pointer events
        │
   FingerTracker          assigns L1–L4 / R1–R4 channel identities
        │
  GestureRecognizer       classifies the gesture type (tap, swipe, long press …)
        │
   IntentResolver         applies policy gates (driving mode, accessibility),
                          maps gesture type → intent, populates GestureResult
        │
    GestureResult         the output contract; same shape across all runtimes
```

The JS parity runtime (`octatouchRuntime.js`) mirrors every step using time/motion heuristics instead of contact-area heuristics, but produces structurally identical `GestureResult` objects.

---

## Before you write code

1. **Read `core/include/GestureResult.h`** — this is the public contract. All fields must stay present and semantically stable across runtimes.
2. **Read `core/include/Constants.h`** — all recognition thresholds live here. If you add a new threshold, add it here first, then add the matching entry in `apps/expo-demo/src/runtime/octatouchConstants.js`.
3. **Never change a threshold in only one place.** C++ and JS must use the same values. The test suite will catch parity drift, but prevention is better.

---

## Running tests

```bash
# C++ suite
cmake -B build && cmake --build build
./build/gesture_recognition_test
./build/intent_policy_test
./build/octatouch_smoke_test
./build/canbus_monitor_test

# JS parity smoke tests
node tests/runtime/expo_runtime_smoke.mjs
node tests/runtime/expo_policy_runtime_smoke.mjs
```

All tests must pass before submitting a PR.

---

## Adding a new gesture type

1. Add a new variant to `GestureType` in `core/include/Types.h`.
2. Add a `to_string` case in `core/src/Types.cpp`.
3. If it is a long-press variant, add a `longPressLabel` case in `Types.cpp`.
4. Handle it in `GestureRecognizer::recognize()`.
5. Map it to an intent in `IntentResolver::mapPrimitiveToIntent()`.
6. Add the same gesture name to `GestureType` in `octatouchRuntime.js`.
7. Add the same intent mapping in `mapIntent()` in `octatouchRuntime.js`.
8. Write a test in `tests/unit/gesture_recognition_test.cpp`.

---

## Adding a new platform adapter

Copy `platforms/web/PointerEventAdapter.ts` as a starting point. Your adapter must:

- Produce `GestureInputFrame` objects with normalized `x`/`y` (0–1) and a valid `timestamp_us`.
- Call `GestureEngine::feedFrame()` or the equivalent `ingestFrame()` on the JS engine.
- Never interpret gestures itself — that belongs in the recogniser layer.

---

## JS/C++ parity requirement

The JS runtime is used on platforms where the native C++ path is unavailable. It must produce `GestureResult` objects with the same field names and semantics as the C++ struct. The relevant fields are:

| C++ field | JS field | Notes |
|---|---|---|
| `gestureName` | `gestureName` | snake_case |
| `type` | `type` | same string |
| `intent` | `intent` | same string |
| `fallbackIntent` | `fallbackIntent` | same string |
| `activeFingers` | `activeFingers` | array of `"L1"` … `"R4"` |
| `confidence` | `confidence` | float 0–1 |
| `blocked` | `blocked` | boolean |
| `userMessage` | `userMessage` | string |
| `recognitionLabel` | `recognitionLabel` | `"finger_N_long_press"` or `""` |
| `resolvedAt_us` | `resolvedAt_us` | microseconds |

If you add a field to `GestureResult.h`, add it to the JS `resolveResult()` function in the same PR.

---

## Code style

- C++17, `-Wall -Wextra -Wpedantic`, no raw pointer ownership.
- No magic numbers — use `constants::k*` or add a new constant.
- Comments explain *why*, not *what*. The code explains what.
- Keep functions short. If a function needs a comment to explain what it does, split it.
