import { useRouter } from 'expo-router';
import { View } from 'react-native';

import {
  AppText,
  Button,
  DetailHeader,
  EmptyState,
  Icon,
  InventorySummary,
  LoadingState,
  ProjectHero,
  ResourceBoundary,
  Reveal,
  ScreenLayout,
  StatGrid,
  StatTile,
  StatusChip,
  SummaryPanel,
  icons,
  statusGlyph,
} from '@/components';
import { colors, space } from '@/design-system';
import { formatAreaRange, formatInr } from '@/utils/format';
import { PROJECT_STATUS_LABEL } from '@/utils/labels';

import { useProjectDetail } from './useProjects';

/** Project detail: who, where, how far along, what it costs, what is left, and what it offers. */
export function ProjectDetailScreen({ projectId }: { projectId: string }) {
  const router = useRouter();
  const resource = useProjectDetail(projectId);
  const project = resource.data?.project;

  return (
    <ScreenLayout
      edges={['top', 'bottom']}
      header={<DetailHeader title={project?.name ?? 'Project'} onBack={() => router.back()} />}
      stickyAction={
        project ? (
          <Button
            label="View inventory"
            onPress={() =>
              router.push({ pathname: '/projects/[projectId]/inventory', params: { projectId } })
            }
            fullWidth
          />
        ) : undefined
      }
    >
      <ResourceBoundary
        resource={resource}
        subject="this project"
        loading={<LoadingState variant="projects" count={1} />}
        isEmpty={(data) => data.project === null}
        empty={
          <EmptyState
            icon={icons.projects}
            title="Project not found"
            description="It may have been removed. Head back to see all projects."
            actionLabel="All projects"
            onAction={() => router.back()}
          />
        }
      >
        {({ project: p, summary }) =>
          p ? (
            <>
              <Reveal index={0}>
                <ProjectHero project={p} />
              </Reveal>

              <Reveal index={1}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[8] }}>
                  <StatusChip
                    label={PROJECT_STATUS_LABEL[p.status]}
                    tone={p.status === 'COMPLETED' ? 'success' : 'brand'}
                    icon={statusGlyph(p.status === 'COMPLETED' ? 'check' : 'clock')}
                  />
                  <StatusChip
                    label={
                      p.availableUnits === 0 ? 'Sold out' : `${p.availableUnits} plots available`
                    }
                    tone={p.availableUnits === 0 ? 'neutral' : 'success'}
                    icon={statusGlyph(p.availableUnits === 0 ? 'minus' : 'dot')}
                  />
                </View>
              </Reveal>

              <Reveal index={2}>
                <SummaryPanel title="At a glance">
                  <StatGrid>
                    <StatTile label="Starting from" value={formatInr(p.startingPrice)} />
                    <StatTile label="Up to" value={p.maxPrice ? formatInr(p.maxPrice) : '–'} />
                    <StatTile
                      label="Plot sizes"
                      value={formatAreaRange(p.minPlotAreaSqYd, p.maxPlotAreaSqYd)}
                    />
                    <StatTile label="Available" value={`${p.availableUnits} of ${p.totalUnits}`} />
                  </StatGrid>
                </SummaryPanel>
              </Reveal>

              {summary ? (
                <Reveal index={3}>
                  <SummaryPanel title="Inventory">
                    <InventorySummary summary={summary} />
                  </SummaryPanel>
                </Reveal>
              ) : null}

              <Reveal index={4}>
                <SummaryPanel title="About this project">
                  <AppText tone="secondary">{p.description}</AppText>
                  <View style={{ gap: space[12] }}>
                    {p.highlights.map((highlight) => (
                      <View
                        key={highlight}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: space[12] }}
                      >
                        <Icon icon={icons.check} size="md" color={colors.brandStrong} />
                        <AppText style={{ flex: 1 }}>{highlight}</AppText>
                      </View>
                    ))}
                  </View>
                </SummaryPanel>
              </Reveal>

              <Reveal index={5}>
                <SummaryPanel title="Amenities">
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[8] }}>
                    {p.amenities.map((amenity) => (
                      <StatusChip key={amenity} label={amenity} />
                    ))}
                  </View>
                  {p.reraNumber ? (
                    <AppText variant="caption" tone="secondary">
                      Registration · {p.reraNumber} (demo label)
                    </AppText>
                  ) : null}
                </SummaryPanel>
              </Reveal>
            </>
          ) : null
        }
      </ResourceBoundary>
    </ScreenLayout>
  );
}
