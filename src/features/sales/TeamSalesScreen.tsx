import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import {
  AppText,
  Avatar,
  ChipRow,
  DetailHeader,
  Divider,
  EmptyState,
  FilterChip,
  LoadingState,
  ProgressBar,
  ResourceBoundary,
  Reveal,
  SaleRow,
  ScreenLayout,
  StatGrid,
  StatTile,
  SummaryPanel,
  icons,
} from '@/components';
import { space } from '@/design-system';
import { formatInr, groupIndian } from '@/utils/format';

import {
  availablePeriods,
  performanceFor,
  periodLabel,
  periodOf,
  rankSellers,
} from './salesSelectors';
import { useTeamSales } from './useTeamSales';

const percent = (value: number | null) => (value === null ? '–' : `${Math.round(value * 100)}%`);

/** 5 · TEAM SALES — how the team is doing against its target this month, who is selling, and what sold. */
export function TeamSalesScreen() {
  const router = useRouter();
  const resource = useTeamSales();
  const [chosen, setChosen] = useState<string | undefined>();

  const periods = useMemo(
    () => (resource.data ? availablePeriods(resource.data.sales, resource.data.targets) : []),
    [resource.data],
  );
  const period = chosen ?? periods[0];

  return (
    <ScreenLayout
      onRefresh={resource.reload}
      refreshing={false}
      edges={['top', 'bottom']}
      header={<DetailHeader title="Team sales" onBack={() => router.back()} />}
    >
      <ResourceBoundary
        resource={resource}
        subject="team sales"
        loading={<LoadingState variant="cards" count={2} />}
        isEmpty={(data) => data.sales.length === 0 && data.targets.length === 0}
        empty={
          <EmptyState
            icon={icons.teamSales}
            title="No sales yet"
            description="Once your team books plots, performance against target shows up here."
            actionLabel="Book a plot"
            onAction={() => router.push('/live-booking')}
          />
        }
      >
        {({ sales, targets, names, projectNames }) => {
          if (!period) return null;
          const performance = performanceFor(period, sales, targets);
          const inMonth = sales.filter((s) => periodOf(s.bookedAt) === period);
          const ranking = rankSellers(inMonth).slice(0, 3);

          return (
            <>
              <ChipRow>
                {periods.map((p) => (
                  <FilterChip
                    key={p}
                    label={periodLabel(p)}
                    selected={p === period}
                    onPress={() => setChosen(p)}
                  />
                ))}
              </ChipRow>

              <Reveal index={0}>
                <SummaryPanel
                  title="Target progress"
                  right={
                    <AppText variant="labelLG" tone="brand">
                      {percent(performance.areaProgress)}
                    </AppText>
                  }
                >
                  {performance.target ? (
                    <View style={{ gap: space[20] }}>
                      <ProgressBar
                        value={performance.areaProgress ?? 0}
                        label={`Area target, ${percent(performance.areaProgress)}`}
                        startCaption={`${groupIndian(Math.round(performance.totals.areaSqYd))} sq yd sold`}
                        endCaption={`Target ${groupIndian(performance.target.targetAreaSqYd)}`}
                      />
                      <ProgressBar
                        value={performance.amountProgress ?? 0}
                        label={`Value target, ${percent(performance.amountProgress)}`}
                        startCaption={`${formatInr(performance.totals.amount)} sold`}
                        endCaption={`Target ${formatInr(performance.target.targetAmount)}`}
                      />
                    </View>
                  ) : (
                    <AppText tone="secondary">No target was set for {periodLabel(period)}.</AppText>
                  )}
                </SummaryPanel>
              </Reveal>

              <Reveal index={1}>
                <SummaryPanel title={periodLabel(period)}>
                  <StatGrid>
                    <StatTile label="Plots sold" value={performance.totals.count} />
                    <StatTile
                      label="Area"
                      value={performance.totals.areaSqYd}
                      format={(n) => `${groupIndian(Math.round(n))} sq yd`}
                    />
                    <StatTile label="Value" value={formatInr(performance.totals.amount)} />
                    <StatTile label="Sellers" value={rankSellers(inMonth).length} />
                  </StatGrid>
                </SummaryPanel>
              </Reveal>

              {ranking.length > 0 ? (
                <Reveal index={2}>
                  <SummaryPanel title="Top sellers">
                    <View>
                      {ranking.map((rank, index) => (
                        <View key={rank.associateId}>
                          {index > 0 ? <Divider /> : null}
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: space[12],
                              paddingVertical: space[12],
                            }}
                          >
                            <AppText variant="metricMD" tone="secondary" style={{ width: 24 }}>
                              {index + 1}
                            </AppText>
                            <Avatar name={names[rank.associateId] ?? '?'} size="sm" />
                            <View style={{ flex: 1 }}>
                              <AppText variant="labelLG" numberOfLines={1}>
                                {names[rank.associateId] ?? 'Former member'}
                              </AppText>
                              <AppText variant="bodySM" tone="secondary">
                                {rank.totals.count} {rank.totals.count === 1 ? 'plot' : 'plots'}
                              </AppText>
                            </View>
                            <AppText variant="labelLG" style={{ fontVariant: ['tabular-nums'] }}>
                              {formatInr(rank.totals.amount)}
                            </AppText>
                          </View>
                        </View>
                      ))}
                    </View>
                  </SummaryPanel>
                </Reveal>
              ) : null}

              <Reveal index={3}>
                <SummaryPanel title="Sales this month">
                  {inMonth.length === 0 ? (
                    <AppText tone="secondary">No sales recorded in {periodLabel(period)}.</AppText>
                  ) : (
                    <View>
                      {inMonth.map((sale, index) => (
                        <View key={sale.id}>
                          {index > 0 ? <Divider /> : null}
                          <SaleRow
                            customer={sale.customerName}
                            detail={`${projectNames[sale.projectId] ?? 'Project'} · ${names[sale.associateId] ?? 'Team'}`}
                            dateText={format(new Date(sale.bookedAt), 'd MMM')}
                            amountText={formatInr(sale.amount)}
                            status={sale.status}
                          />
                        </View>
                      ))}
                    </View>
                  )}
                </SummaryPanel>
              </Reveal>
            </>
          );
        }}
      </ResourceBoundary>
    </ScreenLayout>
  );
}
