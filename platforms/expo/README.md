# OctaTouch Expo Design System

A mobile-first Expo / React Native design system for OctaTouch surfaces.

## Design intent

- Deep neutral background with luminous accent-led hierarchy
- Calm surface system for cards, controls, and chat
- Hero gradients only in top-level brand moments
- Gesture colors reserved for active signal states, not general decoration

## Included

- Theme presets: Midnight AI, Pearl Intelligence, Obsidian Neon
- Screen background primitives
- Buttons
- Cards
- Tab bar shell
- Chat bubbles
- Typography tokens
- Showcase screen for rapid iteration in Expo

## Suggested structure in an Expo app

```text
app/
├── _layout.tsx
├── index.tsx
└── (tabs)/
    ├── home.tsx
    ├── gestures.tsx
    └── settings.tsx

src/
├── design-system/
│   └── ...exports from this folder
└── features/
```

## Quick use

```tsx
import {
  OctaScreen,
  OctaButton,
  OctaCard,
  OctaText,
  octaThemes,
} from '@octatouch/expo-design-system';

const theme = octaThemes.midnight;

export default function HomeScreen() {
  return (
    <OctaScreen
      theme={theme}
      scroll
      hero={{
        eyebrow: 'OctaTouch',
        title: 'Universal gesture intelligence',
        description:
          'One calm interface language across mobile, tablet, vehicle, and embedded touch.',
      }}
    >
      <OctaCard theme={theme}>
        <OctaText theme={theme} variant="titleMd">Ready for motion-safe touch.</OctaText>
      </OctaCard>
      <OctaButton theme={theme} label="Open gesture map" />
    </OctaScreen>
  );
}
```
