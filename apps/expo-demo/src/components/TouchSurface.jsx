import React, { useState } from 'react';
import { View } from 'react-native';

import { OctaCard, OctaText } from '../../../../platforms/expo/src/index';

function mapTouches(touches, width, height) {
  const list = Array.from(touches || []);
  return list.map((touch, index) => ({
    x: width > 0 ? Math.max(0, Math.min(1, (touch.locationX ?? 0) / width)) : 0,
    y: height > 0 ? Math.max(0, Math.min(1, (touch.locationY ?? 0) / height)) : 0,
    pressure: touch.force ?? 0.5,
    contactArea: 16,
    timestamp_us: Date.now() * 1000,
    nativeId: touch.identifier ?? index,
  }));
}

export function TouchSurface({ theme, context, onResult, onLiveChange, engine }) {
  const [layout, setLayout] = useState({ width: 1, height: 1 });

  const emit = (event, released = false) => {
    const timestamp_us = Date.now() * 1000;
    const samples = released ? [] : mapTouches(event.nativeEvent.touches, layout.width, layout.height);
    const response = engine.ingestFrame(
      {
        timestamp_us,
        samples,
        deviceId: 'expo-demo',
        toolType: 'touch',
        capabilities: {
          multiTouch: true,
          hover: false,
          pressure: true,
          stylus: false,
        },
      },
      context,
    );
    onLiveChange?.(response.live);
    if (response.result) {
      onResult?.(response.result);
    }
  };

  return (
    <OctaCard
      theme={theme}
      tone="sunken"
      outlined
      style={{
        overflow: 'hidden',
        padding: 0,
      }}
    >
      <View
        onLayout={(event) => setLayout(event.nativeEvent.layout)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(event) => emit(event, false)}
        onResponderMove={(event) => emit(event, false)}
        onResponderRelease={(event) => emit(event, true)}
        onResponderTerminate={(event) => emit(event, true)}
        style={{
          minHeight: 320,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.backgroundAlt,
          borderWidth: 1,
          borderColor: theme.colors.outline,
          padding: theme.spacing.xl,
          justifyContent: 'space-between',
        }}
      >
        <View style={{ gap: theme.spacing.sm }}>
          <OctaText theme={theme} variant="labelSm" tone="accent">LIVE TOUCH SURFACE</OctaText>
          <OctaText theme={theme} variant="titleLg">Use 1, 2, 3, or 8 fingers.</OctaText>
          <OctaText theme={theme} variant="bodySm" tone="secondary">
            Single-finger taps, swipes, long presses, two-finger taps, three-finger clipboard gestures, and safety gates are active.
          </OctaText>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.md }}>
          <View style={{ flex: 1, gap: theme.spacing.xs }}>
            <OctaText theme={theme} variant="labelSm" tone="secondary">Quick tests</OctaText>
            <OctaText theme={theme} variant="bodySm" tone="secondary">• Tap once for select</OctaText>
            <OctaText theme={theme} variant="bodySm" tone="secondary">• Pinch 3 fingers inward for copy</OctaText>
            <OctaText theme={theme} variant="bodySm" tone="secondary">• Swipe 3 fingers left for undo</OctaText>
          </View>
          <View style={{ flex: 1, gap: theme.spacing.xs }}>
            <OctaText theme={theme} variant="labelSm" tone="secondary">Safety</OctaText>
            <OctaText theme={theme} variant="bodySm" tone="secondary">Driving mode blocks stationary-only multi-touch commands.</OctaText>
          </View>
        </View>
      </View>
    </OctaCard>
  );
}
