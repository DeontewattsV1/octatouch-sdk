import React from 'react';
import { ScrollView, ScrollViewProps, StyleSheet, View, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { OctaTheme } from '../theme/types';
import { OctaCard } from './OctaCard';
import { OctaText } from './OctaText';

export interface OctaHeroConfig {
  eyebrow?: string;
  title: string;
  description?: string;
  rightSlot?: React.ReactNode;
  footer?: React.ReactNode;
}

export interface OctaScreenProps extends Omit<ViewProps, 'children'> {
  theme: OctaTheme;
  scroll?: boolean;
  hero?: OctaHeroConfig;
  children: React.ReactNode;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
}

export function OctaScreen({
  theme,
  scroll = false,
  hero,
  children,
  style,
  contentContainerStyle,
  ...rest
}: OctaScreenProps): React.JSX.Element {
  const content = (
    <View
      {...rest}
      style={StyleSheet.flatten([
        {
          flex: 1,
          backgroundColor: theme.colors.background,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.xl,
          gap: theme.spacing.lg,
        },
        style,
      ])}
    >
      {hero ? (
        <LinearGradient
          colors={theme.gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: theme.radius.xl,
            padding: theme.spacing.xl,
            borderWidth: 1,
            borderColor: theme.colors.outline,
            overflow: 'hidden',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: theme.spacing.md }}>
            <View style={{ flex: 1, gap: theme.spacing.xs }}>
              {hero.eyebrow ? (
                <OctaText theme={theme} variant="labelSm" tone="accent" style={{ textTransform: 'uppercase' }}>
                  {hero.eyebrow}
                </OctaText>
              ) : null}
              <OctaText theme={theme} variant="displayMd">
                {hero.title}
              </OctaText>
              {hero.description ? (
                <OctaText theme={theme} variant="bodyMd" tone="secondary">
                  {hero.description}
                </OctaText>
              ) : null}
            </View>
            {hero.rightSlot ? <View>{hero.rightSlot}</View> : null}
          </View>
          {hero.footer ? <View style={{ marginTop: theme.spacing.lg }}>{hero.footer}</View> : null}
        </LinearGradient>
      ) : null}
      {children}
    </View>
  );

  if (!scroll) {
    return content;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={StyleSheet.flatten([
        { paddingBottom: theme.spacing.xxxl },
        contentContainerStyle,
      ])}
      showsVerticalScrollIndicator={false}
    >
      {content}
    </ScrollView>
  );
}

export function OctaSectionHeader({
  theme,
  eyebrow,
  title,
  description,
}: {
  theme: OctaTheme;
  eyebrow?: string;
  title: string;
  description?: string;
}): React.JSX.Element {
  return (
    <View style={{ gap: theme.spacing.xs }}>
      {eyebrow ? (
        <OctaText theme={theme} variant="labelSm" tone="secondary" style={{ textTransform: 'uppercase' }}>
          {eyebrow}
        </OctaText>
      ) : null}
      <OctaText theme={theme} variant="titleLg">
        {title}
      </OctaText>
      {description ? (
        <OctaText theme={theme} variant="bodySm" tone="secondary">
          {description}
        </OctaText>
      ) : null}
    </View>
  );
}

export function OctaHeroSignalRing({ theme }: { theme: OctaTheme }): React.JSX.Element {
  return (
    <OctaCard
      theme={theme}
      tone="sunken"
      outlined
      style={{
        width: 120,
        height: 120,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <LinearGradient
        colors={theme.gradients.gestureRing}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: 76,
          height: 76,
          borderRadius: 999,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 999,
            backgroundColor: theme.colors.background,
          }}
        />
      </LinearGradient>
    </OctaCard>
  );
}
