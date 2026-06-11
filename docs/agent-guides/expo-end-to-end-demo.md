# Expo End-to-End Demo Guide

## Goal

Provide the first real mobile execution path for OctaTouch without waiting on a native bridge.

## What this adds

- `apps/expo-demo/` - a runnable Expo reference app
- `apps/expo-demo/src/runtime/octatouchRuntime.js` - JavaScript parity runtime for rapid touch validation
- `apps/expo-demo/src/components/TouchSurface.jsx` - responder-based touch capture surface
- `tests/runtime/expo_runtime_smoke.mjs` - logic-level smoke tests for the runtime

## Why this exists

The C++ scaffold is the canonical engine, but it is not directly consumable in Expo managed workflows. This demo narrows the biggest product risk first: whether the gesture vocabulary and safety gating feel correct on an actual mobile surface.

## Recommended next native step

After the Expo demo is validated on device:

1. Build a JSI bridge or Swift wrapper for the C++ engine.
2. Replace the parity runtime with the canonical core.
3. Add an iOS 26 native surface for real Liquid Glass on supported devices.
4. Measure latency against the 16 ms target with native instrumentation.
