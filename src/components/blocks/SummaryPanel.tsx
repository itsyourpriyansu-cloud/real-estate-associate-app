import { Clock } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { colors, elevation, radius, space } from '@/design-system';

import { StatusChip } from '../chips/StatusChip';
import { AnimatedNumber } from '../primitives/AnimatedNumber';
import { AppText } from '../primitives/AppText';

/** A white card that groups a small set of related figures. */
export function SummaryPanel({
  title,
  right,
  children,
}: {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View
      style={[elevation.raised, { borderRadius: radius.xl, padding: space[20], gap: space[16] }]}
    >
      {title ? (
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <AppText variant="headingSM" header>
            {title}
          </AppText>
          {right}
        </View>
      ) : null}
      {children}
    </View>
  );
}

/** Rows of two `StatTile`s. Wraps automatically; a lone last tile spans its own row. */
export function StatGrid({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[12] }}>{children}</View>;
}

export interface StatTileProps {
  label: string;
  /** A number counts up (with `format`); a string is shown as is. */
  value?: number | string;
  format?: (value: number) => string;
  caption?: string;
  /** The figure does not exist yet: shows "Pending" with a "Not yet added" note instead of a zero. */
  pending?: boolean;
  masked?: string;
}

/**
 * A centred figure on a quiet tile. Two tiles sit side by side (`StatGrid`). `pending` is a real
 * state: a figure that has not been recorded is never drawn as 0.
 */
export function StatTile({ label, value, format, caption, pending, masked }: StatTileProps) {
  const spoken = pending
    ? `${label}, pending, not yet added`
    : `${label}, ${masked ?? (typeof value === 'number' ? (format?.(value) ?? value) : value)}`;
  return (
    <View
      accessible
      accessibilityLabel={spoken}
      style={{
        flexGrow: 1,
        flexBasis: '44%',
        borderRadius: radius.lg,
        backgroundColor: colors.surfaceSecondary,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
        paddingVertical: space[16],
        paddingHorizontal: space[12],
        alignItems: 'center',
        gap: space[6],
      }}
    >
      <AppText variant="labelMD" tone="secondary" style={{ textAlign: 'center' }} numberOfLines={2}>
        {label}
      </AppText>
      {pending ? (
        <View style={{ alignItems: 'center', gap: space[4] }}>
          <StatusChip label="Pending" icon={Clock} size="sm" />
          <AppText variant="caption" tone="secondary">
            Not yet added
          </AppText>
        </View>
      ) : typeof value === 'number' ? (
        <AnimatedNumber value={value} format={format} masked={masked} variant="metricMD" />
      ) : (
        <AppText
          variant="metricMD"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          style={{ textAlign: 'center' }}
        >
          {masked ?? value}
        </AppText>
      )}
      {!pending && caption ? (
        <AppText variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
          {caption}
        </AppText>
      ) : null}
    </View>
  );
}
