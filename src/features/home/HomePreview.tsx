import { useRouter } from 'expo-router';
import { Building2, CalendarPlus, CalendarX2, FileText, UserPlus } from 'lucide-react-native';
import { View } from 'react-native';

import { useToast, EmptyState, LoadingState } from '@/components/feedback';
import { HomeHeader } from '@/components/navigation';
import { ResourceBoundary, ScreenLayout } from '@/components/patterns';
import {
  ActivityRow,
  AttentionBanner,
  MetricStrip,
  NextActionCard,
  PerformanceSummary,
  PipelineSummary,
  QuickAction,
  QuickActionStrip,
  Section,
  TIMELINE_ICON,
  VisitCard,
} from '@/components';
import { Divider } from '@/components/primitives';
import { PROTOTYPE_BADGE_LABEL } from '@/constants/prototype';
import { AppText } from '@/components/primitives/AppText';
import { layout, space } from '@/design-system';
import { format } from 'date-fns';
import {
  firstName,
  formatLongDate,
  formatRelativePast,
  greetingFor,
  formatWhen,
  pluralize,
} from '@/utils/format';

import { useHomeData } from './useHomeData';
import { parked } from '@/utils/parkedRoutes';

/**
 * REPRESENTATIVE COMPOSITION (not the final Home). It exists to prove the design system works on
 * real seeded data: greeting → what needs attention → the next action → quick actions → today's
 * visits → pipeline → inventory → month → recent activity. Interactions that belong to later
 * stages say so honestly instead of pretending to work.
 */
export function HomePreview() {
  const router = useRouter();
  const toast = useToast();
  const home = useHomeData();
  const later = (what: string) => () =>
    toast.show({ tone: 'info', message: `${what} arrives in a later stage.` });

  return (
    <ScreenLayout
      header={
        home.data ? (
          <HomeHeader
            greeting={greetingFor(home.data.now)}
            name={firstName(home.data.user.fullName)}
            fullName={home.data.user.fullName}
            unreadCount={home.data.unreadNotifications}
            onSearch={() => router.push(parked('/search'))}
            onNotifications={() => router.push(parked('/notifications'))}
            onProfile={() => router.push('/profile')}
          />
        ) : (
          <HomeHeader
            greeting="Welcome"
            name=""
            fullName="Associate"
            onSearch={() => undefined}
            onNotifications={() => undefined}
            onProfile={() => undefined}
          />
        )
      }
      refreshing={false}
    >
      <ResourceBoundary
        resource={home}
        subject="your day"
        loading={<LoadingState variant="cards" count={2} />}
      >
        {(data) => {
          const {
            attention,
            nextAction,
            topOverdue,
            visitsToday,
            pipeline,
            inventory,
            performance,
            recent,
            now,
          } = data;
          return (
            <>
              <View style={{ gap: space[8] }}>
                <AppText tone="secondary">{formatLongDate(now)}</AppText>
                <MetricStrip
                  items={[
                    {
                      label:
                        pluralize(attention.leadsNeedingAttention, 'lead needs', 'leads need') +
                        ' attention',
                      value: String(attention.leadsNeedingAttention),
                    },
                    {
                      label:
                        pluralize(attention.visitsToday, 'site visit', 'site visits') + ' today',
                      value: String(attention.visitsToday),
                    },
                    {
                      label: pluralize(
                        attention.overdueTasks,
                        'overdue follow‑up',
                        'overdue follow‑ups',
                      ),
                      value: String(attention.overdueTasks),
                      tone: attention.overdueTasks > 0 ? 'danger' : 'primary',
                    },
                  ]}
                />
              </View>

              {topOverdue ? (
                <AttentionBanner
                  tone="danger"
                  title={`Overdue · ${topOverdue.task.title}`}
                  message={[topOverdue.lead?.fullName, formatWhen(topOverdue.task.scheduledAt, now)]
                    .filter(Boolean)
                    .join(' · ')}
                  actionLabel="Open"
                  onAction={() =>
                    topOverdue.lead
                      ? router.push(
                          parked({
                            pathname: '/leads/[leadId]',
                            params: { leadId: topOverdue.lead.id },
                          }),
                        )
                      : router.push(parked('/tasks'))
                  }
                />
              ) : null}

              {nextAction ? (
                <NextActionCard
                  task={nextAction.task}
                  lead={nextAction.lead}
                  now={now}
                  onCall={later('Calling')}
                  onWhatsApp={later('WhatsApp sharing')}
                  onOpen={() =>
                    router.push(
                      parked({
                        pathname: '/leads/[leadId]',
                        params: { leadId: nextAction.lead.id },
                      }),
                    )
                  }
                />
              ) : (
                <EmptyState
                  icon={CalendarX2}
                  title="Nothing scheduled yet"
                  description="Add a lead or schedule a follow-up to start your day."
                />
              )}

              <Section title="Quick actions">
                <QuickActionStrip>
                  <QuickAction icon={UserPlus} label="Add lead" onPress={later('Adding a lead')} />
                  <QuickAction
                    icon={CalendarPlus}
                    label="Schedule visit"
                    onPress={later('Scheduling a visit')}
                  />
                  <QuickAction
                    icon={Building2}
                    label="Check inventory"
                    onPress={() => router.push('/projects')}
                  />
                  <QuickAction
                    icon={FileText}
                    label="Create cost sheet"
                    onPress={later('Cost sheets')}
                  />
                </QuickActionStrip>
              </Section>

              <Section
                title="Today’s visits"
                meta={String(visitsToday.length)}
                actionLabel="See all"
                onActionPress={() => router.push(parked('/tasks'))}
              >
                {visitsToday.length === 0 ? (
                  <EmptyState
                    icon={CalendarX2}
                    title="No site visits today"
                    description="Visits you schedule for today will appear here."
                  />
                ) : (
                  <View style={{ gap: space[12] }}>
                    {visitsToday.map(({ visit, lead, project }) => (
                      <VisitCard
                        key={visit.id}
                        visit={visit}
                        customerName={lead?.fullName ?? 'Customer'}
                        projectName={project?.name ?? 'Project'}
                        now={now}
                        onPress={() =>
                          router.push(
                            parked({
                              pathname: '/visits/[visitId]',
                              params: { visitId: visit.id },
                            }),
                          )
                        }
                        onCall={later('Calling')}
                        onWhatsApp={later('WhatsApp sharing')}
                      />
                    ))}
                  </View>
                )}
              </Section>

              <Section
                title="Pipeline"
                meta={`${Object.values(pipeline).reduce((a, b) => a + b, 0)} leads`}
              >
                <PipelineSummary counts={pipeline} />
              </Section>

              <Section
                title="Inventory"
                meta="Prototype data"
                actionLabel="View"
                onActionPress={() => router.push('/projects')}
              >
                <MetricStrip
                  items={[
                    {
                      label: 'Plots available',
                      value: String(inventory.availablePlots),
                      size: 'xl',
                    },
                    { label: 'On hold', value: String(inventory.onHoldPlots), size: 'xl' },
                    { label: 'Projects', value: String(inventory.projects), size: 'xl' },
                  ]}
                />
              </Section>

              <Section title="This month" meta={format(now, 'MMMM')}>
                <PerformanceSummary
                  monthLabel={format(now, 'MMM')}
                  bookings={performance.bookings}
                  bookingValue={performance.bookingValue}
                  inBooking={performance.inBooking}
                />
              </Section>

              <Section title="Recent activity">
                <View>
                  {recent.map(({ event, leadName }, index) => (
                    <View key={event.id}>
                      {index > 0 ? <Divider inset={layout.minTapTarget - space[8]} /> : null}
                      <ActivityRow
                        icon={TIMELINE_ICON[event.type]}
                        title={leadName}
                        subtitle={event.title}
                        time={formatRelativePast(event.occurredAt, now)}
                      />
                    </View>
                  ))}
                </View>
              </Section>

              <AppText variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
                {PROTOTYPE_BADGE_LABEL} · nothing here is live
              </AppText>
            </>
          );
        }}
      </ResourceBoundary>
    </ScreenLayout>
  );
}
