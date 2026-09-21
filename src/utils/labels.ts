import type {
  LeadPriority,
  LeadSource,
  LeadStage,
  NotificationType,
  TaskType,
  TimelineEventType,
  VisitStatus,
} from '@/domain';

/**
 * Human labels for domain enums. Each is a `Record<Enum, string>`, so adding an enum member without
 * a label is a compile error. Copy is concise and human (spec §18).
 */

export const LEAD_STAGE_LABEL: Record<LeadStage, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  INTERESTED: 'Interested',
  VISIT: 'Visit',
  NEGOTIATION: 'Negotiation',
  BOOKING: 'Booking',
  WON: 'Won',
  LOST: 'Lost',
};

export const LEAD_PRIORITY_LABEL: Record<LeadPriority, string> = {
  HOT: 'Hot',
  WARM: 'Warm',
  NORMAL: 'Normal',
  COLD: 'Cold',
};

export const LEAD_SOURCE_LABEL: Record<LeadSource, string> = {
  META_ADS: 'Meta Ads',
  GOOGLE_ADS: 'Google Ads',
  WEBSITE: 'Website',
  WHATSAPP: 'WhatsApp',
  REFERRAL: 'Referral',
  WALK_IN: 'Walk-in',
  PORTAL: 'Property portal',
  MANUAL: 'Added manually',
};

export const TASK_TYPE_LABEL: Record<TaskType, string> = {
  CALL: 'Call',
  WHATSAPP: 'WhatsApp',
  FOLLOW_UP: 'Follow-up',
  SITE_VISIT: 'Site visit',
  NOTE: 'Note',
};

export const VISIT_STATUS_LABEL: Record<VisitStatus, string> = {
  SCHEDULED: 'Scheduled',
  CONFIRMED: 'Confirmed',
  EN_ROUTE: 'On the way',
  ARRIVED: 'Arrived',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const NOTIFICATION_TYPE_LABEL: Record<NotificationType, string> = {
  ACTION_REQUIRED: 'Action required',
  FOLLOW_UP: 'Follow-up',
  INVENTORY: 'Inventory',
  UPDATE: 'Update',
};

export const TIMELINE_TYPE_LABEL: Record<TimelineEventType, string> = {
  LEAD_CREATED: 'Lead created',
  CALL: 'Call',
  WHATSAPP_SENT: 'WhatsApp sent',
  WHATSAPP_RECEIVED: 'WhatsApp received',
  NOTE: 'Note',
  STAGE_CHANGED: 'Stage changed',
  VISIT_SCHEDULED: 'Visit scheduled',
  VISIT_COMPLETED: 'Visit completed',
  PROJECT_SHARED: 'Project shared',
  PLOT_SHORTLISTED: 'Plot shortlisted',
};

export const FACING_LABEL = {
  NORTH: 'North facing',
  SOUTH: 'South facing',
  EAST: 'East facing',
  WEST: 'West facing',
} as const;
