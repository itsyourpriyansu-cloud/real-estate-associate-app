import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import {
  ActionSheet,
  AppHeader,
  AppText,
  HeroCard,
  HeroStat,
  LoadingState,
  NavPanel,
  NavRow,
  ResourceBoundary,
  Reveal,
  ScreenLayout,
  StatGrid,
  StatTile,
  SummaryPanel,
  icons,
} from '@/components';
import { space } from '@/design-system';
import { useNow } from '@/hooks/useNow';
import { useAuthStore } from '@/store/authStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { firstName, formatInr, greetingFor, groupIndian } from '@/utils/format';

import { useDashboard } from './useDashboard';

/** 3 · ASSOCIATE DASHBOARD — the numbers that matter, then the seven places an associate goes. */
export function DashboardScreen() {
  const router = useRouter();
  const now = useNow();
  const resource = useDashboard();
  const signOut = useAuthStore((state) => state.signOut);
  const hidden = usePreferencesStore((state) => state.hideFigures);
  const setHidden = usePreferencesStore((state) => state.setHideFigures);
  const [menuOpen, setMenuOpen] = useState(false);

  const user = resource.data?.user;

  return (
    <ScreenLayout
      onRefresh={resource.reload}
      refreshing={false}
      header={
        <AppHeader
          title="Dashboard"
          fullName={user?.fullName ?? 'Associate'}
          onMenu={() => setMenuOpen(true)}
          onProfile={() => router.push('/profile')}
        />
      }
    >
      <ResourceBoundary
        resource={resource}
        subject="your dashboard"
        loading={<LoadingState variant="cards" count={2} />}
      >
        {({ summary }) => {
          const teamSales = summary.teamTotalSales;
          return (
            <>
              <Reveal index={0}>
                <View style={{ gap: space[4] }}>
                  <AppText variant="labelSM" tone="secondary" uppercase>
                    {greetingFor(now)}
                  </AppText>
                  <AppText variant="headingXL" header>
                    {user ? firstName(user.fullName) : 'Welcome'}
                  </AppText>
                  {user ? (
                    <AppText tone="secondary">
                      {user.designation} · {user.associateCode}
                    </AppText>
                  ) : null}
                </View>
              </Reveal>

              <Reveal index={1}>
                <HeroCard
                  label="Total registered sq. yards"
                  value={summary.totalRegisteredSqYd}
                  format={(n) => groupIndian(Math.round(n))}
                  caption={`${summary.teamName} · all Vara projects`}
                  hidden={hidden}
                  onToggleHidden={() => setHidden(!hidden)}
                  footer={
                    <>
                      <HeroStat
                        label="Team total sales"
                        value={formatInr(teamSales.amount)}
                        masked={hidden}
                      />
                      <HeroStat label="Team members" value={String(summary.teamMembers)} />
                      <HeroStat label="My team" value={String(summary.myTeam)} />
                    </>
                  }
                />
              </Reveal>

              <Reveal index={2}>
                <SummaryPanel title="My performance">
                  <StatGrid>
                    <StatTile
                      label="My sales"
                      pending={summary.mySales.state === 'PENDING'}
                      value={
                        summary.mySales.state === 'READY'
                          ? formatInr(summary.mySales.value.amount)
                          : undefined
                      }
                      masked={hidden ? '••••' : undefined}
                      caption={
                        summary.mySales.state === 'READY'
                          ? `${summary.mySales.value.count} plots · ${groupIndian(Math.round(summary.mySales.value.areaSqYd))} sq yd`
                          : undefined
                      }
                    />
                    <StatTile
                      label={`${summary.teamName} team site visits`}
                      pending={summary.teamSiteVisits.state === 'PENDING'}
                      value={
                        summary.teamSiteVisits.state === 'READY'
                          ? summary.teamSiteVisits.value
                          : undefined
                      }
                      caption={
                        summary.teamSiteVisits.state === 'READY' ? 'Recorded visits' : undefined
                      }
                    />
                  </StatGrid>
                </SummaryPanel>
              </Reveal>

              <View style={{ gap: space[12] }}>
                <Reveal index={3}>
                  <AppText variant="headingSM" header>
                    Explore
                  </AppText>
                </Reveal>
                <NavPanel>
                  <NavRow
                    icon={icons.projects}
                    title="Our Projects"
                    subtitle="Project details, status, locations"
                    onPress={() => router.push('/projects')}
                  />
                  <NavRow
                    icon={icons.booking}
                    title="Live Booking"
                    subtitle="Book plots live"
                    onPress={() => router.push('/live-booking')}
                  />
                  <NavRow
                    icon={icons.calculator}
                    title="Price Calculator"
                    subtitle="Calculate plot cost"
                    onPress={() => router.push('/price-calculator')}
                  />
                  <NavRow
                    icon={icons.siteVisits}
                    title="Site Visits History"
                    subtitle="Visit logs, details, statuses"
                    onPress={() => router.push('/site-visits')}
                  />
                  <NavRow
                    icon={icons.teamSales}
                    title="Team Sales"
                    subtitle="Team performance, targets"
                    onPress={() => router.push('/team-sales')}
                  />
                  <NavRow
                    icon={icons.addMember}
                    title="Add Team Member"
                    subtitle="Add new team member details"
                    onPress={() => router.push('/team/add')}
                  />
                  <NavRow
                    icon={icons.myTeam}
                    title="My Team"
                    subtitle="Details of your team members"
                    meta={String(summary.myTeam)}
                    onPress={() => router.push('/team')}
                  />
                </NavPanel>
              </View>
            </>
          );
        }}
      </ResourceBoundary>

      <ActionSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Menu"
        actions={[
          {
            key: 'profile',
            label: 'Profile',
            icon: icons.profile,
            onPress: () => router.push('/profile'),
          },
          {
            key: 'settings',
            label: 'Settings',
            icon: icons.settings,
            onPress: () => router.push('/settings'),
          },
          {
            key: 'prototype',
            label: 'Prototype controls',
            icon: icons.filter,
            onPress: () => router.push('/prototype-controls'),
          },
          {
            key: 'signout',
            label: 'Sign out',
            icon: icons.signOut,
            destructive: true,
            onPress: signOut,
          },
        ]}
      />
    </ScreenLayout>
  );
}
