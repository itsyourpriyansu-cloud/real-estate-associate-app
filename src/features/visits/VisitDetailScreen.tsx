import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import {
  AppText,
  DetailHeader,
  Divider,
  EmptyState,
  ListRow,
  LoadingState,
  ResourceBoundary,
  Reveal,
  ScreenLayout,
  StatusChip,
  SummaryPanel,
  VisitStatusChip,
  icons,
} from '@/components';
import { space } from '@/design-system';
import { formatArea, formatInr } from '@/utils/format';
import { VISIT_OUTCOME_LABEL } from '@/utils/labels';

import { useVisitDetail } from './useVisits';

/** One site visit: who, where, when, how it went, and the plots that were shortlisted. */
export function VisitDetailScreen({ visitId }: { visitId: string }) {
  const router = useRouter();
  const resource = useVisitDetail(visitId);

  return (
    <ScreenLayout
      edges={['top', 'bottom']}
      header={<DetailHeader title="Site visit" onBack={() => router.back()} />}
    >
      <ResourceBoundary
        resource={resource}
        subject="this visit"
        loading={<LoadingState variant="cards" count={2} />}
        isEmpty={(data) => data.visit === null}
        empty={
          <EmptyState
            icon={icons.siteVisits}
            title="Visit not found"
            description="It may have been removed from your history."
            actionLabel="Back to visits"
            onAction={() => router.back()}
          />
        }
      >
        {({ visit, lead, project, plots }) =>
          visit ? (
            <>
              <Reveal index={0}>
                <View style={{ gap: space[8] }}>
                  <AppText variant="headingXL" header>
                    {lead?.fullName ?? 'Customer'}
                  </AppText>
                  <AppText tone="secondary">
                    {project?.name ?? 'Project'} ·{' '}
                    {format(new Date(visit.scheduledAt), 'EEE d MMM, h:mm a')}
                  </AppText>
                  <View style={{ alignSelf: 'flex-start' }}>
                    <VisitStatusChip status={visit.status} />
                  </View>
                </View>
              </Reveal>

              <Reveal index={1}>
                <SummaryPanel title="Outcome">
                  {visit.outcome ? (
                    <>
                      <AppText variant="headingSM">{VISIT_OUTCOME_LABEL[visit.outcome]}</AppText>
                      {visit.feedbackTags.length > 0 ? (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[8] }}>
                          {visit.feedbackTags.map((tag) => (
                            <StatusChip key={tag} label={tag} />
                          ))}
                        </View>
                      ) : null}
                      {visit.note ? <AppText tone="secondary">{visit.note}</AppText> : null}
                    </>
                  ) : (
                    <AppText tone="secondary">
                      The outcome is recorded once the visit is completed.
                    </AppText>
                  )}
                </SummaryPanel>
              </Reveal>

              {plots.length > 0 ? (
                <Reveal index={2}>
                  <SummaryPanel title={`Shortlisted plots · ${plots.length}`}>
                    <View>
                      {plots.map((plot, index) => (
                        <View key={plot.id}>
                          {index > 0 ? <Divider /> : null}
                          <ListRow
                            title={`Plot ${plot.plotNumber}`}
                            subtitle={`${formatArea(plot.areaSqYd)} · ${formatInr(plot.estimatedTotal)}`}
                            chevron
                            onPress={() =>
                              router.push({
                                pathname: '/plots/[plotId]',
                                params: { plotId: plot.id },
                              })
                            }
                          />
                        </View>
                      ))}
                    </View>
                  </SummaryPanel>
                </Reveal>
              ) : null}
            </>
          ) : null
        }
      </ResourceBoundary>
    </ScreenLayout>
  );
}
