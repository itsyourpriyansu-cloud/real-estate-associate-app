import { StyleSheet, View, type ViewProps } from 'react-native';

import {
  elevation,
  radius as radiusTokens,
  space,
  topHighlight,
  type RadiusToken,
  type SpaceToken,
} from '@/design-system';

export interface SurfaceProps extends ViewProps {
  /** flat: on the page · raised: grouped · elevated: emphasised · overlay: floating only. */
  variant?: keyof typeof elevation;
  rounded?: RadiusToken;
  padding?: SpaceToken;
  /** Top-edge hairline highlight (raised/elevated/overlay). */
  highlight?: boolean;
}

/**
 * The single grouped-surface primitive. Depth = tonal step + hairline border (+ a soft shadow on
 * overlays). Use sparingly: hierarchy should come from spacing and type before boxes.
 */
export function Surface({
  variant = 'raised',
  rounded = 'md',
  padding,
  highlight,
  style,
  children,
  ...rest
}: SurfaceProps) {
  const showHighlight = highlight ?? variant !== 'flat';
  return (
    <View
      {...rest}
      style={[
        elevation[variant],
        { borderRadius: radiusTokens[rounded], overflow: 'hidden' },
        padding !== undefined ? { padding: space[padding] } : null,
        style,
      ]}
    >
      {showHighlight ? <View pointerEvents="none" style={styles.highlight} /> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  highlight: { ...topHighlight, position: 'absolute', top: 0, left: 0, right: 0 },
});
