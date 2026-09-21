import { Stack } from 'expo-router';

import { colors } from '@/design-system';

/** Associate session: the dashboard and its seven sections, plus profile and settings. */
export default function AssociateLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.backgroundPrimary },
      }}
    />
  );
}
