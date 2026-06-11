import React, { useState } from 'react';
import { View } from 'react-native';

import { OctaCard, OctaChatBubble, OctaScreen, OctaSectionHeader, OctaText } from '../../../../platforms/expo/src/index';
import { StatusBanner } from '../components/StatusBanner';
import { TouchSurface } from '../components/TouchSurface';

function formatFingers(result) {
  return result?.activeFingers?.length ? result.activeFingers.join(', ') : 'none';
}

export function PlaygroundScreen({ theme, context, onResult, history, engine }) {
  const [live, setLive] = useState({
    phase: 'idle',
    activeTouches: 0,
    candidateGesture: 'unknown',
    assignedFingers: [],
  });

  const latest = history[0] ?? null;

  return (
    <OctaScreen
      theme={theme}
      scroll
      hero={{
        eyebrow: 'Gesture Playground',
        title: 'Test the runtime with real screen touches.',
        description:
          'The surface below translates touch events into OctaTouch frames, assigns finger channels, and resolves intent when the gesture ends.',
      }}
    >
      <TouchSurface theme={theme} context={context} onResult={onResult} onLiveChange={setLive} engine={engine} />

      <StatusBanner
        theme={theme}
        title={latest?.blocked ? 'Policy notice' : latest?.fallbackIntent && latest.fallbackIntent !== 'unknown' ? 'Fallback intent' : ''}
        body={latest?.userMessage || (latest?.fallbackIntent && latest.fallbackIntent !== 'unknown' ? `Fallback intent: ${latest.fallbackIntent}` : '')}
      />

      <OctaCard theme={theme}>
        <OctaText theme={theme} variant="labelSm" tone="secondary">Engine</OctaText>
        <OctaText theme={theme} variant="titleMd" style={{ marginTop: theme.spacing.xs }}>{engine?.mode ?? 'js-parity'}</OctaText>
        <OctaText theme={theme} variant="bodySm" tone="secondary" style={{ marginTop: theme.spacing.sm }}>
          Native iOS uses the local Expo module and shared C++ runtime. Other targets fall back to JS parity mode.
        </OctaText>
      </OctaCard>

      <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
        <OctaCard theme={theme} style={{ flex: 1 }}>
          <OctaText theme={theme} variant="labelSm" tone="secondary">Live phase</OctaText>
          <OctaText theme={theme} variant="titleLg" style={{ marginTop: theme.spacing.xs }}>{live.phase}</OctaText>
          <OctaText theme={theme} variant="bodySm" tone="secondary" style={{ marginTop: theme.spacing.sm }}>
            {live.activeTouches} active touch{live.activeTouches === 1 ? '' : 'es'}
          </OctaText>
        </OctaCard>
        <OctaCard theme={theme} style={{ flex: 1 }}>
          <OctaText theme={theme} variant="labelSm" tone="secondary">Candidate</OctaText>
          <OctaText theme={theme} variant="titleMd" style={{ marginTop: theme.spacing.xs }}>{live.candidateGesture}</OctaText>
          <OctaText theme={theme} variant="bodySm" tone="secondary" style={{ marginTop: theme.spacing.sm }}>
            {live.assignedFingers?.join(', ') || 'No assigned channels'}
          </OctaText>
        </OctaCard>
      </View>

      <OctaSectionHeader
        theme={theme}
        eyebrow="Resolved output"
        title="Latest gesture"
        description="This is the final engine result after the touch sequence ends."
      />
      <OctaCard theme={theme} tone="elevated" elevated>
        <View style={{ gap: theme.spacing.sm }}>
          <View>
            <OctaText theme={theme} variant="labelSm" tone="secondary">Gesture</OctaText>
            <OctaText theme={theme} variant="titleLg">{latest?.type ?? 'none yet'}</OctaText>
          </View>
          <View>
            <OctaText theme={theme} variant="labelSm" tone="secondary">Intent</OctaText>
            <OctaText theme={theme} variant="titleMd" tone={latest?.intent?.startsWith('blocked') ? 'warning' : 'accent'}>
              {latest?.intent ?? 'none yet'}
            </OctaText>
            {latest?.fallbackIntent && latest.fallbackIntent !== 'unknown' ? (
              <OctaText theme={theme} variant="bodySm" tone="secondary" style={{ marginTop: theme.spacing.xs }}>
                fallback {latest.fallbackIntent}
              </OctaText>
            ) : null}
          </View>
          <View>
            <OctaText theme={theme} variant="labelSm" tone="secondary">Active fingers</OctaText>
            <OctaText theme={theme} variant="bodyMd">{formatFingers(latest)}</OctaText>
          </View>
          <View>
            <OctaText theme={theme} variant="labelSm" tone="secondary">Diagnostics</OctaText>
            <OctaText theme={theme} variant="bodySm" tone="secondary">
              duration {latest?.diagnostics?.durationMs ?? 0} ms • peak touches {latest?.diagnostics?.peakTouches ?? 0} • confidence {latest ? latest.confidence.toFixed(2) : '0.00'}
            </OctaText>
          </View>
        </View>
      </OctaCard>

      <OctaSectionHeader
        theme={theme}
        eyebrow="History"
        title="Recent engine events"
        description="Useful for quickly checking if the engine is resolving the intended command."
      />
      <View style={{ gap: theme.spacing.sm }}>
        {history.length === 0 ? (
          <OctaCard theme={theme}>
            <OctaText theme={theme} variant="bodyMd" tone="secondary">No gestures captured yet.</OctaText>
          </OctaCard>
        ) : (
          history.slice(0, 5).map((item, index) => (
            <OctaChatBubble
              key={`${item.resolvedAt_us}-${index}`}
              theme={theme}
              role={item.intent.startsWith('blocked') ? 'system' : 'assistant'}
              body={`${item.type} -> ${item.intent} | fingers: ${formatFingers(item)}`}
              timestamp={`${item.diagnostics.durationMs} ms`}
            />
          ))
        )}
      </View>
    </OctaScreen>
  );
}
