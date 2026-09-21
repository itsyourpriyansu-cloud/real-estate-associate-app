import type { AppNotification, NotificationType } from '@/domain';

export interface NotificationListInput {
  type?: NotificationType;
  unreadOnly?: boolean;
}

/** Maps to /api/v1/notifications/*. */
export interface NotificationRepository {
  /** GET /notifications — newest first. */
  list(input?: NotificationListInput): Promise<AppNotification[]>;
  /** GET /notifications/unread-count */
  getUnreadCount(): Promise<number>;
  /** POST /notifications/{id}/read */
  markRead(id: string): Promise<AppNotification>;
  /** POST /notifications/read-all */
  markAllRead(): Promise<void>;
}
