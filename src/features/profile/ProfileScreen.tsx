import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { View } from 'react-native';

import {
  AppText,
  Avatar,
  Button,
  Divider,
  LargeTitleHeader,
  ListRow,
  LoadingState,
  ResourceBoundary,
  Reveal,
  ScreenLayout,
  SummaryPanel,
  NavPanel,
  NavRow,
  icons,
} from '@/components';
import { space } from '@/design-system';
import { useAuthStore } from '@/store/authStore';

import { useCurrentUser } from './useCurrentUser';

/** Profile: who is signed in, their team and codes, and the way out. */
export function ProfileScreen() {
  const router = useRouter();
  const user = useCurrentUser();
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <ScreenLayout
      onRefresh={user.reload}
      refreshing={false}
      header={<LargeTitleHeader title="Profile" />}
    >
      <ResourceBoundary
        resource={user}
        subject="your profile"
        loading={<LoadingState variant="cards" count={1} />}
      >
        {(me) =>
          me ? (
            <>
              <Reveal index={0}>
                <SummaryPanel>
                  <View style={{ alignItems: 'center', gap: space[12] }}>
                    <Avatar name={me.fullName} size="lg" verified />
                    <View style={{ alignItems: 'center', gap: space[2] }}>
                      <AppText variant="headingLG" header style={{ textAlign: 'center' }}>
                        {me.fullName}
                      </AppText>
                      <AppText tone="secondary">
                        {me.designation} · {me.associateCode}
                      </AppText>
                    </View>
                  </View>
                </SummaryPanel>
              </Reveal>

              <Reveal index={1}>
                <SummaryPanel title="Details">
                  <View>
                    <ListRow
                      title="Phone"
                      subtitle={me.phone.replace(/^(\+91)(\d{5})(\d{5})$/, '$1 $2 $3')}
                    />
                    <Divider />
                    {me.email ? (
                      <>
                        <ListRow title="Email" subtitle={me.email} />
                        <Divider />
                      </>
                    ) : null}
                    <ListRow title="Team" subtitle={me.teamName ?? '–'} />
                    <Divider />
                    <ListRow
                      title="Joined"
                      subtitle={format(new Date(me.joinedAt), 'd MMMM yyyy')}
                    />
                    {me.reraRegistration ? (
                      <>
                        <Divider />
                        <ListRow
                          title="Registration"
                          subtitle={`${me.reraRegistration} (demo label)`}
                        />
                      </>
                    ) : null}
                  </View>
                </SummaryPanel>
              </Reveal>

              <NavPanel>
                <NavRow
                  icon={icons.settings}
                  title="Settings"
                  subtitle="Notifications, haptics, motion, demo data"
                  onPress={() => router.push('/settings')}
                />
              </NavPanel>

              <Reveal index={4}>
                <Button
                  label="Sign out"
                  variant="secondary"
                  icon={icons.signOut}
                  onPress={signOut}
                  fullWidth
                />
              </Reveal>
            </>
          ) : null
        }
      </ResourceBoundary>
    </ScreenLayout>
  );
}
