# OctaTouch Repo Guide

## Why
OctaTouch standardizes gesture intent across operating systems, engines, and constrained hardware.

## What
This repo contains the platform-agnostic core, reference adapters, and integration surfaces.

## How
- Keep the canonical gesture vocabulary stable.
- Do not silently remap gestures per platform.
- Preserve the pipeline order: FingerTracker → GestureRecognizer → IntentResolver.
- Prefer typed interfaces over ad hoc payloads.
- Keep platform code limited to capture/translate/feed.
- Gate restricted intents with accessibility and driving-state checks.
- Treat latency regressions as release blockers.

## Current bootstrap scope
- Core headers and starter implementations
- Web reference adapter
- Placeholder integrations and tests

## Rules
- Public types live in `core/include/`.
- Core logic stays free of platform APIs.
- Add new adapters under `platforms/<target>/`.
- Add deeper agent workflows under `.claude/skills/`.
