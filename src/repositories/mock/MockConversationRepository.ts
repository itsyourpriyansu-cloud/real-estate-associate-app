import type { Conversation, Message } from '@/domain';

import type { ConversationListInput, ConversationRepository, SendMessageInput } from '../contracts';
import { fail, type MockContext } from './MockContext';
import { appendTimelineEvent } from './effects';
import { byIsoDesc, matchesQuery, nextId } from './utils';

export class MockConversationRepository implements ConversationRepository {
  constructor(private readonly ctx: MockContext) {}

  list(input: ConversationListInput = {}): Promise<Conversation[]> {
    return this.ctx.read((data) => {
      const { unreadOnly, query } = input;
      const leadName = new Map(data.leads.map((l) => [l.id, l.fullName]));
      return data.conversations
        .filter((c) => !unreadOnly || c.unreadCount > 0)
        .filter(
          (c) =>
            !query ||
            matchesQuery(query, [leadName.get(c.leadId), ...c.messages.map((m) => m.body)]),
        )
        .sort(byIsoDesc((c) => c.lastMessageAt));
    });
  }

  getById(id: string): Promise<Conversation | null> {
    return this.ctx.read((data) => data.conversations.find((c) => c.id === id) ?? null);
  }

  getByLeadId(leadId: string): Promise<Conversation | null> {
    return this.ctx.read((data) => data.conversations.find((c) => c.leadId === leadId) ?? null);
  }

  sendMessage(conversationId: string, input: SendMessageInput): Promise<Message> {
    return this.ctx.write((data, now) => {
      const conversation = data.conversations.find((c) => c.id === conversationId);
      if (!conversation) fail('NOT_FOUND', `Conversation ${conversationId} not found`);
      const body = input.body.trim();
      if (!body) fail('INVALID_INPUT', 'Message cannot be empty');

      const message: Message = {
        id: nextId(
          conversation.id.replace(/^conv_/, 'msg_'),
          conversation.messages.map((m) => m.id),
        ),
        direction: 'OUTBOUND',
        kind: input.kind,
        body,
        sentAt: now.toISOString(),
        status: 'SENT',
      };
      conversation.messages.push(message);
      conversation.lastMessageAt = message.sentAt;
      appendTimelineEvent(
        data,
        {
          leadId: conversation.leadId,
          type: 'WHATSAPP_SENT',
          title: 'Message sent',
          description: body.slice(0, 120),
        },
        now,
      );
      return message;
    });
  }

  markRead(conversationId: string): Promise<Conversation> {
    return this.ctx.write((data) => {
      const conversation = data.conversations.find((c) => c.id === conversationId);
      if (!conversation) fail('NOT_FOUND', `Conversation ${conversationId} not found`);
      conversation.unreadCount = 0;
      const lead = data.leads.find((l) => l.id === conversation.leadId);
      if (lead) lead.unreadMessages = 0;
      return conversation;
    });
  }
}
