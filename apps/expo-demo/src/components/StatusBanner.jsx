import React from 'react';
import { View } from 'react-native';

import { OctaCard, OctaText } from '../../../../platforms/expo/src/index';

export function StatusBanner({ theme, title, body, tone = 'warning' }) {
  if (!body) {
    return null;
  }

  return (
    <OctaCard theme={theme} tone="elevated" elevated>
      <View style={{ gap: theme.spacing.xs }}>
        <OctaText theme={theme} variant="labelSm" tone={tone}>{title}</OctaText>
        <OctaText theme={theme} variant="bodySm">{body}</OctaText>
      </View>
    </OctaCard>
  );
}
