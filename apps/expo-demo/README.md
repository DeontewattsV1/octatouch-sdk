# OctaTouch Expo Demo

This is a runnable Expo reference app for OctaTouch.

## What it does

- renders the uploaded OctaTouch Expo design system
- captures real touch input from a React Native responder surface
- runs a JavaScript parity runtime that mirrors the core C++ pipeline
- applies vehicle-state and accessibility conflict gating
- shows live gesture telemetry and recent gesture history

## Why the runtime is JavaScript

The repository already contains the canonical C++ core. Expo managed apps cannot consume that core directly without a native bridge or JSI module, so this demo includes a parity runtime in JavaScript for rapid mobile validation.

## Run

```bash
cd apps/expo-demo
npm install
npm run start
```

## Validate logic only

```bash
npm run test:runtime
```


## Native iOS bridge

A local Expo module now lives in `modules/octatouch-native/`. When available, the app prefers the native sync engine and falls back to the JavaScript parity runtime on platforms where the module is absent.
