import { AlertCircle, Check } from 'lucide-react-native';
import { View } from 'react-native';

import type { Task } from '@/domain';
import { colors, layout, radius, space } from '@/design-system';
import { formatDayLabel, formatTime } from '@/utils/format';
import { TASK_TYPE_LABEL } from '@/utils/labels';

import { StatusChip } from '../../chips/StatusChip';
import { AppText } from '../../primitives/AppText';
import { Icon } from '../../primitives/Icon';
import { PressableScale } from '../../primitives/PressableScale';

export interface TaskCardProps {
  task: Task;
  now: Date;
  /** Who / what the task belongs to, shown under the title. */
  leadName?: string;
  projectName?: string;
  onPress?: () => void;
  /** Marks the task done. Completed tasks cannot be un-completed from here. */
  onComplete?: () => void;
  /** Show the day under the time. Turn off inside a list already grouped by day. */
  showDay?: boolean;
}

/**
 * A task as a row: time on the left, what and for whom in the middle, a completion control on the
 * right. Overdue tasks say "Overdue" with an icon; completed tasks read as done (tick + struck-through
 * title), not merely greyed. A row rather than a box — a day of tasks should read as one list.
 */
export function TaskCard({
  task,
  now,
  leadName,
  projectName,
  onPress,
  onComplete,
  showDay = true,
}: TaskCardProps) {
  const done = task.status === 'DONE';
  const overdue = task.status === 'OVERDUE';
  const belongsTo = [leadName, projectName].filter(Boolean).join(' · ');
  const day = formatDayLabel(task.scheduledAt, now);
  const time = formatTime(task.scheduledAt);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[12] }}>
      <PressableScale
        onPress={onPress}
        scaleTo={1}
        accessibilityLabel={[
          TASK_TYPE_LABEL[task.type],
          task.title,
          belongsTo,
          `${day} ${time}`,
          overdue ? 'Overdue' : done ? 'Done' : '',
        ]
          .filter(Boolean)
          .join(', ')}
        containerStyle={{ flex: 1 }}
        style={{
          flexDirection: 'row',
          gap: space[16],
          paddingVertical: space[12],
          borderRadius: radius.sm,
        }}
      >
        <View style={{ width: 80 }}>
          <AppText
            variant="labelLG"
            tone={done ? 'tertiary' : 'primary'}
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {time}
          </AppText>
          {showDay ? (
            <AppText variant="caption" tone="secondary">
              {day}
            </AppText>
          ) : null}
        </View>
        <View style={{ flex: 1, gap: space[4] }}>
          <AppText
            variant="labelLG"
            tone={done ? 'tertiary' : 'primary'}
            style={done ? { textDecorationLine: 'line-through' } : undefined}
            numberOfLines={2}
          >
            {task.title}
          </AppText>
          {belongsTo ? (
            <AppText variant="bodySM" tone="secondary" numberOfLines={1}>
              {belongsTo}
            </AppText>
          ) : null}
          {overdue ? (
            <StatusChip label="Overdue" tone="danger" icon={AlertCircle} size="sm" />
          ) : null}
        </View>
      </PressableScale>

      <PressableScale
        onPress={done ? undefined : onComplete}
        disabled={done || !onComplete}
        haptic="medium"
        dimWhenDisabled={!done}
        accessibilityRole="checkbox"
        accessibilityLabel={done ? `${task.title}, completed` : `Mark ${task.title} complete`}
        accessibilityState={{ checked: done, disabled: done }}
        style={{
          width: layout.minTapTarget,
          height: layout.minTapTarget,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        pressedStyle={{ backgroundColor: colors.transparent }}
      >
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: radius.pill,
            borderWidth: 1.5,
            borderColor: done ? colors.inkPrimary : colors.borderStrong,
            backgroundColor: done ? colors.inkPrimary : colors.transparent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {done ? <Icon icon={Check} size="md" color={colors.textInverse} /> : null}
        </View>
      </PressableScale>
    </View>
  );
}
