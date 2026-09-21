import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout } from '@/design-system';

/** Page background + optional gutter. Every screen sits on this. */
export function ScreenContainer({ padded, style, ...rest }: ViewProps & { padded?: boolean }) {
  return (
    <View
      {...rest}
      style={[
        { flex: 1, backgroundColor: colors.backgroundPrimary },
        padded ? { paddingHorizontal: layout.screenPaddingX } : null,
        style,
      ]}
    />
  );
}

export type SafeEdge = 'top' | 'bottom';

/**
 * Applies the device safe areas. Tab screens use `['top']` (the tab bar owns the bottom inset);
 * pushed screens use `['top', 'bottom']`.
 */
export function SafeScreen({
  edges = ['top', 'bottom'],
  children,
  style,
  ...rest
}: ViewProps & { edges?: SafeEdge[]; children?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <ScreenContainer
      {...rest}
      style={[
        {
          paddingTop: edges.includes('top') ? insets.top : 0,
          paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
        },
        style,
      ]}
    >
      {children}
    </ScreenContainer>
  );
}
