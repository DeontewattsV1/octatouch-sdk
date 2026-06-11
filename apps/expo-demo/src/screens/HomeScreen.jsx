import React from 'react';
import { View } from 'react-native';

import { OctaButton, OctaCard, OctaScreen, OctaSectionHeader, OctaText, OctaHeroSignalRing } from '../../../../platforms/expo/src/index';

function StatCard({ theme, label, value, tone = 'primary' }) {
  return (
    <OctaCard theme={theme} tone="surface" style={{ flex: 1 }}>
      <OctaText theme={theme} variant="labelSm" tone="secondary">{label}</OctaText>
      <OctaText theme={theme} variant="titleLg" tone={tone} style={{ marginTop: theme.spacing.xs }}>{value}</OctaText>
    </OctaCard>
  );
}

export function HomeScreen({ theme, context, lastResult, engine }) {
  return (
    <OctaScreen
      theme={theme}
      scroll
      hero={{
        eyebrow: 'OctaTouch Demo',
        title: 'A working mobile playground for the universal gesture engine.',
        description:
          'This Expo app can validate gesture vocabulary in JavaScript parity mode and promote to a native iOS bridge when the local Expo module is available.',
        rightSlot: <OctaHeroSignalRing theme={theme} />,
      }}
    >
      <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
        <StatCard theme={theme} label="Vehicle state" value={context.vehicleState} tone={context.vehicleState === 'driving' ? 'warning' : 'success'} />
        <StatCard theme={theme} label="Last intent" value={lastResult?.intent ?? 'none'} tone={lastResult ? 'accent' : 'secondary'} />
      </View>

      <OctaSectionHeader
        theme={theme}
        eyebrow="Architecture"
        title="What is already functional"
        description="This app closes the biggest gap in the current repo: real touch input flowing through a usable mobile surface."
      />
      <View style={{ gap: theme.spacing.sm }}>
        <OctaCard theme={theme}>
          <OctaText theme={theme} variant="titleMd">End-to-end touch capture</OctaText>
          <OctaText theme={theme} variant="bodySm" tone="secondary" style={{ marginTop: theme.spacing.xs }}>
            React Native responder events generate normalized gesture frames directly from the device screen.
          </OctaText>
        </OctaCard>
        <OctaCard theme={theme}>
          <OctaText theme={theme} variant="titleMd">Gesture engine parity runtime</OctaText>
          <OctaText theme={theme} variant="bodySm" tone="secondary" style={{ marginTop: theme.spacing.xs }}>
            A JavaScript runtime mirrors the repository&apos;s tracker, recognizer, and intent resolver so mobile validation is possible without a native bridge.
          </OctaText>
        </OctaCard>
        <OctaCard theme={theme}>
          <OctaText theme={theme} variant="titleMd">Safety-aware resolution</OctaText>
          <OctaText theme={theme} variant="bodySm" tone="secondary" style={{ marginTop: theme.spacing.xs }}>
            The demo applies the same policy direction as the core scaffold: accessibility conflicts are blocked, and motion-sensitive gestures can be suppressed while driving.
          </OctaText>
        </OctaCard>
      </View>

      <OctaSectionHeader
        theme={theme}
        eyebrow="Important"
        title="What remains native-only"
        description="Expo is the fastest proving ground, but it is not the final destination for the canonical engine."
      />
      <OctaCard theme={theme} tone="elevated" elevated>
        <View style={{ gap: theme.spacing.xs }}>
          <OctaText theme={theme} variant="labelSm" tone="secondary">Engine transport</OctaText>
          <OctaText theme={theme} variant="titleMd">{engine?.mode ?? 'js-parity'}</OctaText>
          <OctaText theme={theme} variant="bodySm" tone="secondary">
            {engine?.mode === 'native-sync'
              ? 'This build is using the local iOS Expo module backed by the shared C++ realtime runtime.'
              : 'This build is using the JavaScript parity runtime. The app will promote itself to the native iOS module when that module is available in a prebuilt iOS target.'}
          </OctaText>
        </View>
      </OctaCard>
    </OctaScreen>
  );
}
