# AD7879 Hardware Integration Guide

> Load this guide when: working in `integrations/firmware-ad7879/`, configuring the resistive
> touch controller, or debugging coordinate / latency issues on embedded panels.

## What Is the AD7879?

The AD7879 is a **4-wire resistive touch screen controller** with:
- Integrated 12-bit ADC
- I²C (up to 400 kHz) and SPI (up to 2 MHz) interface
- Programmable median and averaging filters
- Built-in self-test (BIST) routine

**Key limitation vs. capacitive:** No native multi-touch hardware. OctaTouch uses single-point
and sequential gesture recognition on AD7879-equipped panels — multi-finger gestures are not available.

---

## Integration Checklist (from Section 4 of OctaTouch Spec)

### 1 — Verify Resistive Panel Compatibility
- Confirm 4-wire panel with resistance per-axis in **200 Ω – 2 kΩ** range.
- Validate against AD7879 datasheet input voltage requirements **before** writing any firmware.

### 2 — Confirm X/Y Wiring
- Verify X+, X−, Y+, Y− lines match the AD7879 datasheet.
- Incorrect wiring → mirrored/transposed coordinates; cannot be corrected in firmware without full recalibration.
- Cross-check against the evaluation board reference schematic.

### 3 — MCU Interface Requirements
- One I²C or SPI interface at supported clock rates.
- Two GPIO lines if passive-layer voltage measurements are needed (rotation detection).
- Document chosen interface protocol in the integration manifest.

### 4 — Firmware Configuration

```c
// integrations/firmware-ad7879/ad7879_config.h
// Key registers to configure:
// - Averaging filter: 4, 8, 16, or 32 samples (balance latency vs. noise)
// - Median filter depth: match OctaTouch gesture engine polling rate
// - Debounce threshold: suppress spurious events from panel flex / vehicle vibration
```

Rule of thumb for vehicle deployments: **32-sample average + debounce** — trades ~3 ms extra
latency for dramatically reduced spurious event rate from road vibration.

### 5 — Pre-Integration Verification

```c
// integrations/firmware-ad7879/ad7879_bist.c
// Run the built-in self-test on first power-up and log to debug interface.
```

- Validate I²C/SPI transaction integrity with a **logic analyzer** before wiring to the gesture engine.
- Confirm interrupt-driven delivery meets OctaTouch's **≤ 16 ms** latency budget (end-to-end from
  touch event to `GestureResult` emitted).
- Store calibration matrix coefficients in **non-volatile memory** for recovery after power cycles.

---

## File Map

```
integrations/firmware-ad7879/
├── ad7879_config.h    → register map and filter configuration
├── ad7879_driver.c    → I²C/SPI read loop, coordinate normalization
└── ad7879_bist.c      → self-test routine
```

---

## Escalation Path

If interrupt latency exceeds 16 ms after tuning the averaging filter:
1. Reduce averaging filter depth (accept more noise, less latency).
2. Verify MCU clock is not throttled in vehicle low-power mode.
3. Check for I²C clock stretching — switch to SPI if persistent.

For gesture engine internals: `docs/agent-guides/gesture-engine-architecture.md`
For in-vehicle safety context: `docs/agent-guides/in-vehicle-hmi.md`
