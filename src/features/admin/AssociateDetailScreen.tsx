import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import {
  AppText,
  Button,
  DetailHeader,
  EmptyState,
  InlineError,
  LoadingState,
  ResourceBoundary,
  Reveal,
  ScreenLayout,
  StatusChip,
  SummaryPanel,
  TextField,
  icons,
  statusGlyph,
  useToast,
} from '@/components';
import { SENIOR_ASSOCIATE_DESIGNATION } from '@/constants/prototype';
import { space } from '@/design-system';
import { adminRepository, isRepositoryError } from '@/repositories';
import { haptics } from '@/services/haptics';

import { useAssociateDetail } from './useAssociateDetail';

/** Keeps digits and at most one decimal point. */
const numeric = (text: string) => {
  const cleaned = text.replace(/[^\d.]/g, '');
  const [whole = '', ...rest] = cleaned.split('.');
  return rest.length > 0 ? `${whole}.${rest.join('')}` : whole;
};

/**
 * 3a · SENIOR ASSOCIATE DETAIL — promote an associate, then set their commission rate and the
 * plot count that unlocks their foreign-trip reward. One screen for both admin actions.
 */
export function AssociateDetailScreen({ associateId }: { associateId: string }) {
  const router = useRouter();
  const toast = useToast();
  const resource = useAssociateDetail(associateId);
  const [commissionPercent, setCommissionPercent] = useState('');
  const [rewardTarget, setRewardTarget] = useState('');
  const [filled, setFilled] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();

  useEffect(() => {
    if (!filled && resource.data) {
      const { incentive } = resource.data;
      setCommissionPercent(incentive ? String(incentive.commissionRate * 100) : '');
      setRewardTarget(incentive ? String(incentive.rewardPlotTarget) : '');
      setFilled(true);
    }
  }, [resource.data, filled]);

  const promote = async () => {
    setPromoting(true);
    try {
      await adminRepository.promoteToSeniorAssociate(associateId);
      haptics.success();
      toast.show({ tone: 'success', message: 'Promoted to Senior Associate.' });
      resource.reload();
    } catch {
      haptics.error();
      toast.show({ tone: 'error', message: 'Couldn’t promote this associate.' });
    } finally {
      setPromoting(false);
    }
  };

  const saveIncentive = async () => {
    setFormError(undefined);
    setSaving(true);
    try {
      await adminRepository.assignIncentive({
        associateId,
        commissionRate: Number(commissionPercent) / 100,
        rewardPlotTarget: Number(rewardTarget),
      });
      haptics.success();
      toast.show({ tone: 'success', message: 'Incentive saved.' });
      resource.reload();
    } catch (error) {
      haptics.error();
      setFormError(
        isRepositoryError(error) ? error.message : 'Couldn’t save this incentive. Try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  const validPercent = /^\d+(\.\d+)?$/.test(commissionPercent) && Number(commissionPercent) <= 100;
  const validTarget = /^\d+$/.test(rewardTarget) && Number(rewardTarget) > 0;

  return (
    <ScreenLayout
      header={<DetailHeader title={resource.data?.associate?.fullName ?? 'Associate'} onBack={() => router.back()} />}
    >
      <ResourceBoundary
        resource={resource}
        subject="this associate"
        loading={<LoadingState variant="cards" count={1} />}
        isEmpty={(data) => data.associate === null}
        empty={
          <EmptyState
            icon={icons.admin}
            title="Associate not found"
            description="They may have been removed. Head back to Senior Associates."
            actionLabel="All associates"
            onAction={() => router.back()}
          />
        }
      >
        {({ associate, incentive }) =>
          associate ? (
            <>
              <Reveal index={0}>
                <SummaryPanel title="Associate">
                  <AppText tone="secondary">
                    {associate.designation} · {associate.associateCode}
                  </AppText>
                  {associate.designation === SENIOR_ASSOCIATE_DESIGNATION ? (
                    <StatusChip
                      label="Senior Associate"
                      tone="success"
                      icon={statusGlyph('check')}
                    />
                  ) : (
                    <Button
                      label="Promote to Senior Associate"
                      onPress={promote}
                      loading={promoting}
                      fullWidth
                    />
                  )}
                </SummaryPanel>
              </Reveal>

              {associate.designation === SENIOR_ASSOCIATE_DESIGNATION ? (
                <Reveal index={1}>
                  <SummaryPanel title="Commission and reward">
                    <AppText tone="secondary">
                      {incentive
                        ? 'Update their commission rate and foreign-trip plot target.'
                        : 'Not yet assigned — set their commission rate and foreign-trip plot target.'}
                    </AppText>
                    <TextField
                      label="Commission rate"
                      placeholder="5"
                      value={commissionPercent}
                      onChangeText={(text) => setCommissionPercent(numeric(text))}
                      keyboardType="decimal-pad"
                      right={<AppText tone="secondary">%</AppText>}
                    />
                    <TextField
                      label="Reward plot target"
                      placeholder="5"
                      value={rewardTarget}
                      onChangeText={(text) => setRewardTarget(numeric(text))}
                      keyboardType="number-pad"
                      right={<AppText tone="secondary">plots</AppText>}
                    />
                    {formError ? <InlineError message={formError} /> : null}
                    <View style={{ gap: space[8] }}>
                      <Button
                        label="Save incentive"
                        onPress={saveIncentive}
                        loading={saving}
                        disabled={!validPercent || !validTarget}
                        fullWidth
                      />
                    </View>
                  </SummaryPanel>
                </Reveal>
              ) : null}
            </>
          ) : null
        }
      </ResourceBoundary>
    </ScreenLayout>
  );
}
