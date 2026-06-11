import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { octaThemes } from '../theme/presets';
import { OctaButton } from '../components/OctaButton';
import { OctaCard } from '../components/OctaCard';
import { OctaChatBubble } from '../components/OctaChatBubble';
import { OctaHeroSignalRing, OctaScreen, OctaSectionHeader } from '../components/OctaScreen';
import { OctaTabBar } from '../components/OctaTabBar';
import { OctaText } from '../components/OctaText';

const tabs = [
  { key: 'home', label: 'Home' },
  { key: 'signals', label: 'Signals', badge: 8 },
  { key: 'chat', label: 'Chat' },
] as const;

export function OctaDesignShowcaseScreen(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState('home');
  const theme = useMemo(() => octaThemes.midnight, []);

  return (
    <OctaScreen
      theme={theme}
      scroll
      hero={{
        eyebrow: 'OctaTouch Design System',
        title: 'A calm surface system with controlled signal color.',
        description:
          'Deep neutrals carry the interface. Accent color drives action. Cyan, magenta, and lime stay reserved for gesture signal and hero moments.',
        rightSlot: <OctaHeroSignalRing theme={theme} />,
        footer: (
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <OctaButton theme={theme} label="Open gesture map" size="sm" fullWidth={false} />
            <OctaButton theme={theme} label="Preview tab shell" variant="secondary" size="sm" fullWidth={false} />
          </View>
        ),
      }}
    >
      <OctaSectionHeader
        theme={theme}
        eyebrow="Buttons"
        title="Primary action gets the light."
        description="Everything else steps back into the architecture."
      />
      <View style={{ gap: theme.spacing.sm }}>
        <OctaButton theme={theme} label="Primary action" />
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <OctaButton theme={theme} label="Secondary" variant="secondary" style={{ flex: 1 }} />
          <OctaButton theme={theme} label="Ghost" variant="ghost" style={{ flex: 1 }} />
        </View>
      </View>

      <OctaSectionHeader
        theme={theme}
        eyebrow="Cards"
        title="Surfaces layer softly."
        description="Use elevated cards for focal content only, not every tile."
      />
      <View style={{ gap: theme.spacing.sm }}>
        <OctaCard theme={theme} tone="surface">
          <OctaText theme={theme} variant="titleMd">Vehicle-safe gesture mode</OctaText>
          <OctaText theme={theme} variant="bodySm" tone="secondary" style={{ marginTop: theme.spacing.xs }}>
            Single taps and short swipes stay available in motion. Richer gesture vocabulary returns when parked.
          </OctaText>
        </OctaCard>
        <OctaCard theme={theme} tone="elevated" elevated>
          <OctaText theme={theme} variant="titleMd">Live signal state</OctaText>
          <OctaText theme={theme} variant="bodySm" tone="secondary" style={{ marginTop: theme.spacing.xs }}>
            Cyan, magenta, and lime are used here to indicate active gesture channels, never for general UI chrome.
          </OctaText>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
            {[theme.colors.gestureCyan, theme.colors.gestureMagenta, theme.colors.gestureLime].map((color) => (
              <View
                key={color}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  backgroundColor: color,
                }}
              />
            ))}
          </View>
        </OctaCard>
      </View>

      <OctaSectionHeader
        theme={theme}
        eyebrow="Chat"
        title="Assistant UI stays readable in motion."
        description="Chat bubbles favor contrast and shape before decorative color."
      />
      <View style={{ gap: theme.spacing.sm }}>
        <OctaChatBubble
          theme={theme}
          role="assistant"
          body="Driving mode is active. Complex gestures are paused until the vehicle is parked."
          timestamp="Now"
        />
        <OctaChatBubble
          theme={theme}
          role="user"
          body="Show me the safe gesture set."
          timestamp="Now"
          statusLabel="Delivered"
        />
      </View>

      <OctaSectionHeader
        theme={theme}
        eyebrow="Tab bar"
        title="Navigation feels planted."
        description="The active tab gets contour and contrast, not a rainbow."
      />
      <OctaTabBar theme={theme} items={[...tabs]} activeKey={activeTab} onChange={setActiveTab} />
    </OctaScreen>
  );
}
