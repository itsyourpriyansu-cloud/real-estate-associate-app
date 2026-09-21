import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import {
  AppText,
  Button,
  ConfirmationSheet,
  DetailHeader,
  EmptyState,
  InlineError,
  LoadingState,
  PhoneField,
  PlotStatusBadge,
  PriceSummary,
  ResourceBoundary,
  Reveal,
  ScreenLayout,
  StatusChip,
  SuccessMark,
  SummaryPanel,
  TextField,
  icons,
} from '@/components';
import { DEFAULT_COUNTRY_CODE } from '@/constants/prototype';
import type { Sale } from '@/domain';
import { space } from '@/design-system';
import { isRepositoryError, salesRepository } from '@/repositories';
import { indianMobileSchema } from '@/services/auth';
import { haptics } from '@/services/haptics';
import { formatInr } from '@/utils/format';

import { usePlot } from '../projects/useProjects';

const formSchema = z.object({
  customerName: z.string().trim().min(2, 'Enter the customer’s name'),
  phone: z.union([z.literal(''), indianMobileSchema]),
});
type FormValues = z.infer<typeof formSchema>;

/**
 * Live Booking, step 2 — customer details, a cost preview and an explicit confirmation. The
 * booking is a PROTOTYPE record (no payment, no real lock) and the screen says so. On success the
 * plot, the project counts and the sales totals all update through the repository.
 */
export function BookingConfirmScreen({ plotId }: { plotId: string }) {
  const router = useRouter();
  const resource = usePlot(plotId);
  const [pending, setPending] = useState<FormValues | null>(null);
  const [booking, setBooking] = useState(false);
  const [sale, setSale] = useState<Sale | null>(null);
  const [error, setError] = useState<string | undefined>();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { customerName: '', phone: '' },
  });

  const confirm = async () => {
    if (!pending) return;
    setBooking(true);
    setError(undefined);
    try {
      const created = await salesRepository.createBooking({
        plotId,
        customerName: pending.customerName,
        ...(pending.phone ? { customerPhone: `${DEFAULT_COUNTRY_CODE}${pending.phone}` } : null),
      });
      haptics.success();
      setSale(created);
    } catch (failure) {
      haptics.error();
      setError(
        isRepositoryError(failure) && failure.code === 'INVALID_INPUT'
          ? 'This plot is no longer available to book. Pick another plot.'
          : 'Couldn’t book this plot. Please try again.',
      );
    } finally {
      setBooking(false);
      setPending(null);
    }
  };

  if (sale) {
    return (
      <ScreenLayout edges={['top', 'bottom']} scroll={false}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[24] }}>
          <SuccessMark />
          <Reveal index={1}>
            <View style={{ alignItems: 'center', gap: space[8] }}>
              <AppText variant="headingXL" header style={{ textAlign: 'center' }}>
                Plot booked
              </AppText>
              <AppText tone="secondary" style={{ textAlign: 'center' }}>
                {sale.customerName} · {formatInr(sale.amount)}
              </AppText>
              <StatusChip label="Prototype booking · no payment taken" size="sm" />
            </View>
          </Reveal>
          <Reveal index={2} style={{ alignSelf: 'stretch', gap: space[12] }}>
            <Button
              label="View team sales"
              onPress={() => router.replace('/team-sales')}
              fullWidth
            />
            <Button
              label="Book another plot"
              variant="secondary"
              onPress={() => router.replace('/live-booking')}
              fullWidth
            />
            <Button
              label="Back to dashboard"
              variant="tertiary"
              onPress={() => router.replace('/dashboard')}
              fullWidth
            />
          </Reveal>
        </View>
      </ScreenLayout>
    );
  }

  const plot = resource.data?.plot;
  const bookable = !!plot && (plot.status === 'AVAILABLE' || plot.status === 'ON_HOLD');

  return (
    <ScreenLayout
      edges={['top', 'bottom']}
      header={
        <DetailHeader
          title="Confirm booking"
          subtitle={
            plot ? `Plot ${plot.plotNumber} · ${resource.data?.project?.name ?? ''}` : undefined
          }
          onBack={() => router.back()}
        />
      }
      stickyAction={
        bookable ? (
          <Button
            label="Review and confirm"
            icon={icons.booking}
            onPress={handleSubmit((values) => setPending(values))}
            fullWidth
          />
        ) : undefined
      }
    >
      <ResourceBoundary
        resource={resource}
        subject="this plot"
        loading={<LoadingState variant="cards" count={2} />}
        isEmpty={(data) => data.plot === null || !bookable}
        empty={
          <EmptyState
            icon={icons.plot}
            title="This plot can’t be booked"
            description="It has been booked, blocked or removed. Choose another plot."
            actionLabel="Choose a plot"
            onAction={() => router.replace('/live-booking')}
          />
        }
      >
        {({ plot: p }) =>
          p ? (
            <>
              <Reveal index={0}>
                <SummaryPanel
                  title={`Plot ${p.plotNumber}`}
                  right={<PlotStatusBadge status={p.status} />}
                >
                  <PriceSummary plot={p} />
                </SummaryPanel>
              </Reveal>

              <Reveal index={1}>
                <SummaryPanel title="Customer">
                  <Controller
                    control={control}
                    name="customerName"
                    render={({ field: { value, onChange, onBlur } }) => (
                      <TextField
                        label="Customer name"
                        placeholder="e.g. Meera Kapoor"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="words"
                        autoComplete="name"
                        errorText={errors.customerName?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="phone"
                    render={({ field: { value, onChange, onBlur } }) => (
                      <PhoneField
                        label="Mobile number (optional)"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        errorText={
                          errors.phone ? 'Enter a valid 10-digit mobile number' : undefined
                        }
                      />
                    )}
                  />
                  {error ? <InlineError message={error} /> : null}
                </SummaryPanel>
              </Reveal>

              <Reveal index={2}>
                <AppText variant="bodySM" tone="secondary">
                  Prototype booking: this marks the plot as booked in the demo data. No payment is
                  taken and nothing is locked in a real system.
                </AppText>
              </Reveal>
            </>
          ) : null
        }
      </ResourceBoundary>

      <ConfirmationSheet
        visible={pending !== null}
        onClose={() => setPending(null)}
        onConfirm={confirm}
        title={`Book plot ${plot?.plotNumber ?? ''}?`}
        message={
          plot && pending
            ? `${pending.customerName} · ${formatInr(plot.estimatedTotal)}. This is a prototype booking.`
            : undefined
        }
        confirmLabel="Confirm booking"
        loading={booking}
      />
    </ScreenLayout>
  );
}
