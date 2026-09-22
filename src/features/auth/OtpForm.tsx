import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/buttons/Button';
import { useToast } from '@/components/feedback';
import { OTPField } from '@/components/forms/SpecialFields';
import { AppText } from '@/components/primitives/AppText';
import { PROTOTYPE_CREDENTIALS } from '@/constants/prototype';
import { space } from '@/design-system';
import type { AuthResult } from '@/services/auth';
import { haptics } from '@/services/haptics';

const RESEND_SECONDS = 30;

const mmss = (seconds: number) => `0:${String(seconds).padStart(2, '0')}`;

/**
 * OTP step of the prototype login, shared by Associate and Admin login. Six cells, a haptic when
 * the code is accepted, a text error when it is not. The resend timer is visual only — no code is
 * sent and the copy never says otherwise. `onVerify` is which login this step completes.
 */
export function OtpForm({ onVerify }: { onVerify: (code: string) => Promise<AuthResult> }) {
  const toast = useToast();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [verifying, setVerifying] = useState(false);
  const [remaining, setRemaining] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setTimeout(() => setRemaining((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  const submit = async (value: string) => {
    setVerifying(true);
    setError(undefined);
    const result = await onVerify(value);
    setVerifying(false);
    if (result.ok) {
      haptics.success();
      // The session is set; the root layout's guards move the user to their landing screen.
    } else {
      haptics.error();
      setError('That code doesn’t match. Check it and try again.');
      setCode('');
    }
  };

  return (
    <View style={{ gap: space[20] }}>
      <OTPField
        value={code}
        onChange={(next) => {
          setCode(next);
          if (error) setError(undefined);
        }}
        onComplete={submit}
        errorText={error}
        disabled={verifying}
        autoFocus
      />
      <Button
        label="Verify"
        onPress={() => submit(code)}
        loading={verifying}
        disabled={code.length < 6}
        fullWidth
      />
      <View style={{ alignItems: 'center', gap: space[4] }}>
        {remaining > 0 ? (
          <AppText tone="secondary" accessibilityLiveRegion="polite">
            {`Resend code in ${mmss(remaining)}`}
          </AppText>
        ) : (
          <Button
            label="Resend code"
            variant="tertiary"
            size="medium"
            onPress={() => {
              setRemaining(RESEND_SECONDS);
              toast.show({ tone: 'info', message: 'Prototype mode: no code is sent.' });
            }}
          />
        )}
        <AppText variant="bodySM" tone="secondary">
          {`Prototype code: ${PROTOTYPE_CREDENTIALS.otp}`}
        </AppText>
      </View>
    </View>
  );
}
