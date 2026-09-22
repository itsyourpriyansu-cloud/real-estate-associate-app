import { Stack } from 'expo-router';

import { colors } from '@/design-system';

/** Admin session: the admin dashboard and the Senior Associates screens. */
export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.backgroundPrimary },
      }}
    />
  );
}
