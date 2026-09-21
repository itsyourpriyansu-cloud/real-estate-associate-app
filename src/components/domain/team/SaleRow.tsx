import { View } from 'react-native';

import type { SaleStatus } from '@/domain';
import { space, type Tone } from '@/design-system';

import { StatusChip } from '../../chips/StatusChip';
import { AppText } from '../../primitives/AppText';

const STATUS: Record<SaleStatus, { label: string; tone: Tone }> = {
  BOOKED: { label: 'Booked', tone: 'brand' },
  REGISTERED: { label: 'Registered', tone: 'success' },
  CANCELLED: { label: 'Cancelled', tone: 'danger' },
};

/**
 * One sale in a list: customer and where (title / subtitle), when, the value, and its state.
 * Presentational: the screen formats the strings, so the row stays free of repositories and dates.
 */
export function SaleRow({
  customer,
  detail,
  dateText,
  amountText,
  status,
}: {
  customer: string;
  detail: string;
  dateText: string;
  amountText: string;
  status: SaleStatus;
}) {
  const { label, tone } = STATUS[status];
  return (
    <View
      accessible
      accessibilityLabel={`${customer}, ${detail}, ${dateText}, ${amountText}, ${label}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[12],
        paddingVertical: space[12],
      }}
    >
      <View style={{ flex: 1, gap: space[2] }}>
        <AppText variant="labelLG" numberOfLines={1}>
          {customer}
        </AppText>
        <AppText variant="bodySM" tone="secondary" numberOfLines={1}>
          {detail} · {dateText}
        </AppText>
      </View>
      <View style={{ alignItems: 'flex-end', gap: space[4] }}>
        <AppText variant="labelLG" style={{ fontVariant: ['tabular-nums'] }}>
          {amountText}
        </AppText>
        <StatusChip label={label} tone={tone} size="sm" />
      </View>
    </View>
  );
}
