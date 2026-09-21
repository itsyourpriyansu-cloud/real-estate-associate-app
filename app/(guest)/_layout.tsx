import { Stack } from 'expo-router';

import { colors } from '@/design-system';

/** Guest and client sessions: a single hub that leads to Our Projects. */
export default function GuestLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: colors.backgroundPrimary },
      }}
    />
  );
}
