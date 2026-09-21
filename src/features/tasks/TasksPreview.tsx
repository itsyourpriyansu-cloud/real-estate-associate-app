import { useRouter } from 'expo-router';
import { CalendarCheck } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { FilterChip } from '@/components/chips';
import { EmptyState, LoadingState, useToast } from '@/components/feedback';
import { TaskCard } from '@/components/domain';
import { LargeTitleHeader } from '@/components/navigation';
import { ResourceBoundary, ScreenLayout } from '@/components/patterns';
import { AppText, Divider } from '@/components/primitives';
import { layout, space } from '@/design-system';
import { taskRepository, type TaskSegment } from '@/repositories';
import { formatDayLabel, formatLongDate } from '@/utils/format';

import { useTaskCounts, useTasksPreview } from './useTasksPreview';
import { parked } from '@/utils/parkedRoutes';

const SEGMENTS: { key: TaskSegment; label: string }[] = [
  { key: 'TODAY', label: 'Today' },
  { key: 'UPCOMING', label: 'Upcoming' },
  { key: 'OVERDUE', label: 'Overdue' },
  { key: 'COMPLETED', label: 'Completed' },
];

const EMPTY: Record<TaskSegment, { title: string; description: string }> = {
  TODAY: {
    title: 'Nothing scheduled today',
    description: 'Follow-ups and visits you schedule for today will show up here.',
  },
  UPCOMING: {
    title: 'No follow-ups scheduled',
    description: 'Add a follow-up from any lead to plan ahead.',
  },
  OVERDUE: { title: 'Nothing overdue', description: 'You’re on top of every follow-up.' },
  COMPLETED: {
    title: 'Nothing completed yet',
    description: 'Tasks you finish will be listed here.',
  },
};

/**
 * REPRESENTATIVE COMPOSITION (not the final Tasks screen): segment chips and a task list grouped by
 * day, with real completion — tap the circle and the repository marks it done, the next action moves
 * on, and a toast confirms. It exists to judge TaskCard and the completion behaviour.
 */
export function TasksPreview() {
  const router = useRouter();
  const toast = useToast();
  const [segment, setSegment] = useState<TaskSegment>('TODAY');
  const tasks = useTasksPreview(segment);
  const counts = useTaskCounts();

  const complete = async (taskId: string) => {
    try {
      await taskRepository.complete(taskId);
      toast.show({ tone: 'success', message: 'Task marked complete.' });
      tasks.reload();
      counts.reload();
    } catch {
      toast.show({ tone: 'error', message: 'Couldn’t mark the task complete. Try again.' });
    }
  };

  return (
    <ScreenLayout
      gap={space[16]}
      header={
        <LargeTitleHeader
          title="Tasks"
          subtitle={tasks.data ? formatLongDate(tasks.data.now) : 'Loading your tasks'}
        />
      }
    >
      <View style={{ marginHorizontal: -layout.screenPaddingX }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: layout.screenPaddingX, gap: space[8] }}
          accessibilityRole="tablist"
        >
          {SEGMENTS.map(({ key, label }) => (
            <FilterChip
              key={key}
              label={label}
              count={counts.data?.[key]}
              selected={segment === key}
              onPress={() => setSegment(key)}
            />
          ))}
        </ScrollView>
      </View>

      <ResourceBoundary
        resource={tasks}
        subject="your tasks"
        loading={<LoadingState variant="rows" count={5} />}
        isEmpty={(data) => data.tasks.length === 0}
        empty={<EmptyState icon={CalendarCheck} {...EMPTY[segment]} />}
      >
        {({ tasks: items, leadName, projectName, now }) => {
          // Group by calendar day, preserving the repository's order.
          const groups: { label: string; items: typeof items }[] = [];
          for (const task of items) {
            const label = formatDayLabel(task.scheduledAt, now);
            const last = groups.at(-1);
            if (last?.label === label) last.items.push(task);
            else groups.push({ label, items: [task] });
          }
          return (
            <View style={{ gap: space[20] }}>
              {groups.map((group) => (
                <View key={group.label}>
                  <AppText
                    variant="labelSM"
                    tone="secondary"
                    uppercase
                    style={{ marginBottom: space[4] }}
                  >
                    {group.label}
                  </AppText>
                  {group.items.map((task, index) => (
                    <View key={task.id}>
                      {index > 0 ? <Divider /> : null}
                      <TaskCard
                        task={task}
                        now={now}
                        showDay={false}
                        leadName={task.leadId ? leadName.get(task.leadId) : undefined}
                        projectName={task.projectId ? projectName.get(task.projectId) : undefined}
                        onPress={() =>
                          task.leadId
                            ? router.push(
                                parked({
                                  pathname: '/leads/[leadId]',
                                  params: { leadId: task.leadId },
                                }),
                              )
                            : undefined
                        }
                        onComplete={() => complete(task.id)}
                      />
                    </View>
                  ))}
                </View>
              ))}
            </View>
          );
        }}
      </ResourceBoundary>
    </ScreenLayout>
  );
}
