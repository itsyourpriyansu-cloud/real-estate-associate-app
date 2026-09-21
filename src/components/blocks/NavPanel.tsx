import type { LucideIcon } from 'lucide-react-native';
import { Children, type ReactNode } from 'react';
import { View } from 'react-native';

import { colors, elevation, radius, space } from '@/design-system';

import { AppText } from '../primitives/AppText';
import { Icon } from '../primitives/Icon';
import { icons } from '../primitives/icons';
import { Divider } from '../primitives/Layout';
import { PressableScale } from '../primitives/PressableScale';
import { Reveal } from '../primitives/Reveal';

/** A white card holding a list of `NavRow`s separated by hairlines. Rows stagger in on arrival. */
export function NavPanel({ children }: { children: ReactNode }) {
  const rows = Children.toArray(children);
  return (
    <View style={[elevation.raised, { borderRadius: radius.xl, overflow: 'hidden' }]}>
      {rows.map((row, index) => (
        <Reveal key={index} index={index}>
          {index > 0 ? <Divider inset={space[16] + 44 + space[12]} /> : null}
          {row}
        </Reveal>
      ))}
    </View>
  );
}

export interface NavRowProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  /** Quiet trailing text (a count, a status). */
  meta?: string;
  onPress: () => void;
  accessibilityHint?: string;
}

/**
 * A destination: a green-tinted icon tile, a title with one supporting line, a chevron. The whole
 * row is the target (56pt+); it does not scale, it tints, so a full-width row never shrinks.
 */
export function NavRow({ icon, title, subtitle, meta, onPress, accessibilityHint }: NavRowProps) {
  return (
    <PressableScale
      onPress={onPress}
      haptic="light"
      scaleTo={1}
      accessibilityLabel={[title, subtitle, meta].filter(Boolean).join(', ')}
      accessibilityHint={accessibilityHint}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[12],
        paddingVertical: space[16],
        paddingHorizontal: space[16],
      }}
    >
      <View
        aria-hidden
        style={{
          width: 44,
          height: 44,
          borderRadius: radius.md,
          backgroundColor: colors.brandMuted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon icon={icon} size="xl" color={colors.brandStrong} />
      </View>
      <View style={{ flex: 1, gap: space[2] }}>
        <AppText variant="labelLG" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="bodySM" tone="secondary" numberOfLines={2}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {meta ? (
        <AppText variant="labelMD" tone="secondary">
          {meta}
        </AppText>
      ) : null}
      <Icon icon={icons.forward} size="lg" tone="tertiary" />
    </PressableScale>
  );
}
