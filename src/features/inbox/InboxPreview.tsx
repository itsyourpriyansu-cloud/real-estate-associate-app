import { useRouter } from 'expo-router';
import { MessageSquare } from 'lucide-react-native';
import { useCallback } from 'react';
import { View } from 'react-native';

import { ConversationRow } from '@/components/domain';
import { EmptyState, LoadingState } from '@/components/feedback';
import { LargeTitleHeader } from '@/components/navigation';
import { ResourceBoundary, ScreenLayout } from '@/components/patterns';
import { Divider } from '@/components/primitives';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { conversationRepository, leadRepository, projectRepository } from '@/repositories';
import { clock } from '@/services/clock';
import { space } from '@/design-system';
import { parked } from '@/utils/parkedRoutes';

/** Conversations with their customer names, resolved through repositories. */
function useInboxPreview() {
  const loader = useCallback(async () => {
    const [conversations, leads, projects] = await Promise.all([
      conversationRepository.list(),
      leadRepository.list(),
      projectRepository.list(),
    ]);
    // Project context: the project the lead most plausibly discussed — its first shortlisted plot's
    // project is not available here, so use the lead's first preferred location match.
    const projectFor = (locations: string[]) =>
      projects.find((p) => locations.includes(p.location))?.name;
    return {
      now: clock.now(),
      rows: conversations.map((conversation) => {
        const lead = leads.find((l) => l.id === conversation.leadId);
        return {
          conversation,
          name: lead?.fullName ?? 'Customer',
          project: lead ? projectFor(lead.requirement.preferredLocations) : undefined,
        };
      }),
    };
  }, []);
  return useAsyncResource(loader);
}

/**
 * REPRESENTATIVE COMPOSITION (not the final Inbox): the seeded conversation list, to judge
 * ConversationRow and UnreadBadge. This is a PROTOTYPE inbox over seeded threads, not live WhatsApp.
 */
export function InboxPreview() {
  const router = useRouter();
  const inbox = useInboxPreview();
  const unread = inbox.data?.rows.filter((row) => row.conversation.unreadCount > 0).length ?? 0;

  return (
    <ScreenLayout
      gap={space[8]}
      header={
        <LargeTitleHeader
          title="Inbox"
          subtitle={
            inbox.data
              ? `${unread} unread · Prototype inbox, not live WhatsApp`
              : 'Loading conversations'
          }
        />
      }
    >
      <ResourceBoundary
        resource={inbox}
        subject="your conversations"
        loading={<LoadingState variant="rows" count={5} />}
        isEmpty={(data) => data.rows.length === 0}
        empty={
          <EmptyState
            icon={MessageSquare}
            title="No conversations yet"
            description="Customer messages will appear here."
          />
        }
      >
        {({ rows, now }) => (
          <View>
            {rows.map(({ conversation, name, project }, index) => (
              <View key={conversation.id}>
                {index > 0 ? <Divider inset={52} /> : null}
                <ConversationRow
                  conversation={conversation}
                  customerName={name}
                  projectName={project}
                  now={now}
                  onPress={() =>
                    router.push(
                      parked({
                        pathname: '/conversations/[conversationId]',
                        params: { conversationId: conversation.id },
                      }),
                    )
                  }
                />
              </View>
            ))}
          </View>
        )}
      </ResourceBoundary>
    </ScreenLayout>
  );
}
