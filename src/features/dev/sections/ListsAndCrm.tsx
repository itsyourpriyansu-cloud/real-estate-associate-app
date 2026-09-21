import { Bell, Calendar, Lock, Phone, Shield } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import {
  ActionRow,
  ActivityRow,
  ContactActionBar,
  LeadCard,
  LeadStageIndicator,
  LeadSummary,
  ListRow,
  MetricRow,
  NextActionCard,
  NotificationRow,
  SettingRow,
  TaskCard,
  TimelineEventRow,
  TimelineRow,
  VisitCard,
  VisitStatusChip,
} from '@/components';
import { Divider } from '@/components/primitives';
import { space } from '@/design-system';
import { type Task } from '@/domain';
import { ShowcaseSection, Specimen } from '../ShowcaseSection';
import { type ShowcaseData } from '../useShowcaseData';

const noop = () => undefined;

export function ListsAndCrm({ data }: { data: ShowcaseData }) {
  const { now, lead, leads, project, tasks, visits, notifications, timeline } = data;
  const [notify, setNotify] = useState(true);

  // Edge cases are derived from real data, not invented fixtures.
  const longLead = {
    ...lead,
    fullName: 'Venkata Subramanyam Raghavendra Chaudhary-Srinivasan',
    requirement: {
      ...lead.requirement,
      budgetMin: 85_000_000,
      budgetMax: 320_000_000,
      preferredLocations: ['Bangalore Highway', 'Airport Corridor', 'Outer Ring Growth Zone'],
    },
    unreadMessages: 12,
  };
  const overdueLead = leads.find((l) => l.nextActionAt && new Date(l.nextActionAt) < now);
  const noActionLead = leads.find(
    (l) => !l.nextActionAt && l.stage !== 'WON' && l.stage !== 'LOST',
  );
  const lostLead = leads.find((l) => l.stage === 'LOST');

  const openTask = tasks.find((t) => t.status === 'OPEN');
  const overdueTask = tasks.find((t) => t.status === 'OVERDUE');
  const doneTask = tasks.find((t) => t.status === 'DONE');
  const longTask: Task | undefined = openTask && {
    ...openTask,
    title:
      'Send the revised cost sheet with the corner-plot premium and the three-instalment payment schedule',
  };

  return (
    <>
      <ShowcaseSection
        title="List system"
        note="Rows sit on the page and are divided by hairlines — not boxed."
      >
        <View>
          <ListRow
            title="Rahul Sharma"
            subtitle="Follow-up today · 10:30 AM"
            meta="2 min ago"
            chevron
            onPress={noop}
          />
          <Divider />
          <ListRow
            title="Row with a very long title that has to truncate gracefully instead of breaking the layout"
            subtitle="Secondary text can wrap onto two lines and then truncate, like this one does when it runs long."
            chevron
            onPress={noop}
          />
          <Divider />
          <ActionRow
            label="Notifications"
            description="Follow-ups and inventory alerts"
            icon={Bell}
            onPress={noop}
          />
          <Divider />
          <ActionRow label="Delete lead" icon={Lock} destructive chevron={false} onPress={noop} />
          <Divider />
          <SettingRow
            label="Push notifications"
            description="Follow-up reminders"
            icon={Bell}
            switchValue={notify}
            onSwitchChange={setNotify}
          />
          <Divider />
          <SettingRow label="Appearance" icon={Shield} value="Dark · locked" />
        </View>
        <Specimen label="Metric rows">
          <View style={{ gap: space[8] }}>
            <MetricRow label="Base rate" value="₹18,000 / sq yd" />
            <MetricRow label="Estimated total" value="₹44.06L" emphasis />
          </View>
        </Specimen>
        <Specimen label="Timeline row · activity row">
          <TimelineRow
            icon={Phone}
            title="Intro call · 6 min"
            description="Budget ₹40–55L. Prefers an east-facing plot."
            time="8d ago"
          />
          <TimelineRow icon={Calendar} title="Site visit scheduled" time="2d ago" isLast />
          <Divider />
          <ActivityRow
            icon={Phone}
            title="Rahul Sharma"
            subtitle="Follow-up call · 9 min"
            time="2d ago"
          />
        </Specimen>
        <Specimen label="Notifications (unread · read)">
          {notifications.slice(0, 2).map((n, index) => (
            <NotificationRow
              key={n.id}
              notification={{ ...n, read: index === 1 }}
              now={now}
              onPress={noop}
            />
          ))}
        </Specimen>
      </ShowcaseSection>

      <ShowcaseSection
        title="CRM components"
        note="Lead, next action, task, visit, timeline, contact bar."
      >
        <Specimen label="LeadCard · typical">
          <LeadCard lead={lead} now={now} onPress={noop} onCall={noop} onWhatsApp={noop} />
        </Specimen>
        <Specimen label="LeadCard · very long name, ₹8.5Cr–32Cr, 3 locations, 12 unread">
          <LeadCard lead={longLead} now={now} onPress={noop} onCall={noop} onWhatsApp={noop} />
        </Specimen>
        {overdueLead ? (
          <Specimen label="LeadCard · overdue next action">
            <LeadCard lead={overdueLead} now={now} onPress={noop} onCall={noop} onWhatsApp={noop} />
          </Specimen>
        ) : null}
        {noActionLead ? (
          <Specimen label="LeadCard · no next action">
            <LeadCard
              lead={noActionLead}
              now={now}
              onPress={noop}
              onCall={noop}
              onWhatsApp={noop}
            />
          </Specimen>
        ) : null}
        <Specimen label="Lead summary · stage indicator (Visit, Lost)">
          <LeadSummary lead={lead} />
          <LeadStageIndicator stage={lead.stage} />
          {lostLead ? <LeadStageIndicator stage="LOST" /> : null}
        </Specimen>
        {openTask ? (
          <Specimen label="Next action card">
            <NextActionCard
              task={openTask}
              lead={lead}
              now={now}
              onCall={noop}
              onWhatsApp={noop}
              onOpen={noop}
            />
          </Specimen>
        ) : null}
        <Specimen label="Tasks · open · overdue · done · long title">
          <View>
            {[openTask, overdueTask, doneTask, longTask]
              .filter((t): t is Task => !!t)
              .map((task, index) => (
                <View key={`${task.id}-${index}`}>
                  {index > 0 ? <Divider /> : null}
                  <TaskCard
                    task={task}
                    now={now}
                    leadName="Rahul Sharma"
                    projectName="Real Rise"
                    onPress={noop}
                    onComplete={noop}
                  />
                </View>
              ))}
          </View>
        </Specimen>
        <Specimen label="Visits · every status">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[8] }}>
            {(
              ['SCHEDULED', 'CONFIRMED', 'EN_ROUTE', 'ARRIVED', 'COMPLETED', 'CANCELLED'] as const
            ).map((status) => (
              <VisitStatusChip key={status} status={status} />
            ))}
          </View>
          {visits[0] ? (
            <VisitCard
              visit={{ ...visits[0], status: 'CONFIRMED' }}
              customerName="Rahul Sharma"
              projectName={project.name}
              now={now}
              onPress={noop}
              onCall={noop}
              onWhatsApp={noop}
            />
          ) : null}
        </Specimen>
        <Specimen label="Timeline">
          <View>
            {timeline.map((event, index) => (
              <TimelineEventRow
                key={event.id}
                event={event}
                now={now}
                isLast={index === timeline.length - 1}
              />
            ))}
          </View>
        </Specimen>
        <Specimen label="Contact action bar">
          <ContactActionBar
            unreadMessages={2}
            onCall={noop}
            onWhatsApp={noop}
            onSchedule={noop}
            onNote={noop}
          />
        </Specimen>
      </ShowcaseSection>
    </>
  );
}
