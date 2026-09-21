import { Check, Flame, Minus, Snowflake, Sun, X, type LucideIcon } from 'lucide-react-native';

import type { LeadPriority, LeadStage } from '@/domain';
import type { Tone } from '@/design-system';
import { LEAD_PRIORITY_LABEL, LEAD_STAGE_LABEL } from '@/utils/labels';

import { StatusChip } from './StatusChip';

const priorityMap: Record<LeadPriority, { tone: Tone; icon: LucideIcon }> = {
  HOT: { tone: 'warning', icon: Flame },
  WARM: { tone: 'neutral', icon: Sun },
  NORMAL: { tone: 'neutral', icon: Minus },
  COLD: { tone: 'neutral', icon: Snowflake },
};

/** HOT is the only priority that draws colour (attention required); the rest stay monochrome. */
export function LeadPriorityChip({
  priority,
  size = 'sm',
}: {
  priority: LeadPriority;
  size?: 'sm' | 'md';
}) {
  const { tone, icon } = priorityMap[priority];
  return <StatusChip label={LEAD_PRIORITY_LABEL[priority]} tone={tone} icon={icon} size={size} />;
}

const stageMap: Partial<Record<LeadStage, { tone: Tone; icon: LucideIcon }>> = {
  WON: { tone: 'success', icon: Check },
  LOST: { tone: 'danger', icon: X },
};

/** Pipeline stage. Won / Lost carry a tone and an icon; every other stage is neutral text. */
export function LeadStageChip({ stage, size = 'sm' }: { stage: LeadStage; size?: 'sm' | 'md' }) {
  const mapped = stageMap[stage];
  return (
    <StatusChip
      label={LEAD_STAGE_LABEL[stage]}
      tone={mapped?.tone ?? 'neutral'}
      icon={mapped?.icon}
      size={size}
      accessibilityLabel={`Stage: ${LEAD_STAGE_LABEL[stage]}`}
    />
  );
}
