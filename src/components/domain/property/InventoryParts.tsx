import { View } from 'react-native';

import type { PlotStatus } from '@/domain';
import { colors, plotStatusTokens, radius, space } from '@/design-system';
import type { InventorySummary as InventorySummaryData } from '@/repositories/contracts';

import { AppText } from '../../primitives/AppText';
import { Icon, statusGlyph } from '../../primitives/Icon';

const ORDER: readonly PlotStatus[] = ['AVAILABLE', 'ON_HOLD', 'BOOKED', 'BLOCKED', 'NOT_FOR_SALE'];
const KEY: Record<PlotStatus, keyof InventorySummaryData> = {
  AVAILABLE: 'available',
  ON_HOLD: 'on_hold',
  BOOKED: 'booked',
  BLOCKED: 'blocked',
  NOT_FOR_SALE: 'not_for_sale',
};

/**
 * Inventory at a glance: a thin proportional bar and, beneath it, every status as icon + label +
 * count. The bar is the shape; the legend rows are the truth (colour is never the only carrier).
 */
export function InventorySummary({ summary }: { summary: InventorySummaryData }) {
  const count = (status: PlotStatus) => Number(summary[KEY[status]]);
  return (
    <View style={{ gap: space[16] }}>
      <View
        accessible
        accessibilityLabel={`Inventory: ${summary.total} plots. ${ORDER.map((s) => `${plotStatusTokens[s].label} ${count(s)}`).join(', ')}`}
        style={{
          flexDirection: 'row',
          height: 8,
          borderRadius: radius.pill,
          overflow: 'hidden',
          gap: space[2],
        }}
      >
        {ORDER.map((status) =>
          count(status) > 0 ? (
            <View
              key={status}
              style={{
                flex: count(status),
                backgroundColor: plotStatusTokens[status].color,
                opacity: 0.85,
              }}
            />
          ) : null,
        )}
        {summary.total === 0 ? (
          <View style={{ flex: 1, backgroundColor: colors.surfaceElevated }} />
        ) : null}
      </View>
      <View style={{ gap: space[12] }}>
        {ORDER.map((status) => {
          const token = plotStatusTokens[status];
          return (
            <View
              key={status}
              style={{ flexDirection: 'row', alignItems: 'center', gap: space[12] }}
            >
              <Icon icon={statusGlyph(token.icon)} size="md" color={token.color} />
              <AppText style={{ flex: 1 }} tone="secondary">
                {token.label}
              </AppText>
              <AppText variant="labelLG" style={{ fontVariant: ['tabular-nums'] }}>
                {count(status)}
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** Small label-over-value pair for project and plot facts ("Starting price / ₹26.8L"). */
export function PropertyMetric({
  label,
  value,
  align = 'left',
}: {
  label: string;
  value: string;
  align?: 'left' | 'right';
}) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={{ gap: space[2], alignItems: align === 'right' ? 'flex-end' : 'flex-start' }}
    >
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
      <AppText variant="labelLG" numberOfLines={2} style={{ fontVariant: ['tabular-nums'] }}>
        {value}
      </AppText>
    </View>
  );
}
