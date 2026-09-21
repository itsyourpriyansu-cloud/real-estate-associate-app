import {
  Bookmark,
  CalendarCheck,
  CalendarClock,
  FileText,
  MessageCircle,
  Phone,
  Send,
  Share2,
  UserPlus,
  Workflow,
  type LucideIcon,
} from 'lucide-react-native';

import type { TimelineEvent, TimelineEventType } from '@/domain';
import { formatRelativePast } from '@/utils/format';

import { TimelineRow } from '../../lists/TimelineRow';

export const TIMELINE_ICON: Record<TimelineEventType, LucideIcon> = {
  LEAD_CREATED: UserPlus,
  CALL: Phone,
  WHATSAPP_SENT: Send,
  WHATSAPP_RECEIVED: MessageCircle,
  NOTE: FileText,
  STAGE_CHANGED: Workflow,
  VISIT_SCHEDULED: CalendarClock,
  VISIT_COMPLETED: CalendarCheck,
  PROJECT_SHARED: Share2,
  PLOT_SHORTLISTED: Bookmark,
};

/** A lead-timeline event mapped to an icon, title, description and a relative time. */
export function TimelineEventRow({
  event,
  now,
  isLast,
}: {
  event: TimelineEvent;
  now: Date;
  isLast?: boolean;
}) {
  return (
    <TimelineRow
      icon={TIMELINE_ICON[event.type]}
      title={event.title}
      description={event.description}
      time={formatRelativePast(event.occurredAt, now)}
      isLast={isLast}
      accessibilityLabel={[
        event.title,
        event.description,
        event.actorName,
        formatRelativePast(event.occurredAt, now),
      ]
        .filter(Boolean)
        .join('. ')}
    />
  );
}
