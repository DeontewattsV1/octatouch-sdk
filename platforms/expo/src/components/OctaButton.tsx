import React from 'react';
import { ActivityIndicator, Pressable, PressableProps, StyleSheet, View, ViewStyle } from 'react-native';

import { OctaTheme } from '../theme/types';
import { OctaText } from './OctaText';

export type OctaButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type OctaButtonSize = 'sm' | 'md' | 'lg';

export interface OctaButtonProps extends Omit<PressableProps, 'style'> {
  theme: OctaTheme;
  label: string;
  variant?: OctaButtonVariant;
  size?: OctaButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const sizeMap = {
  sm: { minHeight: 40, paddingHorizontal: 14, paddingVertical: 10, label: 'labelSm' as const },
  md: { minHeight: 48, paddingHorizontal: 18, paddingVertical: 12, label: 'labelMd' as const },
  lg: { minHeight: 56, paddingHorizontal: 22, paddingVertical: 16, label: 'labelLg' as const },
};

const resolveVariant = (theme: OctaTheme, variant: OctaButtonVariant) => {
  switch (variant) {
    case 'secondary':
      return {
        backgroundColor: theme.colors.surfaceElevated,
        borderColor: theme.colors.border,
        labelTone: 'primary' as const,
        borderWidth: 1,
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        labelTone: 'accent' as const,
        borderWidth: 0,
      };
    case 'danger':
      return {
        backgroundColor: theme.colors.danger,
        borderColor: theme.colors.danger,
        labelTone: 'inverse' as const,
        borderWidth: 1,
      };
    case 'primary':
    default:
      return {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
        labelTone: 'inverse' as const,
        borderWidth: 1,
      };
  }
};

export function OctaButton({
  theme,
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  fullWidth = true,
  style,
  ...rest
}: OctaButtonProps): React.JSX.Element {
  const sizing = sizeMap[size];
  const palette = resolveVariant(theme, variant);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      {...rest}
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) =>
        StyleSheet.flatten([
          {
            minHeight: sizing.minHeight,
            borderRadius: theme.radius.pill,
            paddingHorizontal: sizing.paddingHorizontal,
            paddingVertical: sizing.paddingVertical,
            backgroundColor: palette.backgroundColor,
            borderColor: palette.borderColor,
            borderWidth: palette.borderWidth,
            opacity: isDisabled ? 0.55 : pressed ? 0.88 : 1,
            transform: [{ scale: pressed ? 0.985 : 1 }],
            alignSelf: fullWidth ? 'stretch' : 'flex-start',
          },
          variant === 'primary' ? theme.shadows.glow : null,
          style,
        ])
      }
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.xs,
        }}
      >
        {loading ? <ActivityIndicator color={variant === 'ghost' ? theme.colors.primary : theme.colors.inverseText} /> : leftIcon}
        <OctaText theme={theme} variant={sizing.label} tone={palette.labelTone}>
          {label}
        </OctaText>
        {!loading ? rightIcon : null}
      </View>
    </Pressable>
  );
}
