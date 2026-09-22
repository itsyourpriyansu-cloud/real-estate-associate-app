import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { DetailHeader } from '@/components/navigation';
import { ScreenLayout } from '@/components/patterns';
import { AppText } from '@/components/primitives/AppText';
import { PROTOTYPE_ADMIN_PHONE, PROTOTYPE_BADGE_LABEL } from '@/constants/prototype';
import { space } from '@/design-system';
import { useAuthStore } from '@/store/authStore';

import { Wordmark } from '@/components/primitives/BrandMark';
import { PrototypeNotice } from './AuthParts';
import { PhoneLoginForm } from './PhoneLoginForm';

/** Admin login: a hidden route, never linked from the public Home. Phone step; OTP is next. */
export function AdminLoginScreen() {
  const router = useRouter();
  const requestAdminOtp = useAuthStore((state) => state.requestAdminOtp);
  return (
    <ScreenLayout header={<DetailHeader onBack={() => router.back()} />} gap={space[32]}>
      <Wordmark />
      <View style={{ gap: space[12] }}>
        <AppText variant="displayMedium" header>
          Admin access
        </AppText>
        <AppText tone="secondary">Internal use only — set commissions and manage associates.</AppText>
      </View>
      <PhoneLoginForm
        onSubmitRequest={requestAdminOtp}
        demoNumber={PROTOTYPE_ADMIN_PHONE}
        onSubmitted={() => router.push('/admin-otp')}
      />
      <PrototypeNotice>{PROTOTYPE_BADGE_LABEL} · not for production use</PrototypeNotice>
    </ScreenLayout>
  );
}
