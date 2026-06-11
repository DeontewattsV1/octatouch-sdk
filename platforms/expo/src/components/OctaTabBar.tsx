import React from 'react';
import { Pressable, View } from 'react-native';

import { OctaTheme } from '../theme/types';
import { OctaCard } from './OctaCard';
import { OctaText } from './OctaText';

export interface OctaTabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface OctaTabBarProps {
  theme: OctaTheme;
  items: OctaTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function OctaTabBar({ theme, items, activeKey, onChange }: OctaTabBarProps): React.JSX.Element {
  return (
    <OctaCard
      theme={theme}
      tone="surface"
      elevated
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.sm,
        borderRadius: theme.radius.xl,
      }}
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={{
              flex: 1,
              minHeight: 56,
              borderRadius: theme.radius.lg,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              backgroundColor: active ? theme.colors.surfaceElevated : 'transparent',
              borderWidth: active ? 1 : 0,
              borderColor: active ? theme.colors.outline : 'transparent',
            }}
          >
            {item.icon}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
              <OctaText theme={theme} variant="labelSm" tone={active ? 'primary' : 'secondary'}>
                {item.label}
              </OctaText>
              {item.badge ? (
                <View
                  style={{
                    minWidth: 18,
                    paddingHorizontal: 5,
                    height: 18,
                    borderRadius: theme.radius.pill,
                    backgroundColor: active ? theme.colors.primary : theme.colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <OctaText theme={theme} variant="labelSm" tone={active ? 'inverse' : 'primary'}>
                    {String(item.badge)}
                  </OctaText>
                </View>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </OctaCard>
  );
}
