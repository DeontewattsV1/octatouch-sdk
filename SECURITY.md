# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| main    | ✅        |

## Reporting a Vulnerability

Do **not** open a public GitHub issue for security vulnerabilities.

Report privately via GitHub's built-in security advisory:
**https://github.com/deontewatts/octatouch-sdk-core/security/advisories/new**

Alternatively, email: **security@cce-hospitality.com**

Acknowledgement within **48 hours** · Resolution timeline within **7 days** for critical issues.

## Scope

- Gesture-intent spoofing across safety-gated intents (driving mode, accessibility)
- AD7879 firmware injection vectors (`integrations/firmware-ad7879/`)
- Automotive CAN-bus intent escalation via `DrivingModeGate`
- Any path allowing an unprivileged caller to bypass `IntentResolver` restrictions
- iOS native bridge (`OctaTouchEngineHost`) surface-area issues
