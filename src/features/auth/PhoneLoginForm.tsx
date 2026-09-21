import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/buttons/Button';
import { PhoneField } from '@/components/forms/SpecialFields';
import { PROTOTYPE_CREDENTIALS } from '@/constants/prototype';
import { space } from '@/design-system';
import { indianMobileSchema, type LoginAs } from '@/services/auth';
import { haptics } from '@/services/haptics';
import { useAuthStore } from '@/store/authStore';

const formSchema = z.object({ phone: indianMobileSchema });
type FormValues = z.infer<typeof formSchema>;

const WRONG_ROLE_COPY: Record<LoginAs, string> = {
  associate: 'This number isn’t registered as an associate. Try Simple Login instead.',
  client: 'This number belongs to an associate account. Use Associate Login instead.',
};

/**
 * Phone step of the prototype login, shared by Associate Login and Simple (client) Login.
 * Validation is the shared Zod schema (10-digit Indian mobile), errors appear as text under the
 * field, and the submit button shows a loading state. Any valid number advances unless it belongs
 * to the other login; the demo number for this login is offered as a one-tap fill.
 */
export function PhoneLoginForm({ as, onSubmitted }: { as: LoginAs; onSubmitted: () => void }) {
  const requestOtp = useAuthStore((state) => state.requestOtp);
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { phone: '' } });

  const submit = handleSubmit(async ({ phone }) => {
    const result = await requestOtp(phone, as);
    if (result.ok) {
      onSubmitted();
    } else {
      haptics.error();
      setError('phone', {
        message:
          result.error === 'WRONG_ROLE'
            ? WRONG_ROLE_COPY[as]
            : 'Enter a valid 10-digit mobile number.',
      });
    }
  });

  const demoNumber =
    as === 'client' ? PROTOTYPE_CREDENTIALS.clientPhone : PROTOTYPE_CREDENTIALS.phone;

  return (
    <View style={{ gap: space[20] }}>
      <Controller
        control={control}
        name="phone"
        render={({ field: { value, onChange, onBlur } }) => (
          <PhoneField
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            onSubmitEditing={submit}
            returnKeyType="done"
            errorText={errors.phone?.message}
            helperText={errors.phone ? undefined : 'We’ll ask for a code on the next step.'}
            autoFocus
          />
        )}
      />
      <View style={{ gap: space[8] }}>
        <Button label="Continue" onPress={submit} loading={isSubmitting} fullWidth />
        <Button
          label={`Use demo number ${demoNumber}`}
          variant="tertiary"
          size="medium"
          fullWidth
          onPress={() => setValue('phone', demoNumber, { shouldValidate: true })}
        />
      </View>
    </View>
  );
}
