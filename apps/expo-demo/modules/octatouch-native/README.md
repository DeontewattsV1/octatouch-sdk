# OctaTouch Native Module

Local Expo module for iOS that wraps the C++ realtime gesture runtime and exposes synchronous frame ingestion to the Expo demo.

## Included

- Expo module surface: `OctaTouchNative`
- Objective-C++ bridge host
- Shared C++ realtime engine compatible with repository tests

## Contract

```ts
OctaTouchNative.getCapabilities()
OctaTouchNative.ingestFrame(frame, context)
OctaTouchNative.reset()
```

## Current scope

This is the first native iOS bridge. It targets feature parity with the Expo JavaScript runtime and keeps the same result envelope so the app can swap engines without changing screen logic.
