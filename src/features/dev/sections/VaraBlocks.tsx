import { View } from 'react-native';

import {
  ActionTile,
  ActionTileRow,
  AnimatedNumber,
  AppHeader,
  AppText,
  AssociateDock,
  BrandMark,
  DockContext,
  HeroCard,
  HeroStat,
  LoginOptionCard,
  NavPanel,
  NavRow,
  ProgressBar,
  SaleRow,
  StatGrid,
  StatTile,
  SuccessMark,
  SummaryPanel,
  TeamMemberRow,
  VisitHistoryRow,
  Wordmark,
  icons,
  type IconName,
} from '@/components';
import { colors, radius, space } from '@/design-system';
import { DOCK_ITEMS } from '@/features/navigation/dock';
import { useTeam } from '@/features/team/useTeam';
import { useVisitHistory } from '@/features/visits/useVisits';
import { formatInr, groupIndian } from '@/utils/format';

import { ShowcaseSection, Specimen } from '../ShowcaseSection';

/** The Vara building blocks: brand, icons, hero card, summary tiles, navigation, dock, progress. */
export function VaraBlocks() {
  const team = useTeam();
  const visits = useVisitHistory();
  const member = team.data?.[0];
  const visit = visits.data?.visits[0];

  return (
    <>
      <ShowcaseSection
        title="Brand"
        note="A charcoal tile with a V whose right stroke is the brand green. Drawn as vector."
      >
        <Specimen label="Mark · sm / md / lg">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[16] }}>
            <BrandMark size="sm" />
            <BrandMark size="md" />
            <BrandMark size="lg" />
          </View>
        </Specimen>
        <Specimen label="Wordmark">
          <Wordmark />
        </Specimen>
        <Specimen label="Wordmark · on charcoal">
          <View
            style={{
              backgroundColor: colors.surfaceInverse,
              padding: space[16],
              borderRadius: radius.lg,
            }}
          >
            <Wordmark onInverse />
          </View>
        </Specimen>
      </ShowcaseSection>

      <ShowcaseSection
        title="Icons"
        note="One family (lucide, 1.75 stroke). Every meaning has exactly one glyph."
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[12] }}>
          {(Object.keys(icons) as IconName[]).map((name) => {
            const Glyph = icons[name];
            return (
              <View
                key={name}
                accessible
                accessibilityLabel={name}
                style={{ width: 68, alignItems: 'center', gap: space[4] }}
              >
                <Glyph size={22} color={colors.textPrimary} strokeWidth={1.75} />
                <AppText variant="caption" tone="secondary" numberOfLines={1}>
                  {name}
                </AppText>
              </View>
            );
          })}
        </View>
      </ShowcaseSection>

      <ShowcaseSection
        title="Hero card"
        note="The one number that matters. Counts up on arrival; the eye masks the figures."
      >
        <Specimen label="Hero card · footer stats">
          <HeroCard
            label="Total registered sq. yards"
            value={4748}
            format={(n) => groupIndian(Math.round(n))}
            caption="YHIPL2 · all Vara projects"
            onToggleHidden={() => undefined}
            footer={
              <>
                <HeroStat label="Team total sales" value="₹9.06Cr" />
                <HeroStat label="Team members" value="16" />
                <HeroStat label="My team" value="9" />
              </>
            }
          />
        </Specimen>
        <Specimen label="Animated number">
          <AnimatedNumber
            value={4400000}
            format={(n) => formatInr(Math.round(n))}
            variant="metricLG"
          />
        </Specimen>
      </ShowcaseSection>

      <ShowcaseSection
        title="Summary tiles"
        note="A figure that has not been recorded reads Pending, never 0."
      >
        <Specimen label="Summary panel · ready and pending">
          <SummaryPanel title="My performance">
            <StatGrid>
              <StatTile label="My sales" value="₹3.29Cr" caption="6 plots · 1,744 sq yd" />
              <StatTile label="YHIPL2 team site visits" pending />
            </StatGrid>
          </SummaryPanel>
        </Specimen>
      </ShowcaseSection>

      <ShowcaseSection title="Navigation" note="Rows, quick actions, the header and the dock.">
        <Specimen label="Nav panel · staggered rows">
          <NavPanel>
            <NavRow
              icon={icons.projects}
              title="Our Projects"
              subtitle="Project details, status, locations"
              onPress={() => undefined}
            />
            <NavRow
              icon={icons.myTeam}
              title="My Team"
              subtitle="Details of your team members"
              meta="9"
              onPress={() => undefined}
            />
          </NavPanel>
        </Specimen>
        <Specimen label="Action tiles">
          <ActionTileRow>
            <ActionTile icon={icons.booking} label="Live booking" onPress={() => undefined} />
            <ActionTile icon={icons.calculator} label="Calculator" onPress={() => undefined} />
            <ActionTile icon={icons.addMember} label="Add member" onPress={() => undefined} />
          </ActionTileRow>
        </Specimen>
        <Specimen label="Header">
          <AppHeader
            title="Dashboard"
            fullName="K. V. Raghunath Reddy"
            onMenu={() => undefined}
            onProfile={() => undefined}
          />
        </Specimen>
        <Specimen label="Floating dock · Projects selected">
          <View style={{ height: 96, justifyContent: 'flex-end' }}>
            <DockContext.Provider value={false}>
              <View style={{ alignItems: 'center' }}>
                <AssociateDock items={DOCK_ITEMS} activeKey="projects" onSelect={() => undefined} />
              </View>
            </DockContext.Provider>
          </View>
        </Specimen>
      </ShowcaseSection>

      <ShowcaseSection title="Choices" note="Radio cards for how to continue.">
        <Specimen label="Login option · selected and not">
          <View style={{ gap: space[12] }}>
            <LoginOptionCard
              icon={icons.guest}
              title="Guest"
              description="Browse our projects. No sign-in needed."
              selected={false}
              onPress={() => undefined}
            />
            <LoginOptionCard
              icon={icons.associate}
              title="Associate"
              description="Your dashboard, team, bookings and site visits."
              selected
              onPress={() => undefined}
            />
          </View>
        </Specimen>
      </ShowcaseSection>

      <ShowcaseSection
        title="Progress and success"
        note="Hatched green fill with a knob; a one-shot success mark."
      >
        <Specimen label="Progress bar">
          <ProgressBar
            value={0.62}
            label="Area target, 62%"
            startCaption="1,247 sq yd sold"
            endCaption="Target 2,000"
          />
        </Specimen>
        <Specimen label="Success mark">
          <SuccessMark />
        </Specimen>
      </ShowcaseSection>

      <ShowcaseSection
        title="Rows"
        note="Team, sales and site-visit rows, as they appear in lists."
      >
        {member ? (
          <Specimen label="Team member row">
            <NavPanel>
              <TeamMemberRow member={member} onPress={() => undefined} />
            </NavPanel>
          </Specimen>
        ) : null}
        <Specimen label="Sale row">
          <SummaryPanel>
            <SaleRow
              customer="Kavitha Menon"
              detail="Real Rise · K. V. Raghunath Reddy"
              dateText="3 Sep"
              amountText="₹44.1L"
              status="REGISTERED"
            />
          </SummaryPanel>
        </Specimen>
        {visit ? (
          <Specimen label="Visit history row">
            <NavPanel>
              <VisitHistoryRow
                visit={visit}
                customer="Deepika Rao"
                project="Real Rise"
                dayNumber="22"
                monthShort="Sep"
                timeText="11:00 AM"
                onPress={() => undefined}
              />
            </NavPanel>
          </Specimen>
        ) : null}
      </ShowcaseSection>
    </>
  );
}
