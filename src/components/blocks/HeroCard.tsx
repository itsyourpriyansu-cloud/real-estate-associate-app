import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, elevation, radius, space } from '@/design-system';

import { AnimatedNumber } from '../primitives/AnimatedNumber';
import { AppText } from '../primitives/AppText';
import { Icon } from '../primitives/Icon';
import { icons } from '../primitives/icons';
import { PressableScale } from '../primitives/PressableScale';

export interface HeroCardProps {
  label: string;
  value: number;
  format?: (value: number) => string;
  /** One quiet line under the figure. */
  caption?: string;
  /** When true the figure reads "••••" and the count-up is skipped. */
  hidden?: boolean;
  /** Renders the show/hide control when provided. */
  onToggleHidden?: () => void;
  /** `HeroStat`s or any short row pinned to the bottom of the card. */
  footer?: ReactNode;
}

const MASK = '••••••';

/**
 * The charcoal hero card: one number that matters, large, with a quiet caption and a footer of
 * supporting figures. The faint arcs and the single green disc are decoration only (hidden from
 * screen readers); the figure counts up on arrival and can be masked with the eye control.
 */
export function HeroCard({
  label,
  value,
  format,
  caption,
  hidden,
  onToggleHidden,
  footer,
}: HeroCardProps) {
  return (
    <View
      style={[
        elevation.inverse,
        { borderRadius: radius.xl, padding: space[24], gap: space[24], overflow: 'hidden' },
      ]}
    >
      <View aria-hidden pointerEvents="none" style={{ position: 'absolute', right: 0, top: 0 }}>
        <Svg width={190} height={190} viewBox="0 0 190 190">
          <Circle
            cx="150"
            cy="40"
            r="118"
            stroke={colors.borderOnInverse}
            strokeWidth="1"
            fill="none"
          />
          <Circle
            cx="150"
            cy="40"
            r="84"
            stroke={colors.borderOnInverse}
            strokeWidth="1"
            fill="none"
          />
          <Circle
            cx="150"
            cy="40"
            r="50"
            stroke={colors.borderOnInverse}
            strokeWidth="1"
            fill="none"
          />
          <Circle cx="150" cy="40" r="18" fill={colors.brand} fillOpacity={0.9} />
        </Svg>
      </View>

      <View style={{ gap: space[8] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[8] }}>
          <AppText variant="labelLG" tone="onInverseMuted">
            {label}
          </AppText>
          {onToggleHidden ? (
            <PressableScale
              onPress={onToggleHidden}
              haptic="selection"
              accessibilityLabel={hidden ? 'Show figures' : 'Hide figures'}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              pressedStyle={{ backgroundColor: colors.transparent }}
            >
              <Icon
                icon={hidden ? icons.show : icons.hide}
                size="md"
                color={colors.textOnInverseMuted}
              />
            </PressableScale>
          ) : null}
        </View>
        <AnimatedNumber
          value={value}
          format={format}
          masked={hidden ? MASK : undefined}
          variant="metricXL"
          tone="onInverse"
        />
        {caption ? (
          <AppText variant="bodySM" tone="onInverseMuted">
            {caption}
          </AppText>
        ) : null}
      </View>

      {footer ? (
        <View
          style={{
            flexDirection: 'row',
            gap: space[16],
            paddingTop: space[16],
            borderTopWidth: 1,
            borderTopColor: colors.borderOnInverse,
          }}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
}

/** One supporting figure in a `HeroCard` footer. */
export function HeroStat({
  label,
  value,
  masked,
}: {
  label: string;
  value: string;
  masked?: boolean;
}) {
  return (
    <View
      style={{ flex: 1, gap: space[2] }}
      accessible
      accessibilityLabel={`${label}, ${masked ? 'hidden' : value}`}
    >
      <AppText variant="metricMD" tone="onInverse" numberOfLines={1}>
        {masked ? MASK : value}
      </AppText>
      <AppText variant="caption" tone="onInverseMuted" numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}
