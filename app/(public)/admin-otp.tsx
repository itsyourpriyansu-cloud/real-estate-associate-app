import { Redirect, useRouter } from 'expo-router';
import { View } from 'react-native';

import { DetailHeader } from '@/components/navigation';
import { ScreenLayout } from '@/components/patterns';
import { AppText } from '@/components/primitives/AppText';
import { space } from '@/design-system';
import { OtpForm } from '@/features/auth/OtpForm';
import { selectSessionKind, useAuthStore } from '@/store/authStore';

/** "+919000000001" → "+91 90000 00001" */
const display = (phone: string) => phone.replace(/^(\+91)(\d{5})(\d{5})$/, '$1 $2 $3');

export default function AdminOtpScreen() {
  const router = useRouter();
  const pendingAdminPhone = useAuthStore((state) => state.pendingAdminPhone);
  const verifyAdminOtp = useAuthStore((state) => state.verifyAdminOtp);
  const signedOut = useAuthStore(selectSessionKind) === 'none';

  // Opened directly (deep link / refresh) with no number entered: go back to the start.
  if (!pendingAdminPhone && signedOut) return <Redirect href="/admin-login" />;

  return (
    <ScreenLayout header={<DetailHeader onBack={() => router.back()} />} gap={space[32]}>
      <View style={{ gap: space[12] }}>
        <AppText variant="displayMedium" header>
          Enter your code
        </AppText>
        <AppText tone="secondary">
          {pendingAdminPhone ? `Six digits for ${display(pendingAdminPhone)}.` : 'Six digits.'}
        </AppText>
      </View>
      <OtpForm onVerify={verifyAdminOtp} />
    </ScreenLayout>
  );
}
