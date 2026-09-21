import { Building2, CalendarPlus, FileText, UserPlus } from 'lucide-react-native';
import { View } from 'react-native';
import {
  AttentionBanner,
  ConversationRow,
  InventorySummary,
  MessageBubble,
  MetricBlock,
  MetricStrip,
  PerformanceSummary,
  PipelineSummary,
  PlotCard,
  PlotLegend,
  PriceSummary,
  ProgressMeter,
  ProjectCard,
  ProjectHero,
  PropertyMatchCard,
  PropertyMetric,
  QuickAction,
  QuickActionStrip,
  QuickReplyChip,
  SectionHeader,
  UnreadBadge,
  WhatsAppTemplateCard,
} from '@/components';
import { Avatar, Divider } from '@/components/primitives';
import { space } from '@/design-system';
import { ShowcaseSection, Specimen } from '../ShowcaseSection';
import { type ShowcaseData } from '../useShowcaseData';

const noop = () => undefined;

export function PropertyCommsDashboard({ data }: { data: ShowcaseData }) {
  const { now, project, plots, plotByStatus, summary } = data;

  // Edge cases are derived from real data, not invented fixtures.

  const hugePlot = plotByStatus.AVAILABLE && {
    ...plotByStatus.AVAILABLE,
    estimatedTotal: 1_234_567_890,
    plotNumber: '1204',
  };
  const rich = data.conversationWithRichMessages;

  return (
    <>
      <ShowcaseSection
        title="Property components"
        note="Every plot status is text + icon + tone. Prices are tabular and never overflow."
      >
        <Specimen label="Project card">
          <ProjectCard project={project} onPress={noop} onViewInventory={noop} onShare={noop} />
        </Specimen>
        <Specimen label="Project card · long name, sold out">
          <ProjectCard
            project={{
              ...project,
              name: 'Aurelia Greens Signature Collection Phase Two Extension',
              availableUnits: 0,
            }}
            onPress={noop}
            onViewInventory={noop}
            onShare={noop}
          />
        </Specimen>
        <Specimen label="Project hero">
          <ProjectHero project={project} />
        </Specimen>
        <Specimen label="Plot cards · all five statuses">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[12] }}>
            {(['AVAILABLE', 'ON_HOLD', 'BOOKED', 'BLOCKED', 'NOT_FOR_SALE'] as const).map(
              (status) => {
                const plot = plotByStatus[status];
                return plot ? (
                  <View key={status} style={{ width: '47.5%', flexGrow: 1 }}>
                    <PlotCard plot={plot} selected={status === 'AVAILABLE'} onPress={noop} />
                  </View>
                ) : null;
              },
            )}
            {hugePlot ? (
              <View style={{ width: '47.5%', flexGrow: 1 }}>
                <PlotCard plot={hugePlot} onPress={noop} />
              </View>
            ) : null}
          </View>
        </Specimen>
        <Specimen label="Legend · inventory summary">
          <PlotLegend />
          <InventorySummary summary={summary} />
        </Specimen>
        <Specimen label="Property metrics">
          <View style={{ flexDirection: 'row', gap: space[24] }}>
            <PropertyMetric label="Starting from" value="₹26.8L" />
            <PropertyMetric label="Plot sizes" value="150–360 sq yd" />
            <PropertyMetric
              label="Available"
              value={`${project.availableUnits} / ${project.totalUnits}`}
            />
          </View>
        </Specimen>
        <Specimen label="Property match">
          <PropertyMatchCard
            project={project}
            matchingPlots={7}
            reasons={['Within budget', 'East facing available', 'Preferred location']}
            onPress={noop}
          />
        </Specimen>
        {plots[0] ? (
          <Specimen label="Price summary (cost preview)">
            <PriceSummary plot={plotByStatus.AVAILABLE ?? plots[0]} />
          </Specimen>
        ) : null}
      </ShowcaseSection>

      <ShowcaseSection
        title="Communication components"
        note="Prototype inbox over seeded threads — not live WhatsApp."
      >
        <Specimen label="Conversation rows · unread and read">
          <View>
            {data.conversations.slice(0, 3).map((c, index) => (
              <View key={c.id}>
                {index > 0 ? <Divider inset={52} /> : null}
                <ConversationRow
                  conversation={c}
                  customerName={
                    index === 0 ? 'Rahul Sharma' : index === 1 ? 'Ananya Iyer' : 'Mohammed Faizan'
                  }
                  projectName="Real Rise"
                  now={now}
                  onPress={noop}
                />
              </View>
            ))}
          </View>
        </Specimen>
        {rich ? (
          <Specimen label="Message bubbles · text, project card, visit confirmation, delivery states">
            <View style={{ gap: space[8] }}>
              {rich.messages.slice(0, 5).map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
            </View>
          </Specimen>
        ) : null}
        <Specimen label="Template · quick replies · unread badge">
          <WhatsAppTemplateCard
            title="Site visit reminder"
            preview="Hi Rahul, a quick reminder about your visit to Real Rise tomorrow at 3:30 PM. Reply here if you need to reschedule."
            onUse={noop}
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[8] }}>
            <QuickReplyChip label="On my way" />
            <QuickReplyChip label="Share brochure" />
            <QuickReplyChip label="Confirm visit" />
          </View>
          <View style={{ flexDirection: 'row', gap: space[12], alignItems: 'center' }}>
            <UnreadBadge count={3} />
            <UnreadBadge count={42} />
            <UnreadBadge count={128} />
            <Avatar name="Rahul Sharma" size="sm" />
            <Avatar name="K. V. Raghunath Reddy" size="md" verified />
            <Avatar name="Ananya Iyer" size="lg" />
          </View>
        </Specimen>
      </ShowcaseSection>

      <ShowcaseSection
        title="Dashboard components"
        note="Numbers lead; labels are quiet. Metrics are typography, not boxes."
      >
        <Specimen label="Section header">
          <SectionHeader
            title="Today’s visits"
            meta="2"
            actionLabel="See all"
            onActionPress={noop}
          />
        </Specimen>
        <Specimen label="Metric strip · large values">
          <MetricStrip
            items={[
              { label: 'Leads need attention', value: '8' },
              { label: 'Site visits today', value: '2' },
              { label: 'Overdue follow-ups', value: '3', tone: 'danger' },
            ]}
          />
        </Specimen>
        <Specimen label="Metric block · extra large, long value">
          <MetricBlock
            label="Estimated pipeline value"
            value="₹1,234.5Cr"
            size="xl"
            caption="Across 18 leads"
          />
        </Specimen>
        <Specimen label="Quick actions">
          <QuickActionStrip>
            <QuickAction icon={UserPlus} label="Add lead" onPress={noop} />
            <QuickAction icon={CalendarPlus} label="Schedule visit" onPress={noop} />
            <QuickAction icon={Building2} label="Check inventory" onPress={noop} />
            <QuickAction icon={FileText} label="Create cost sheet" onPress={noop} />
          </QuickActionStrip>
        </Specimen>
        <Specimen label="Pipeline summary">
          <PipelineSummary
            counts={{
              NEW: 2,
              CONTACTED: 2,
              QUALIFIED: 3,
              INTERESTED: 3,
              VISIT: 3,
              NEGOTIATION: 2,
              BOOKING: 1,
            }}
          />
        </Specimen>
        <Specimen label="Progress meter · performance summary">
          <ProgressMeter value={1} max={4} label="Monthly target" valueLabel="1 of 4" />
          <PerformanceSummary
            monthLabel="Sep"
            bookings={1}
            bookingValue={4_286_000}
            inBooking={1}
            target={4}
          />
        </Specimen>
        <Specimen label="Attention banners">
          <View style={{ gap: space[8] }}>
            <AttentionBanner
              tone="danger"
              title="Overdue · Call back on payment plan"
              message="Mohammed Faizan · Yesterday · 6:00 PM"
              actionLabel="Open"
              onAction={noop}
            />
            <AttentionBanner
              tone="warning"
              title="Hold ending today"
              message="Plot 19 · Aurelia Greens · 6:00 PM"
            />
            <AttentionBanner
              tone="info"
              title="Inventory updated"
              message="Cedar Enclave was refreshed."
            />
          </View>
        </Specimen>
      </ShowcaseSection>
    </>
  );
}
