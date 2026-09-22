import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { DetailHeader } from '@/components/navigation';
import { ScreenLayout } from '@/components/patterns';
import { AppText } from '@/components/primitives/AppText';
import { PROTOTYPE_BADGE_LABEL } from '@/constants/prototype';
import { space } from '@/design-system';

import { Wordmark } from '@/components/primitives/BrandMark';
import { PrototypeNotice } from './AuthParts';
import { PhoneLoginForm } from './PhoneLoginForm';

/** Associate login: phone step; OTP is the next route. */
export function LoginScreen() {
  const router = useRouter();
  return (
    <ScreenLayout header={<DetailHeader onBack={() => router.back()} />} gap={space[32]}>
      <Wordmark />
      <View style={{ gap: space[12] }}>
        <AppText variant="displayMedium" header>
          Associate login
        </AppText>
        <AppText tone="secondary">
          Sign in to see your dashboard, team, site visits and bookings.
        </AppText>
      </View>
      <PhoneLoginForm onSubmitted={() => router.push('/otp')} />
      <PrototypeNotice>{PROTOTYPE_BADGE_LABEL} · not for production use</PrototypeNotice>
    </ScreenLayout>
  );
}
