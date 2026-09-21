import type { AppNotification } from '@/domain';

import type { NotificationListInput, NotificationRepository } from '../contracts';
import { fail, type MockContext } from './MockContext';
import { byIsoDesc } from './utils';

export class MockNotificationRepository implements NotificationRepository {
  constructor(private readonly ctx: MockContext) {}

  list(input: NotificationListInput = {}): Promise<AppNotification[]> {
    return this.ctx.read((data) =>
      data.notifications
        .filter((n) => !input.type || n.type === input.type)
        .filter((n) => !input.unreadOnly || !n.read)
        .sort(byIsoDesc((n) => n.createdAt)),
    );
  }

  getUnreadCount(): Promise<number> {
    return this.ctx.read((data) => data.notifications.filter((n) => !n.read).length);
  }

  markRead(id: string): Promise<AppNotification> {
    return this.ctx.write((data) => {
      const notification = data.notifications.find((n) => n.id === id);
      if (!notification) fail('NOT_FOUND', `Notification ${id} not found`);
      notification.read = true;
      return notification;
    });
  }

  markAllRead(): Promise<void> {
    return this.ctx.write((data) => {
      data.notifications.forEach((n) => {
        n.read = true;
      });
    });
  }
}
