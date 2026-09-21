import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import {
  ChipRow,
  DetailHeader,
  EmptyState,
  FilterChip,
  LoadingState,
  PlotCard,
  PlotLegend,
  ResourceBoundary,
  Reveal,
  ScreenLayout,
  SummaryPanel,
  icons,
} from '@/components';
import type { Plot, PlotStatus } from '@/domain';
import { space } from '@/design-system';

import { usePlots, useProjectDetail } from './useProjects';

type Filter = 'ALL' | 'AVAILABLE' | 'ON_HOLD' | 'BOOKED';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'AVAILABLE', label: 'Available' },
  { key: 'ON_HOLD', label: 'On hold' },
  { key: 'BOOKED', label: 'Booked' },
];

/** Plot grid for one project: a status legend, filters with live counts, and a two-column grid. */
export function InventoryScreen({ projectId }: { projectId: string }) {
  const router = useRouter();
  const project = useProjectDetail(projectId);
  const plots = usePlots(projectId);
  const [filter, setFilter] = useState<Filter>('ALL');

  const counts = useMemo(() => {
    const all = plots.data ?? [];
    return (f: Filter) => (f === 'ALL' ? all.length : all.filter((p) => p.status === f).length);
  }, [plots.data]);

  const visible = (all: Plot[]) =>
    filter === 'ALL' ? all : all.filter((p) => p.status === (filter as PlotStatus));

  return (
    <ScreenLayout
      onRefresh={plots.reload}
      refreshing={false}
      header={
        <DetailHeader
          title="Inventory"
          subtitle={project.data?.project?.name}
          onBack={() => router.back()}
        />
      }
    >
      <SummaryPanel>
        <PlotLegend />
      </SummaryPanel>

      <ChipRow>
        {FILTERS.map(({ key, label }) => (
          <FilterChip
            key={key}
            label={label}
            count={plots.data ? counts(key) : undefined}
            selected={filter === key}
            onPress={() => setFilter(key)}
          />
        ))}
      </ChipRow>

      <ResourceBoundary
        resource={plots}
        subject="the plots"
        loading={<LoadingState variant="cards" count={3} />}
        isEmpty={(all) => visible(all).length === 0}
        empty={
          <EmptyState
            icon={icons.plot}
            title="No plots match"
            description="No plots have this status right now."
            actionLabel="Show all plots"
            onAction={() => setFilter('ALL')}
          />
        }
      >
        {(all) => (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[12] }}>
            {visible(all).map((plot, index) => (
              <View key={plot.id} style={{ flexBasis: '47%', flexGrow: 1 }}>
                <Reveal index={index}>
                  <PlotCard
                    plot={plot}
                    onPress={() =>
                      router.push({ pathname: '/plots/[plotId]', params: { plotId: plot.id } })
                    }
                  />
                </Reveal>
              </View>
            ))}
          </View>
        )}
      </ResourceBoundary>
    </ScreenLayout>
  );
}
