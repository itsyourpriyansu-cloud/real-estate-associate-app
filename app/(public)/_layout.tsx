import { Stack } from 'expo-router';

import { colors } from '@/design-system';

export default function AuthLayout() {
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
