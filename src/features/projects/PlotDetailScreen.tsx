import { useRouter } from 'expo-router';
import { View } from 'react-native';

import {
  AppText,
  Button,
  DetailHeader,
  EmptyState,
  LoadingState,
  PlotStatusBadge,
  PriceSummary,
  ResourceBoundary,
  Reveal,
  ScreenLayout,
  StatGrid,
  StatTile,
  SummaryPanel,
  icons,
} from '@/components';
import { space } from '@/design-system';
import { selectSessionKind, useAuthStore } from '@/store/authStore';
import { formatArea } from '@/utils/format';
import { FACING_LABEL } from '@/utils/labels';

import { usePlot } from './useProjects';

/**
 * Plot detail: the plot's facts, its status and a cost preview. Associates can book an available
 * or held plot from here; guests and clients see the facts and are pointed to an associate.
 */
export function PlotDetailScreen({ plotId }: { plotId: string }) {
  const router = useRouter();
  const isAssociate = useAuthStore(selectSessionKind) === 'associate';
  const resource = usePlot(plotId);
  const plot = resource.data?.plot;
  const bookable = !!plot && (plot.status === 'AVAILABLE' || plot.status === 'ON_HOLD');

  return (
    <ScreenLayout
      edges={['top', 'bottom']}
      header={
        <DetailHeader
          title={plot ? `Plot ${plot.plotNumber}` : 'Plot'}
          subtitle={resource.data?.project?.name}
          onBack={() => router.back()}
        />
      }
      stickyAction={
        isAssociate && bookable ? (
          <Button
            label="Book this plot"
            icon={icons.booking}
            onPress={() => router.push({ pathname: '/live-booking/[plotId]', params: { plotId } })}
            fullWidth
          />
        ) : undefined
      }
    >
      <ResourceBoundary
        resource={resource}
        subject="this plot"
        loading={<LoadingState variant="cards" count={2} />}
        isEmpty={(data) => data.plot === null}
        empty={
          <EmptyState
            icon={icons.plot}
            title="Plot not found"
            description="This plot may have been removed from the layout."
            actionLabel="Go back"
            onAction={() => router.back()}
          />
        }
      >
        {({ plot: p, project }) =>
          p ? (
            <>
              <Reveal index={0}>
                <View style={{ gap: space[8] }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[12] }}>
                    <AppText variant="displayLarge">{p.plotNumber}</AppText>
                    <PlotStatusBadge status={p.status} />
                  </View>
                  <AppText tone="secondary">
                    {[project?.name, p.block, p.phase && p.phase].filter(Boolean).join(' · ')}
                  </AppText>
                </View>
              </Reveal>

              <Reveal index={1}>
                <SummaryPanel title="Plot facts">
                  <StatGrid>
                    <StatTile label="Area" value={formatArea(p.areaSqYd)} />
                    <StatTile label="Facing" value={FACING_LABEL[p.facing]} />
                    <StatTile label="Road width" value={`${p.roadWidthFt} ft`} />
                    <StatTile label="Position" value={p.isCorner ? 'Corner' : 'Inside'} />
                  </StatGrid>
                </SummaryPanel>
              </Reveal>

              <Reveal index={2}>
                <SummaryPanel title="Cost preview">
                  <PriceSummary plot={p} />
                </SummaryPanel>
              </Reveal>

              {!isAssociate && bookable ? (
                <Reveal index={3}>
                  <AppText tone="secondary" style={{ textAlign: 'center' }}>
                    Interested in this plot? A Vara associate can book it for you.
                  </AppText>
                </Reveal>
              ) : null}
            </>
          ) : null
        }
      </ResourceBoundary>
    </ScreenLayout>
  );
}
