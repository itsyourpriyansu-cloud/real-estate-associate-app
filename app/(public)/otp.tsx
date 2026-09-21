import { Redirect, useRouter } from 'expo-router';
import { View } from 'react-native';

import { DetailHeader } from '@/components/navigation';
import { ScreenLayout } from '@/components/patterns';
import { AppText } from '@/components/primitives/AppText';
import { space } from '@/design-system';
import { OtpForm } from '@/features/auth/OtpForm';
import { selectSessionKind, useAuthStore } from '@/store/authStore';

/** "+919876543210" → "+91 98765 43210" */
const display = (phone: string) => phone.replace(/^(\+91)(\d{5})(\d{5})$/, '$1 $2 $3');

export default function OtpScreen() {
  const router = useRouter();
  const pendingPhone = useAuthStore((state) => state.pendingPhone);
  const signedOut = useAuthStore(selectSessionKind) === 'none';

  // Opened directly (deep link / refresh) with no number entered: go back to the start.
  // Once the code is accepted the pending phone clears in the same update that sets the session,
  // so only redirect while still signed out.
  if (!pendingPhone && signedOut) return <Redirect href="/home" />;

  return (
    <ScreenLayout header={<DetailHeader onBack={() => router.back()} />} gap={space[32]}>
      <View style={{ gap: space[12] }}>
        <AppText variant="displayMedium" header>
          Enter your code
        </AppText>
        <AppText tone="secondary">
          {pendingPhone ? `Six digits for ${display(pendingPhone)}.` : 'Six digits.'}
        </AppText>
      </View>
      <OtpForm />
    </ScreenLayout>
  );
}
