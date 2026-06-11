# Expo Design System Guide

## Objective

Provide a premium, production-lean design system for OctaTouch in Expo / React Native without breaking the canonical gesture vocabulary or overusing brand color.

## Visual strategy

- Default to `midnight` for the main app shell.
- Treat deep neutrals as the structural layer.
- Use the violet primary token for core CTA hierarchy.
- Reserve cyan, magenta, and lime for gesture signal, live touch state, and hero identity moments.
- Use gradients only in hero surfaces, launch headers, or onboarding scene-setting moments.

## Component rules

### Screen background
- Solid background for standard screens.
- Hero gradient only at the top of high-importance surfaces.
- Avoid gradient cards in scrollers.

### Buttons
- Primary: one luminous accent, full-width for main conversion moments.
- Secondary: bordered elevated surface.
- Ghost: text-led, no high-contrast fill.
- Danger: reserved strictly for destructive actions.

### Cards
- Surface for standard content.
- Elevated for KPI, hero-adjacent, or stateful content.
- Keep borders soft and spacing generous.

### Tab bar
- Prefer a grounded floating shell.
- Highlight the active tab with contour, not multiple accent colors.
- Badges should inherit the active state rather than introducing new hue families.

### Chat bubbles
- User bubble may use primary fill.
- Assistant bubble should remain on a dark neutral surface for long-form readability.
- System bubbles should be quieter than assistant bubbles.

## Best next step

Mount `OctaDesignShowcaseScreen` inside an Expo route first, validate spacing on-device, then wire the real screens to these primitives before adding product-specific styling.
