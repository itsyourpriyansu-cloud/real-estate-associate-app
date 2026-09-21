import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { DetailHeader } from '@/components/navigation';
import { ScreenLayout } from '@/components/patterns';
import { AppText } from '@/components/primitives/AppText';
import { PROTOTYPE_BADGE_LABEL } from '@/constants/prototype';
import { space } from '@/design-system';
import type { LoginAs } from '@/services/auth';

import { Wordmark } from '@/components/primitives/BrandMark';
import { PrototypeNotice } from './AuthParts';
import { PhoneLoginForm } from './PhoneLoginForm';

const COPY: Record<LoginAs, { title: string; body: string }> = {
  associate: {
    title: 'Associate login',
    body: 'Sign in to see your dashboard, team, site visits and bookings.',
  },
  client: {
    title: 'Simple login',
    body: 'Sign in to browse our projects, plots and prices.',
  },
};

/** Phone step shared by Associate Login and Simple (client) Login; OTP is the next route. */
export function LoginScreen({ as }: { as: LoginAs }) {
  const router = useRouter();
  const copy = COPY[as];
  return (
    <ScreenLayout header={<DetailHeader onBack={() => router.back()} />} gap={space[32]}>
      <Wordmark />
      <View style={{ gap: space[12] }}>
        <AppText variant="displayMedium" header>
          {copy.title}
        </AppText>
        <AppText tone="secondary">{copy.body}</AppText>
      </View>
      <PhoneLoginForm as={as} onSubmitted={() => router.push('/otp')} />
      <PrototypeNotice>{PROTOTYPE_BADGE_LABEL} · not for production use</PrototypeNotice>
    </ScreenLayout>
  );
}
