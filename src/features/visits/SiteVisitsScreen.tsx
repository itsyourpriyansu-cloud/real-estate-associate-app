import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import {
  ChipRow,
  DetailHeader,
  EmptyState,
  FilterChip,
  LoadingState,
  NavPanel,
  ResourceBoundary,
  Reveal,
  ScreenLayout,
  StatGrid,
  StatTile,
  SummaryPanel,
  VisitHistoryRow,
  icons,
} from '@/components';
import type { SiteVisit } from '@/domain';
import { formatTime } from '@/utils/format';

import { useVisitHistory } from './useVisits';

type Filter = 'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
const LABEL: Record<Filter, string> = {
  ALL: 'All',
  UPCOMING: 'Upcoming',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const matches = (visit: SiteVisit, filter: Filter) => {
  if (filter === 'ALL') return true;
  if (filter === 'UPCOMING') return visit.status !== 'COMPLETED' && visit.status !== 'CANCELLED';
  return visit.status === filter;
};

/** 4 · SITE VISITS HISTORY — every visit you have led or have coming up: logs, details, statuses. */
export function SiteVisitsScreen() {
  const router = useRouter();
  const resource = useVisitHistory();
  const [filter, setFilter] = useState<Filter>('ALL');

  const count = useMemo(() => {
    const visits = resource.data?.visits ?? [];
    return (f: Filter) => visits.filter((v) => matches(v, f)).length;
  }, [resource.data]);

  return (
    <ScreenLayout
      onRefresh={resource.reload}
      refreshing={false}
      edges={['top', 'bottom']}
      header={<DetailHeader title="Site visits" onBack={() => router.back()} />}
    >
      <ResourceBoundary
        resource={resource}
        subject="your site visits"
        loading={<LoadingState variant="rows" count={4} />}
        isEmpty={(data) => data.visits.length === 0}
        empty={
          <EmptyState
            icon={icons.siteVisits}
            title="No site visits yet"
            description="Visits you schedule with customers appear here with their status."
          />
        }
      >
        {({ visits, customers, projects }) => {
          const visible = visits.filter((v) => matches(v, filter));
          return (
            <>
              <Reveal index={0}>
                <SummaryPanel>
                  <StatGrid>
                    <StatTile label="Upcoming" value={count('UPCOMING')} />
                    <StatTile label="Completed" value={count('COMPLETED')} />
                  </StatGrid>
                </SummaryPanel>
              </Reveal>

              <ChipRow>
                {(Object.keys(LABEL) as Filter[]).map((f) => (
                  <FilterChip
                    key={f}
                    label={LABEL[f]}
                    count={count(f)}
                    selected={filter === f}
                    onPress={() => setFilter(f)}
                  />
                ))}
              </ChipRow>

              {visible.length === 0 ? (
                <EmptyState
                  icon={icons.siteVisits}
                  title={`No ${LABEL[filter].toLowerCase()} visits`}
                  description="Try another filter to see the rest of your visits."
                  actionLabel="Show all"
                  onAction={() => setFilter('ALL')}
                />
              ) : (
                <NavPanel>
                  {visible.map((visit) => (
                    <VisitHistoryRow
                      key={visit.id}
                      visit={visit}
                      customer={customers[visit.leadId] ?? 'Customer'}
                      project={projects[visit.projectId] ?? 'Project'}
                      dayNumber={format(new Date(visit.scheduledAt), 'd')}
                      monthShort={format(new Date(visit.scheduledAt), 'MMM')}
                      timeText={formatTime(visit.scheduledAt)}
                      onPress={() =>
                        router.push({
                          pathname: '/site-visits/[visitId]',
                          params: { visitId: visit.id },
                        })
                      }
                    />
                  ))}
                </NavPanel>
              )}
            </>
          );
        }}
      </ResourceBoundary>
    </ScreenLayout>
  );
}
