# OctaTouch Universal Gesture Engine

> **Owned by Deonte Watts** · MIT License

A production-ready, cross-platform gesture engine that standardizes an **eight-finger gesture language** across every OS, SDK, and hardware target — from mobile and tablet to in-vehicle infotainment systems and embedded hardware controllers.

[![CI](https://github.com/deontewatts/octatouch-sdk-core/actions/workflows/build.yml/badge.svg)](https://github.com/deontewatts/octatouch-sdk-core/actions/workflows/build.yml)

---

## Pipeline

```
RawTouchSample → FingerTracker → GestureRecognizer → IntentResolver → GestureResult
```

Every touch event flows through this deterministic three-stage pipeline. The pipeline order is **load-bearing** — do not reorder.

| Stage | Responsibility |
|-------|----------------|
| `FingerTracker` | Assigns stable `FingerId` (L1–L4, R1–R4) via spatial heuristics |
| `GestureRecognizer` | Maps active finger set → `GestureType` |
| `IntentResolver` | Applies safety gates → maps `GestureType` → `GestureIntent` |

---

## What is included

- **Core C++17** — typed interfaces, `GestureInputFrame`, `GestureResult`, full pipeline implementation
- **TypeScript web adapter** — `PointerEventAdapter` for browser integration
- **In-vehicle HMI integration** — CAN bus state monitor, driving-mode gate (parked vs. driving)
- **AD7879 firmware stubs** — resistive touch controller driver, config, BIST routine
- **Text editor plugin stub** — TypeScript selection plugin scaffold
- **Three-tier agent architecture** — `CLAUDE.md` + `.claude/skills/` + `docs/agent-guides/`
- **GitHub Actions CI** — cmake build, ctest, clang-format check, latency regression gate
- **Unit, integration, and latency test scaffolding**

---

## Repository layout

```text
octatouch-sdk-core/
├── CLAUDE.md                          ← agent guide (three-tier)
├── LICENSE
├── Makefile
├── CMakeLists.txt
├── .github/workflows/build.yml        ← CI
├── .gitignore
├── .claude/skills/                    ← task-specific agent workflows
│   ├── build-test-verify.md
│   ├── git-commit.md
│   ├── pull-request.md
│   ├── add-platform-adapter.md
│   └── repo-bootstrap/SKILL.md
├── core/
│   ├── include/                       ← public types (ABI boundary)
│   └── src/                           ← pipeline implementations
├── platforms/
│   └── web/                           ← TypeScript PointerEvent adapter
├── integrations/
│   ├── in-vehicle-hmi/                ← CAN bus monitor, driving-mode gate
│   ├── text-editor/                   ← selection plugin stub
│   └── firmware-ad7879/               ← resistive controller driver stubs
├── docs/
│   ├── gesture-vocabulary.md          ← binding gesture→intent declaration
│   └── agent-guides/                  ← deep workflow documentation
│       ├── gesture-engine-architecture.md
│       ├── in-vehicle-hmi.md
│       └── ad7879-firmware.md
└── tests/
    ├── unit/
    ├── integration/
    └── latency/                       ← regressions are release blockers
```

---

## Build

```bash
make init    # configure CMake
make build   # compile
make test    # run unit + smoke suite
```

Requires: CMake ≥ 3.20, C++17 compiler, Ninja (optional).

---

## Gesture Vocabulary

The canonical gesture→intent table is the **binding declaration** — any SDK integration must implement these mappings exactly, with no silent overrides.

| Gesture | Intent | Availability |
|---------|--------|--------------|
| Single-tap | Select / Confirm | All states |
| Double-tap | Select Word | All states |
| Triple-tap | Select Paragraph | All states |
| Long press + drag | Select Custom Block | All states |
| Short swipe | Change Track / Page | All states |
| Two-finger tap | Save Highlight | Parked / non-vehicle |
| Three-finger pinch-in | Copy Selection | Parked / non-vehicle |
| Three-finger pinch-out | Paste Clipboard | Parked / non-vehicle |
| Three-finger swipe left | Undo | Parked / non-vehicle |
| Three-finger swipe right | Redo | Parked / non-vehicle |

See `docs/gesture-vocabulary.md` for the full specification.

---

## Safety Architecture

In-vehicle deployments enforce an **asymmetric interaction model**:

- **Driving state** — only single-tap and short swipe available; all multi-finger intents return `BlockedDrivingMode`
- **Parked state** — full gesture set enabled

Safety gates live exclusively in `IntentResolver`. Platform adapters **must not** gate intents. Driving state is detected via CAN bus signals (gear position, handbrake status).

---

## Adding a Platform Adapter

See `.claude/skills/add-platform-adapter.md` for the step-by-step guide. Every adapter does exactly three things: **Capture → Translate → Feed**.

---

## License

MIT © 2026 Deonte Watts
