import { useRouter } from 'expo-router';

import {
  IconButton,
  LargeTitleHeader,
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
import { PROTOTYPE_BADGE_LABEL, SENIOR_ASSOCIATE_DESIGNATION } from '@/constants/prototype';
import { PrototypeNotice } from '@/features/auth/AuthParts';
import { useAuthStore } from '@/store/authStore';

import { useAdminDashboard } from './useAdminDashboard';

/** Admin dashboard: how many associates exist, how many are senior, and one way in to manage them. */
export function AdminDashboardScreen() {
  const router = useRouter();
  const resource = useAdminDashboard();
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <ScreenLayout
      onRefresh={resource.reload}
      refreshing={false}
      header={
        <LargeTitleHeader
          title="Admin"
          subtitle={resource.data?.admin.fullName}
          right={
            <IconButton
              icon={icons.signOut}
              variant="outline"
              accessibilityLabel="Sign out"
              onPress={signOut}
            />
          }
        />
      }
    >
      <ResourceBoundary
        resource={resource}
        subject="the admin dashboard"
        loading={<LoadingState variant="cards" count={2} />}
      >
        {({ associates }) => {
          const seniors = associates.filter(
            (a) => a.designation === SENIOR_ASSOCIATE_DESIGNATION,
          );
          return (
            <>
              <Reveal index={0}>
                <SummaryPanel title="Associates">
                  <StatGrid>
                    <StatTile label="Total associates" value={associates.length} />
                    <StatTile label="Senior associates" value={seniors.length} />
                  </StatGrid>
                </SummaryPanel>
              </Reveal>

              <Reveal index={1}>
                <NavPanel>
                  <NavRow
                    icon={icons.admin}
                    title="Senior Associates"
                    subtitle="Promote associates, assign commission and reward targets"
                    meta={String(seniors.length)}
                    onPress={() => router.push('/associates')}
                  />
                </NavPanel>
              </Reveal>

              <Reveal index={2}>
                <PrototypeNotice>{PROTOTYPE_BADGE_LABEL} · not for production use</PrototypeNotice>
              </Reveal>
            </>
          );
        }}
      </ResourceBoundary>
    </ScreenLayout>
  );
}
