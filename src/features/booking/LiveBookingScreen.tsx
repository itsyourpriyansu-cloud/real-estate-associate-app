import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import {
  AppText,
  Button,
  ChipRow,
  DetailHeader,
  EmptyState,
  FilterChip,
  LoadingState,
  PlotCard,
  ResourceBoundary,
  Reveal,
  ScreenLayout,
  icons,
} from '@/components';
import { space } from '@/design-system';

import { usePlots, useProjects } from '../projects/useProjects';

/**
 * 2 · LIVE BOOKING — pick a project, pick a plot that can be booked, continue. The plot grid shows
 * available plots and plots on hold (a hold can be converted to a booking). Nothing is saved until
 * the confirm step.
 */
export function LiveBookingScreen() {
  const router = useRouter();
  const projects = useProjects();
  const [projectId, setProjectId] = useState<string | undefined>();
  const [plotId, setPlotId] = useState<string | undefined>();

  // Until the user picks one, the first project is the active one.
  const activeProjectId = projectId ?? projects.data?.[0]?.id;

  const plots = usePlots(activeProjectId ?? '', ['AVAILABLE', 'ON_HOLD']);
  const selected = plots.data?.find((p) => p.id === plotId);

  return (
    <ScreenLayout
      edges={['top', 'bottom']}
      onRefresh={plots.reload}
      refreshing={false}
      header={<DetailHeader title="Live booking" onBack={() => router.back()} />}
      stickyAction={
        <Button
          label={selected ? `Continue with plot ${selected.plotNumber}` : 'Choose a plot'}
          icon={icons.booking}
          disabled={!selected}
          onPress={() =>
            selected &&
            router.push({ pathname: '/live-booking/[plotId]', params: { plotId: selected.id } })
          }
          fullWidth
        />
      }
    >
      <Reveal index={0}>
        <View style={{ gap: space[4] }}>
          <AppText variant="headingLG" header>
            Which plot is the customer taking?
          </AppText>
          <AppText tone="secondary">Choose a project, then tap a plot.</AppText>
        </View>
      </Reveal>

      <ChipRow>
        {(projects.data ?? []).map((project) => (
          <FilterChip
            key={project.id}
            label={project.name}
            count={project.availableUnits}
            selected={activeProjectId === project.id}
            onPress={() => {
              setProjectId(project.id);
              setPlotId(undefined);
            }}
          />
        ))}
      </ChipRow>

      {activeProjectId ? (
        <ResourceBoundary
          resource={plots}
          subject="the plots"
          loading={<LoadingState variant="cards" count={3} />}
          isEmpty={(all) => all.length === 0}
          empty={
            <EmptyState
              icon={icons.plot}
              title="Nothing to book here"
              description="Every plot in this project is booked or blocked. Try another project."
            />
          }
        >
          {(all) => (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[12] }}>
              {all.map((plot, index) => (
                <View key={plot.id} style={{ flexBasis: '47%', flexGrow: 1 }}>
                  <Reveal index={index}>
                    <PlotCard
                      plot={plot}
                      selected={plotId === plot.id}
                      onPress={() => setPlotId(plot.id)}
                    />
                  </Reveal>
                </View>
              ))}
            </View>
          )}
        </ResourceBoundary>
      ) : null}
    </ScreenLayout>
  );
}
