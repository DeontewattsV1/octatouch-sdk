import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';

import { OctaSurfaceTone, OctaTheme } from '../theme/types';

export interface OctaCardProps extends ViewProps {
  theme: OctaTheme;
  tone?: OctaSurfaceTone;
  padded?: boolean;
  outlined?: boolean;
  elevated?: boolean;
  style?: ViewStyle;
  children: React.ReactNode;
}

const surfaceColor = (theme: OctaTheme, tone: OctaSurfaceTone): string => {
  switch (tone) {
    case 'elevated':
      return theme.colors.surfaceElevated;
    case 'sunken':
      return theme.colors.surfaceSunken;
    case 'base':
      return theme.colors.backgroundAlt;
    case 'surface':
    default:
      return theme.colors.surface;
  }
};

export function OctaCard({
  theme,
  tone = 'surface',
  padded = true,
  outlined = true,
  elevated = false,
  style,
  children,
  ...rest
}: OctaCardProps): React.JSX.Element {
  return (
    <View
      {...rest}
      style={StyleSheet.flatten([
        {
          backgroundColor: surfaceColor(theme, tone),
          borderRadius: theme.radius.lg,
          borderWidth: outlined ? 1 : 0,
          borderColor: outlined ? theme.colors.border : 'transparent',
          padding: padded ? theme.spacing.lg : 0,
        },
        elevated ? theme.shadows.soft : null,
        style,
      ])}
    >
      {children}
    </View>
  );
}
