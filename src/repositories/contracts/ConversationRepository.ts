import type { Conversation, Message } from '@/domain';

export interface ConversationListInput {
  unreadOnly?: boolean;
  /** Matches the customer's name (resolved through the lead) or message text. */
  query?: string;
}

export interface SendMessageInput {
  kind: Message['kind'];
  body: string;
}

/**
 * Maps to /api/v1/conversations/*.
 * Phase 1 is a PROTOTYPE inbox over seeded threads — sending only mutates local state and never
 * reaches WhatsApp. The real WhatsApp Business integration is out of scope.
 */
export interface ConversationRepository {
  /** GET /conversations — most recent message first. */
  list(input?: ConversationListInput): Promise<Conversation[]>;
  /** GET /conversations/{id} */
  getById(id: string): Promise<Conversation | null>;
  /** GET /leads/{leadId}/conversation */
  getByLeadId(leadId: string): Promise<Conversation | null>;
  /** POST /conversations/{id}/messages — appends an OUTBOUND message. */
  sendMessage(conversationId: string, input: SendMessageInput): Promise<Message>;
  /** POST /conversations/{id}/read — clears the unread count (and the lead's unread badge). */
  markRead(conversationId: string): Promise<Conversation>;
}
