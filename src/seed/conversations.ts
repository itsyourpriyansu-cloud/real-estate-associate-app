import type { Conversation, Message } from '@/domain';

import { PROJECT_BLUEPRINTS } from './projects';
import { conversationId, leadId, messageId } from './ids';
import type { SeedPicks } from './picks';
import type { SeedTime } from './time';

const lakhs = (amount: number) => `₹${(amount / 100_000).toFixed(1)}L`;

/**
 * 8 seeded conversations. Prototype inbox only — these are NOT live WhatsApp Business threads.
 * `unreadCount` equals the number of trailing unread INBOUND messages, and `lastMessageAt` is the
 * last message's `sentAt` (validated in the seed tests).
 */
export function buildConversations(t: SeedTime, picks: SeedPicks): Conversation[] {
  const projectName = (id: string) =>
    PROJECT_BLUEPRINTS.find((p) => p.id === id)?.name ?? 'the project';
  const { rahulPlot, faizanPlots } = picks;

  const conversation = (
    n: number,
    lead: number,
    unreadCount: number,
    drafts: Omit<Message, 'id'>[],
  ): Conversation => {
    const messages = drafts.map((m, i) => ({ id: messageId(n, i + 1), ...m }));
    const last = messages.at(-1);
    if (!last) throw new Error(`Seed conversation ${n} has no messages`);
    return {
      id: conversationId(n),
      leadId: leadId(lead),
      unreadCount,
      lastMessageAt: last.sentAt,
      messages,
    };
  };

  return [
    conversation(1, 1, 2, [
      {
        direction: 'OUTBOUND',
        kind: 'PROJECT_CARD',
        body: 'Real Rise · Bangalore Highway\n150–360 sq yd plots\nEast and north facing options available.',
        sentAt: t.at(-8, '10:20'),
        status: 'READ',
      },
      {
        direction: 'INBOUND',
        kind: 'TEXT',
        body: 'Thanks. Is an east-facing plot around 240 sq yd available?',
        sentAt: t.at(-8, '10:45'),
      },
      {
        direction: 'OUTBOUND',
        kind: 'TEXT',
        body: 'Yes, a few east-facing options in that size. I’ll shortlist and share them.',
        sentAt: t.at(-8, '11:02'),
        status: 'READ',
      },
      {
        direction: 'OUTBOUND',
        kind: 'VISIT_CONFIRMATION',
        body: `Site visit confirmed\nReal Rise · ${t.dayLabel(0)}, ${t.timeLabel('15:30')}`,
        sentAt: t.at(-1, '18:10'),
        status: 'READ',
      },
      {
        direction: 'INBOUND',
        kind: 'TEXT',
        body: 'Good morning sir. I will come with my wife and father.',
        sentAt: t.at(0, '08:40'),
      },
      {
        direction: 'INBOUND',
        kind: 'TEXT',
        body: `Can you also share the cost for plot ${rahulPlot.plotNumber}?`,
        sentAt: t.at(0, '08:52'),
      },
    ]),
    conversation(2, 2, 1, [
      {
        direction: 'INBOUND',
        kind: 'TEXT',
        body: 'Hi, I saw your ad for plots near Bangalore Highway. Can you share the details?',
        sentAt: t.at(0, '08:12'),
      },
    ]),
    conversation(3, 11, 3, [
      {
        direction: 'OUTBOUND',
        kind: 'TEXT',
        body: 'Thanks for your interest. I’ll call you to understand what you’re looking for.',
        sentAt: t.at(-2, '11:05'),
        status: 'READ',
      },
      {
        direction: 'INBOUND',
        kind: 'TEXT',
        body: 'Looking for investment plots with good appreciation.',
        sentAt: t.at(-1, '19:10'),
      },
      {
        direction: 'INBOUND',
        kind: 'TEXT',
        body: 'Budget is around 60L. Anything near the airport?',
        sentAt: t.at(-1, '19:12'),
      },
      {
        direction: 'INBOUND',
        kind: 'TEXT',
        body: 'Please call me after 5 PM.',
        sentAt: t.at(0, '07:45'),
      },
    ]),
    conversation(4, 3, 0, [
      {
        direction: 'OUTBOUND',
        kind: 'TEXT',
        body: 'Great meeting you at the site today. I’ll send the details of the shortlisted plots.',
        sentAt: t.at(-3, '18:05'),
        status: 'READ',
      },
      {
        direction: 'OUTBOUND',
        kind: 'COST_SHEET',
        body: `Cost sheet · Aurelia Greens\nPlot ${faizanPlots[0].plotNumber} · ${faizanPlots[0].areaSqYd} sq yd · ${faizanPlots[0].facing.toLowerCase()} facing\nEstimated total ${lakhs(faizanPlots[0].estimatedTotal)}\nThis is an estimate, not a quotation.`,
        sentAt: t.at(-1, '16:40'),
        status: 'DELIVERED',
      },
      {
        direction: 'INBOUND',
        kind: 'TEXT',
        body: 'Received. Can we do a three-instalment schedule?',
        sentAt: t.at(-1, '17:20'),
      },
    ]),
    conversation(5, 4, 0, [
      {
        direction: 'OUTBOUND',
        kind: 'TEXT',
        body: 'Hi Sneha, thanks for your enquiry. I can help you find a plot that fits your budget.',
        sentAt: t.at(-3, '12:00'),
        status: 'READ',
      },
      {
        direction: 'INBOUND',
        kind: 'TEXT',
        body: 'Please send the Northgate County details.',
        sentAt: t.at(-3, '12:30'),
      },
    ]),
    conversation(6, 10, 1, [
      {
        direction: 'OUTBOUND',
        kind: 'VISIT_CONFIRMATION',
        body: `Site visit scheduled\nReal Rise · ${t.dayLabel(1)}, ${t.timeLabel('11:00')}`,
        sentAt: t.at(-2, '17:05'),
        status: 'READ',
      },
      {
        direction: 'INBOUND',
        kind: 'TEXT',
        body: 'Can we shift the visit to 12 PM?',
        sentAt: t.at(0, '07:30'),
      },
    ]),
    conversation(7, 16, 0, [
      {
        direction: 'OUTBOUND',
        kind: 'VISIT_CONFIRMATION',
        body: `Site visit scheduled\nCedar Enclave · ${t.dayLabel(0)}, ${t.timeLabel('12:00')}`,
        sentAt: t.at(-1, '18:00'),
        status: 'DELIVERED',
      },
      {
        direction: 'INBOUND',
        kind: 'TEXT',
        body: 'Confirmed, I will be there.',
        sentAt: t.at(-1, '18:30'),
      },
    ]),
    conversation(8, 7, 0, [
      {
        direction: 'OUTBOUND',
        kind: 'PROJECT_CARD',
        body: `${projectName(picks.arjunHeldPlot.projectId)} · Outer Ring Growth Zone\nPlot ${picks.arjunHeldPlot.plotNumber} · ${picks.arjunHeldPlot.areaSqYd} sq yd`,
        sentAt: t.at(-5, '14:40'),
        status: 'READ',
      },
      {
        direction: 'OUTBOUND',
        kind: 'TEXT',
        body: 'I’ve placed a prototype hold on the plot while your loan sanction is processed.',
        sentAt: t.at(-4, '10:15'),
        status: 'READ',
      },
      {
        direction: 'INBOUND',
        kind: 'TEXT',
        body: 'Sending the KYC documents tomorrow.',
        sentAt: t.at(-1, '20:05'),
      },
    ]),
  ];
}
