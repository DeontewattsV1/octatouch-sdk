import React from 'react';
import { StyleSheet, Text, TextProps, TextStyle } from 'react-native';

import { OctaTextTone, OctaTheme } from '../theme/types';

export type OctaTextVariant = keyof OctaTheme['typography'];

export interface OctaTextProps extends TextProps {
  theme: OctaTheme;
  variant?: OctaTextVariant;
  tone?: OctaTextTone;
  align?: TextStyle['textAlign'];
  children: React.ReactNode;
}

const toneToColor = (theme: OctaTheme, tone: OctaTextTone): string => {
  switch (tone) {
    case 'secondary':
      return theme.colors.textSecondary;
    case 'muted':
      return theme.colors.textMuted;
    case 'accent':
      return theme.colors.primary;
    case 'success':
      return theme.colors.success;
    case 'warning':
      return theme.colors.warning;
    case 'danger':
      return theme.colors.danger;
    case 'inverse':
      return theme.colors.inverseText;
    case 'primary':
    default:
      return theme.colors.textPrimary;
  }
};

export function OctaText({
  theme,
  variant = 'bodyMd',
  tone = 'primary',
  align,
  style,
  children,
  ...rest
}: OctaTextProps): React.JSX.Element {
  const scale = theme.typography[variant];

  return (
    <Text
      {...rest}
      style={StyleSheet.flatten([
        {
          color: toneToColor(theme, tone),
          fontSize: scale.fontSize,
          lineHeight: scale.lineHeight,
          fontWeight: scale.fontWeight,
          letterSpacing: scale.letterSpacing,
          textAlign: align,
        },
        style,
      ])}
    >
      {children}
    </Text>
  );
}
