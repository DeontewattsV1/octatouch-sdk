# iOS Native Bridge Guide

## Objective

Replace the Expo-only parity runtime with a native iOS bridge that keeps the same result envelope, while preserving the repository's deterministic gesture vocabulary and safety gates.

## What is now implemented

- Local Expo module at `apps/expo-demo/modules/octatouch-native`
- Shared C++ realtime gesture runtime at `apps/expo-demo/modules/octatouch-native/shared`
- Objective-C++ host that converts JS dictionaries into `GestureInputFrame` and `PlatformContext`
- Swift Expo module surface named `OctaTouchNative`
- App-side engine client that prefers native sync mode when available and falls back to the JS parity runtime otherwise
- Native runtime smoke test compiled by CMake

## Runtime contract

The native bridge intentionally returns the same shape that the current screens already consume:

- `result`: final gesture output after release
- `live`: active tracking information during a touch sequence

This makes the UI layer transport-agnostic.

## Prebuild path

From `apps/expo-demo/`:

```bash
npx expo prebuild --platform ios
npx expo run:ios
```

Because this is a local Expo module, iOS compilation must happen on a machine with Xcode and CocoaPods available.

## Important boundary

This is a synchronous Expo native bridge, not a JSI/TurboModule path yet.

That means:

- the app can already switch from JS parity runtime to native iOS execution
- the shared C++ runtime is in place for future JSI promotion
- the next optimization step is replacing dictionary marshaling with direct host-object / JSI calls

## Suggested next step

Add an event-coalescing input adapter for `UITouch` so the native bridge consumes predicted and coalesced touch samples instead of only JS responder snapshots.
