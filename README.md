# OctaTouch SDK

<div align="center">

![OctaTouch](https://img.shields.io/badge/OctaTouch-Gesture_Engine-F59E0B?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xOCA4aDE5LjVhMi41IDIuNSAwIDAgMSAwIDVIMThsLTQgN0g4bDQtN0g0YTIgMiAwIDAgMSAwLTRoOGw0LTdoNmwtNCA3eiIvPjwvc3ZnPg==)
![C++](https://img.shields.io/badge/C++-Native_Engine-00599C?style=for-the-badge&logo=cplusplus&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-SDK-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-Design_System-000020?style=for-the-badge&logo=expo&logoColor=white)
![Automotive](https://img.shields.io/badge/Automotive-HMI_Grade-E11D48?style=for-the-badge)

**Automotive-grade 8-channel touch gesture recognition with zero-latency C++ engine and Expo/RN design system.**

</div>

---

## What Is OctaTouch?

OctaTouch is a **high-performance gesture recognition SDK** designed for automotive HMI systems. It offloads complex gesture math to native C++ event loops while maintaining a unified developer experience across Native and Web platforms.

## Stack

```
octatouch-sdk/
├── core/                   ← C++ gesture engine (zero-latency)
├── integrations/
│   ├── firmware-ad7879/    ← AD7879 touchscreen controller driver
│   ├── in-vehicle-hmi/     ← CAN Bus monitor + driving mode gate
│   └── text-editor/        ← Text selection plugin (TS)
├── design-system/          ← Expo/RN theme presets
│   ├── Midnight AI
│   ├── Pearl Intelligence
│   └── Obsidian Neon
└── diagnostics/            ← Production-grade observability
```

## Design Themes

| Theme | Use Case |
|-------|----------|
| **Midnight AI** | Night-mode dashboards |
| **Pearl Intelligence** | Clean/minimal HMI |
| **Obsidian Neon** | Performance & sport modes |

## Build

```bash
make build        # Native C++ engine
make test         # Full test suite
make install      # SDK + dependencies
```

---

<div align="center">
<sub>Built by <strong>Deonte Watts</strong> · Automotive-Grade Gesture Engineering</sub>
</div>
