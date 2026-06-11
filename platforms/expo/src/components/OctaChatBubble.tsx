import React from 'react';
import { View } from 'react-native';

import { OctaTheme } from '../theme/types';
import { OctaCard } from './OctaCard';
import { OctaText } from './OctaText';

export type OctaChatRole = 'user' | 'assistant' | 'system';

export interface OctaChatBubbleProps {
  theme: OctaTheme;
  role: OctaChatRole;
  body: string;
  timestamp?: string;
  statusLabel?: string;
}

const resolveBubbleColor = (theme: OctaTheme, role: OctaChatRole): string => {
  switch (role) {
    case 'user':
      return theme.colors.chatUserBubble;
    case 'system':
      return theme.colors.chatSystemBubble;
    case 'assistant':
    default:
      return theme.colors.chatAssistantBubble;
  }
};

export function OctaChatBubble({
  theme,
  role,
  body,
  timestamp,
  statusLabel,
}: OctaChatBubbleProps): React.JSX.Element {
  const isUser = role === 'user';
  const label = role === 'assistant' ? 'Octa' : role === 'user' ? 'You' : 'System';

  return (
    <View style={{ alignItems: isUser ? 'flex-end' : 'flex-start' }}>
      <View style={{ maxWidth: '88%' }}>
        <OctaCard
          theme={theme}
          outlined={!isUser}
          style={{
            backgroundColor: resolveBubbleColor(theme, role),
            borderColor: isUser ? theme.colors.primaryGlow : theme.colors.border,
            borderTopRightRadius: isUser ? theme.radius.sm : theme.radius.xl,
            borderTopLeftRadius: isUser ? theme.radius.xl : theme.radius.sm,
            padding: theme.spacing.md,
          }}
        >
          <View style={{ gap: theme.spacing.xs }}>
            <OctaText theme={theme} variant="labelSm" tone={isUser ? 'inverse' : 'secondary'}>
              {label}
            </OctaText>
            <OctaText theme={theme} variant="bodyMd" tone={isUser ? 'inverse' : 'primary'}>
              {body}
            </OctaText>
          </View>
        </OctaCard>
        {timestamp || statusLabel ? (
          <View style={{ marginTop: theme.spacing.xs, flexDirection: 'row', gap: theme.spacing.xs, alignItems: 'center' }}>
            {timestamp ? (
              <OctaText theme={theme} variant="bodySm" tone="muted">
                {timestamp}
              </OctaText>
            ) : null}
            {statusLabel ? (
              <OctaText theme={theme} variant="bodySm" tone="secondary">
                {statusLabel}
              </OctaText>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}
