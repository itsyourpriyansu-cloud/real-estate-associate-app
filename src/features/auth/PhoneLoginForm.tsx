import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/buttons/Button';
import { PhoneField } from '@/components/forms/SpecialFields';
import { PROTOTYPE_CREDENTIALS } from '@/constants/prototype';
import { space } from '@/design-system';
import { indianMobileSchema } from '@/services/auth';
import { haptics } from '@/services/haptics';
import { useAuthStore } from '@/store/authStore';

const formSchema = z.object({ phone: indianMobileSchema });
type FormValues = z.infer<typeof formSchema>;

/**
 * Phone step of the prototype login. Validation is the shared Zod schema (10-digit Indian
 * mobile), errors appear as text under the field, and the submit button shows a loading state.
 * Any valid number is accepted; the demo number is offered as a one-tap fill.
 */
export function PhoneLoginForm({ onSubmitted }: { onSubmitted: () => void }) {
  const requestOtp = useAuthStore((state) => state.requestOtp);
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { phone: '' } });

  const submit = handleSubmit(async ({ phone }) => {
    const result = await requestOtp(phone);
    if (result.ok) {
      onSubmitted();
    } else {
      haptics.error();
      setError('phone', { message: 'Enter a valid 10-digit mobile number.' });
    }
  });

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
          label={`Use demo number ${PROTOTYPE_CREDENTIALS.phone}`}
          variant="tertiary"
          size="medium"
          fullWidth
          onPress={() => setValue('phone', PROTOTYPE_CREDENTIALS.phone, { shouldValidate: true })}
        />
      </View>
    </View>
  );
}
