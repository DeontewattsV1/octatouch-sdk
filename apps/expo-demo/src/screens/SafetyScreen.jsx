import React from 'react';
import { Switch, View } from 'react-native';

import { OctaCard, OctaScreen, OctaSectionHeader, OctaText } from '../../../../platforms/expo/src/index';
import { StatusBanner } from '../components/StatusBanner';

function ToggleRow({ theme, label, value, onValueChange, description }) {
  return (
    <OctaCard theme={theme}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: theme.spacing.md }}>
        <View style={{ flex: 1 }}>
          <OctaText theme={theme} variant="titleMd">{label}</OctaText>
          <OctaText theme={theme} variant="bodySm" tone="secondary" style={{ marginTop: theme.spacing.xs }}>
            {description}
          </OctaText>
        </View>
        <Switch value={value} onValueChange={onValueChange} />
      </View>
    </OctaCard>
  );
}

export function SafetyScreen({ theme, context, onChangeContext, lastResult, engine }) {
  const setAccess = (key, value) => {
    onChangeContext({
      ...context,
      accessibility: {
        ...context.accessibility,
        [key]: value,
      },
    });
  };

  return (
    <OctaScreen
      theme={theme}
      scroll
      hero={{
        eyebrow: 'Safety Controls',
        title: 'Policy gates are testable in the app.',
        description:
          'Switch these conditions on and off, then repeat the same touch gesture in the playground to verify the engine response changes correctly.',
      }}
    >
      <OctaSectionHeader
        theme={theme}
        eyebrow="Vehicle"
        title="Motion-aware command gating"
        description="Stationary-only multi-touch commands can be blocked while driving."
      />
      <ToggleRow
        theme={theme}
        label="Driving mode"
        value={context.vehicleState === 'driving'}
        onValueChange={(value) => onChangeContext({ ...context, vehicleState: value ? 'driving' : 'parked' })}
        description="When enabled, clipboard and large multi-finger commands resolve to blocked_driving_mode."
      />

      <OctaSectionHeader
        theme={theme}
        eyebrow="Accessibility"
        title="Conflict suppression"
        description="Three-finger gestures can conflict with system accessibility actions."
      />
      <View style={{ gap: theme.spacing.sm }}>
        <ToggleRow
          theme={theme}
          label="Screen reader active"
          value={context.accessibility.screenReaderActive}
          onValueChange={(value) => setAccess('screenReaderActive', value)}
          description="Blocks three-finger tap and pinch commands in the parity runtime."
        />
        <ToggleRow
          theme={theme}
          label="Zoom active"
          value={context.accessibility.zoomActive}
          onValueChange={(value) => setAccess('zoomActive', value)}
          description="Models a system-level gesture conflict with multi-finger interactions."
        />
        <ToggleRow
          theme={theme}
          label="Switch Control active"
          value={context.accessibility.switchControlActive}
          onValueChange={(value) => setAccess('switchControlActive', value)}
          description="Useful for validating the resolver&apos;s defensive path."
        />
      </View>

      <StatusBanner
        theme={theme}
        title={lastResult?.blocked ? 'Latest policy notice' : ''}
        body={lastResult?.userMessage || ''}
      />

      <OctaCard theme={theme}>
        <OctaText theme={theme} variant="labelSm" tone="secondary">Active engine</OctaText>
        <OctaText theme={theme} variant="titleMd" style={{ marginTop: theme.spacing.xs }}>{engine?.mode ?? 'js-parity'}</OctaText>
        <OctaText theme={theme} variant="bodySm" tone="secondary" style={{ marginTop: theme.spacing.xs }}>
          Safety gates are evaluated inside the currently selected runtime and should resolve identically across transports.
        </OctaText>
      </OctaCard>

      <OctaSectionHeader
        theme={theme}
        eyebrow="Latest outcome"
        title="Most recent result"
        description="Use this with the Playground tab while toggling gates."
      />
      <OctaCard theme={theme} tone="elevated" elevated>
        <OctaText theme={theme} variant="bodyMd">
          {lastResult ? `${lastResult.type} -> ${lastResult.intent}` : 'No gestures captured yet.'}
        </OctaText>
        {lastResult?.fallbackIntent && lastResult.fallbackIntent !== 'unknown' ? (
          <OctaText theme={theme} variant="bodySm" tone="secondary" style={{ marginTop: theme.spacing.xs }}>
            Fallback intent: {lastResult.fallbackIntent}
          </OctaText>
        ) : null}
      </OctaCard>
    </OctaScreen>
  );
}
