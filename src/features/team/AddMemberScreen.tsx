import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import {
  AppText,
  Button,
  DetailHeader,
  EmptyState,
  InlineError,
  LoadingState,
  PhoneField,
  Reveal,
  ScreenLayout,
  SelectField,
  SummaryPanel,
  TextField,
  icons,
  useToast,
  type SelectOption,
} from '@/components';
import { DEFAULT_COUNTRY_CODE, SENIOR_ASSOCIATE_DESIGNATION } from '@/constants/prototype';
import { space } from '@/design-system';
import { isRepositoryError, teamRepository } from '@/repositories';
import { indianMobileSchema } from '@/services/auth';
import { haptics } from '@/services/haptics';

import { useCurrentAssociate, useTeam } from './useTeam';

const ME = 'me';

const formSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter the member’s full name'),
  phone: indianMobileSchema,
  email: z.union([z.literal(''), z.email('Enter a valid email address')]),
  sponsor: z.string().min(1),
});
type FormValues = z.infer<typeof formSchema>;

/**
 * 6 · ADD TEAM MEMBER — name, mobile, optional email, and who they join under (you by default, or
 * anyone in your team). Errors from the repository land on the field they belong to.
 */
export function AddMemberScreen() {
  const router = useRouter();
  const toast = useToast();
  const team = useTeam();
  const currentAssociate = useCurrentAssociate();
  const [formError, setFormError] = useState<string | undefined>();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { fullName: '', phone: '', email: '', sponsor: ME },
  });

  const sponsorOptions = useMemo<SelectOption<string>[]>(
    () => [
      { value: ME, label: 'Directly under me' },
      // A new member always joins as a Junior Associate, who may only report to a Senior
      // Associate or Marketing Head — a Junior downline member is not a valid choice.
      ...(team.data ?? [])
        .filter((m) => m.orgLevel === 'SENIOR_ASSOCIATE' || m.orgLevel === 'MARKETING_HEAD')
        .map((m) => ({
          value: m.id,
          label: m.fullName,
          description: `Level ${m.level} · ${m.associateCode}`,
        })),
    ],
    [team.data],
  );

  const submit = handleSubmit(async (values) => {
    setFormError(undefined);
    try {
      const member = await teamRepository.addMember({
        fullName: values.fullName,
        phone: `${DEFAULT_COUNTRY_CODE}${values.phone}`,
        ...(values.email ? { email: values.email } : null),
        ...(values.sponsor !== ME ? { reportingManagerId: values.sponsor } : null),
      });
      haptics.success();
      toast.show({ tone: 'success', message: `${member.fullName} joined your team.` });
      router.replace('/team');
    } catch (error) {
      haptics.error();
      const detail = isRepositoryError(error) ? error.message.toLowerCase() : '';
      if (detail.includes('phone')) {
        setError('phone', { message: 'A member with this mobile number already exists.' });
      } else if (detail.includes('manager')) {
        setError('sponsor', { message: 'Choose yourself or someone in your team.' });
      } else {
        setFormError('Couldn’t add this member. Check the details and try again.');
      }
    }
  });

  if (currentAssociate.status === 'loading') {
    return (
      <ScreenLayout
        edges={['top', 'bottom']}
        header={<DetailHeader title="Add team member" onBack={() => router.back()} />}
      >
        <LoadingState variant="cards" count={1} />
      </ScreenLayout>
    );
  }

  if (currentAssociate.data?.designation !== SENIOR_ASSOCIATE_DESIGNATION) {
    return (
      <ScreenLayout
        edges={['top', 'bottom']}
        header={<DetailHeader title="Add team member" onBack={() => router.back()} />}
      >
        <EmptyState
          icon={icons.addMember}
          title="Senior Associates only"
          description="Adding team members is limited to Senior Associates. Ask your admin if you think this is a mistake."
          actionLabel="Back to dashboard"
          onAction={() => router.replace('/dashboard')}
        />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      edges={['top', 'bottom']}
      header={<DetailHeader title="Add team member" onBack={() => router.back()} />}
      stickyAction={
        <Button
          label="Add member"
          icon={icons.addMember}
          onPress={submit}
          loading={isSubmitting}
          fullWidth
        />
      }
    >
      <Reveal index={0}>
        <View style={{ gap: space[4] }}>
          <AppText variant="headingLG" header>
            Who is joining?
          </AppText>
          <AppText tone="secondary">
            They get an associate code and appear in My Team straight away.
          </AppText>
        </View>
      </Reveal>

      <Reveal index={1}>
        <SummaryPanel>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                label="Full name"
                placeholder="e.g. Asha Menon"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="words"
                autoComplete="name"
                returnKeyType="next"
                errorText={errors.fullName?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field: { value, onChange, onBlur } }) => (
              <PhoneField
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorText={errors.phone?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                label="Email (optional)"
                placeholder="name@example.com"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                errorText={errors.email?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="sponsor"
            render={({ field: { value, onChange } }) => (
              <SelectField
                label="Joins under"
                options={sponsorOptions}
                value={value}
                onChange={onChange}
                sheetTitle="Who are they joining under?"
                errorText={errors.sponsor?.message}
              />
            )}
          />
          {formError ? <InlineError message={formError} /> : null}
        </SummaryPanel>
      </Reveal>
    </ScreenLayout>
  );
}
