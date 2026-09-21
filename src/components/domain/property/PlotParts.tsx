import { View } from 'react-native';

import type { PlotStatus } from '@/domain';
import { plotStatusTokens, space } from '@/design-system';

import { StatusChip } from '../../chips/StatusChip';
import { statusGlyph } from '../../primitives/Icon';

/**
 * Inventory status, always as text + icon + tone (spec §9.2): Available (dot), On hold (clock),
 * Booked (check), Blocked (lock), Not for sale (minus). Colour reinforces; it is never alone.
 */
export function PlotStatusBadge({
  status,
  size = 'sm',
}: {
  status: PlotStatus;
  size?: 'sm' | 'md';
}) {
  const token = plotStatusTokens[status];
  return (
    <StatusChip
      label={token.label}
      tone={token.tone}
      icon={statusGlyph(token.icon)}
      size={size}
      accessibilityLabel={`Status: ${token.label}`}
    />
  );
}

const ORDER: readonly PlotStatus[] = ['AVAILABLE', 'ON_HOLD', 'BOOKED', 'BLOCKED', 'NOT_FOR_SALE'];

/** The persistent inventory legend (spec §14.8): every status, with its icon. */
export function PlotLegend() {
  return (
    <View
      accessible
      accessibilityLabel={`Legend: ${ORDER.map((status) => plotStatusTokens[status].label).join(', ')}`}
      style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[8] }}
    >
      {ORDER.map((status) => (
        <PlotStatusBadge key={status} status={status} />
      ))}
    </View>
  );
}
