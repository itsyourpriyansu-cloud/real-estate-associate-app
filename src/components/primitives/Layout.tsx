import { View, type ViewProps, type ViewStyle } from 'react-native';

import { colors, space, type SpaceToken } from '@/design-system';

interface BoxProps extends ViewProps {
  gap?: SpaceToken;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  wrap?: boolean;
}

/** Vertical stack with a token gap. */
export function Stack({ gap = 8, align, justify, wrap, style, ...rest }: BoxProps) {
  return (
    <View
      {...rest}
      style={[
        {
          gap: space[gap],
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap ? 'wrap' : undefined,
        },
        style,
      ]}
    />
  );
}

/** Horizontal row with a token gap, vertically centred by default. */
export function Row({ gap = 8, align = 'center', justify, wrap, style, ...rest }: BoxProps) {
  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: 'row',
          gap: space[gap],
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap ? 'wrap' : undefined,
        },
        style,
      ]}
    />
  );
}

/** Fixed gap, for the rare case a `gap` on the parent is not possible. */
export function Spacer({ size = 16, horizontal }: { size?: SpaceToken; horizontal?: boolean }) {
  return <View style={horizontal ? { width: space[size] } : { height: space[size] }} />;
}

/** Hairline divider. `inset` indents the start (to align with text after a leading icon). */
export function Divider({ inset = 0, vertical }: { inset?: number; vertical?: boolean }) {
  return (
    <View
      aria-hidden
      style={
        vertical
          ? { width: 1, alignSelf: 'stretch', backgroundColor: colors.borderSubtle }
          : { height: 1, marginLeft: inset, backgroundColor: colors.borderSubtle }
      }
    />
  );
}
