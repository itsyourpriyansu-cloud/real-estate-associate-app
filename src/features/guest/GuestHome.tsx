import { useRouter } from 'expo-router';
import { View } from 'react-native';

import {
  AppText,
  Button,
  NavPanel,
  NavRow,
  Reveal,
  ScreenLayout,
  Wordmark,
  icons,
} from '@/components';
import { space } from '@/design-system';
import { useAuthStore } from '@/store/authStore';

/** 4 · GUEST — a guest sees one thing: Our Projects. */
export function GuestHome() {
  const router = useRouter();
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <ScreenLayout gap={space[24]} edges={['top', 'bottom']}>
      <Reveal index={0}>
        <View style={{ paddingTop: space[8], gap: space[24] }}>
          <Wordmark />
          <View style={{ gap: space[4] }}>
            <AppText variant="displayMedium" header>
              Welcome.
            </AppText>
            <AppText tone="secondary">
              Explore every Vara project: where it is, how far along it is, and which plots are
              open.
            </AppText>
          </View>
        </View>
      </Reveal>

      <NavPanel>
        <NavRow
          icon={icons.projects}
          title="Our Projects"
          subtitle="Project details, status, locations"
          onPress={() => router.push('/projects')}
        />
      </NavPanel>

      <Reveal index={2}>
        <Button label="Back to Home" variant="secondary" onPress={signOut} fullWidth />
      </Reveal>
    </ScreenLayout>
  );
}
