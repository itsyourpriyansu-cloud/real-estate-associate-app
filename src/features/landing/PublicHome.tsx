import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { RepositoryErrorState } from '@/components/feedback';
import {
  Button,
  HeroCard,
  HeroStat,
  LoginOptionCard,
  Reveal,
  Wordmark,
  icons,
  ScreenLayout,
  AppText,
} from '@/components';
import { PROTOTYPE_BADGE_LABEL } from '@/constants/prototype';
import { space } from '@/design-system';
import { PrototypeNotice } from '@/features/auth/AuthParts';
import { useAuthStore } from '@/store/authStore';
import { groupIndian } from '@/utils/format';

import { usePublicSummary } from './usePublicSummary';

type Entry = 'guest' | 'associate' | 'client';

const ENTRIES: {
  key: Entry;
  title: string;
  description: string;
  icon: (typeof icons)[keyof typeof icons];
}[] = [
  {
    key: 'guest',
    title: 'Guest',
    description: 'Browse our projects. No sign-in needed.',
    icon: icons.guest,
  },
  {
    key: 'associate',
    title: 'Associate',
    description: 'Your dashboard, team, bookings and site visits.',
    icon: icons.associate,
  },
  {
    key: 'client',
    title: 'Simple login',
    description: 'Sign in to view projects, plots and prices.',
    icon: icons.client,
  },
];

const CTA: Record<Entry, string> = {
  guest: 'Continue as guest',
  associate: 'Login',
  client: 'Login',
};

const count = (value: number | undefined) => (value === undefined ? '–' : String(value));

/** 1 · HOME — the public landing: the company's numbers, then how you want to continue. */
export function PublicHome() {
  const router = useRouter();
  const continueAsGuest = useAuthStore((state) => state.continueAsGuest);
  const summary = usePublicSummary();
  const [entry, setEntry] = useState<Entry>('associate');

  const proceed = () => {
    if (entry === 'guest') continueAsGuest();
    else router.push(entry === 'associate' ? '/associate-login' : '/simple-login');
  };

  return (
    <ScreenLayout
      gap={space[24]}
      stickyAction={<Button label={CTA[entry]} onPress={proceed} fullWidth />}
      edges={['top', 'bottom']}
    >
      <Reveal index={0}>
        <View style={{ paddingTop: space[8], gap: space[16] }}>
          <Wordmark />
          <View style={{ gap: space[4] }}>
            <AppText variant="displayMedium" header>
              Plots worth{'\n'}building on.
            </AppText>
            <AppText tone="secondary">
              Open plots across Hyderabad’s growth corridors, sold by Vara associates.
            </AppText>
          </View>
        </View>
      </Reveal>

      <Reveal index={1}>
        <HeroCard
          label="Total registered sq. yards"
          value={summary.data?.totalRegisteredSqYd ?? 0}
          format={(n) => groupIndian(Math.round(n))}
          caption="Registered across all Vara projects"
          footer={
            <>
              <HeroStat label="Completed" value={count(summary.data?.completedProjects)} />
              <HeroStat label="Ongoing" value={count(summary.data?.ongoingProjects)} />
              <HeroStat label="Plots available" value={count(summary.data?.availablePlots)} />
            </>
          }
        />
        {summary.status === 'error' ? (
          <View style={{ marginTop: space[12] }}>
            <RepositoryErrorState
              error={summary.error}
              subject="the project numbers"
              onRetry={summary.reload}
              compact
            />
          </View>
        ) : null}
      </Reveal>

      <Reveal index={2}>
        <View style={{ gap: space[12] }} accessibilityRole="radiogroup">
          <AppText variant="headingSM" header>
            How would you like to continue?
          </AppText>
          {ENTRIES.map((option) => (
            <LoginOptionCard
              key={option.key}
              icon={option.icon}
              title={option.title}
              description={option.description}
              selected={entry === option.key}
              onPress={() => setEntry(option.key)}
            />
          ))}
        </View>
      </Reveal>

      <Reveal index={3}>
        <PrototypeNotice>{PROTOTYPE_BADGE_LABEL} · not for production use</PrototypeNotice>
      </Reveal>
    </ScreenLayout>
  );
}
