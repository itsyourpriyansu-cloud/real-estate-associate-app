import { useRouter } from 'expo-router';
import { Plus, Search, UsersRound } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { IconButton } from '@/components/buttons';
import { FilterChip } from '@/components/chips';
import { EmptyState, LoadingState, useToast } from '@/components/feedback';
import { LeadCard } from '@/components/domain';
import { LargeTitleHeader } from '@/components/navigation';
import { ResourceBoundary, ScreenLayout } from '@/components/patterns';
import { layout, space } from '@/design-system';
import type { LeadListFilter } from '@/repositories';
import { pluralize } from '@/utils/format';

import { useLeadsPreview } from './useLeadsPreview';
import { parked } from '@/utils/parkedRoutes';

const FILTERS: { key: LeadListFilter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'NEW', label: 'New' },
  { key: 'HOT', label: 'Hot' },
  { key: 'FOLLOW_UP', label: 'Follow-up' },
  { key: 'VISIT', label: 'Visit' },
  { key: 'NEGOTIATION', label: 'Negotiation' },
];

const EMPTY_COPY: Record<LeadListFilter, { title: string; description: string }> = {
  ALL: { title: 'No leads yet', description: 'New enquiries will show up here as they come in.' },
  NEW: { title: 'No new leads', description: 'Every lead has been contacted. Nice work.' },
  HOT: { title: 'No hot leads right now', description: 'Leads you mark as hot will appear here.' },
  FOLLOW_UP: { title: 'No follow-ups due', description: 'You’re caught up on follow-ups.' },
  VISIT: {
    title: 'No leads at the visit stage',
    description: 'Schedule a site visit to move a lead forward.',
  },
  NEGOTIATION: {
    title: 'Nothing in negotiation',
    description: 'Leads in price discussions will appear here.',
  },
};

/**
 * REPRESENTATIVE COMPOSITION (not the final Leads screen): title, filter chips and the lead list,
 * to prove LeadCard, FilterChip and the four-state pattern on real seeded data. Call / WhatsApp are
 * wired in the CRM stage and say so.
 */
export function LeadsPreview() {
  const router = useRouter();
  const toast = useToast();
  const [filter, setFilter] = useState<LeadListFilter>('ALL');
  const leads = useLeadsPreview(filter);
  const later = (what: string) => () =>
    toast.show({ tone: 'info', message: `${what} arrives in a later stage.` });

  return (
    <ScreenLayout
      gap={space[16]}
      header={
        <LargeTitleHeader
          title="Leads"
          subtitle={
            leads.data
              ? `${leads.data.leads.length} ${pluralize(leads.data.leads.length, 'lead', 'leads')}${filter === 'ALL' ? '' : ` · ${FILTERS.find((f) => f.key === filter)?.label}`}`
              : 'Loading your leads'
          }
          right={
            <>
              <IconButton
                icon={Search}
                accessibilityLabel="Search"
                onPress={() => router.push(parked('/search'))}
              />
              <IconButton
                icon={Plus}
                accessibilityLabel="Add lead"
                variant="filled"
                onPress={later('Adding a lead')}
              />
            </>
          }
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
          {FILTERS.map(({ key, label }) => (
            <FilterChip
              key={key}
              label={label}
              selected={filter === key}
              onPress={() => setFilter(key)}
            />
          ))}
        </ScrollView>
      </View>

      <ResourceBoundary
        resource={leads}
        subject="your leads"
        loading={<LoadingState variant="cards" count={3} />}
        isEmpty={(data) => data.leads.length === 0}
        empty={<EmptyState icon={UsersRound} {...EMPTY_COPY[filter]} />}
      >
        {({ leads: items, now }) => (
          <View style={{ gap: space[12] }}>
            {items.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                now={now}
                onPress={() =>
                  router.push(parked({ pathname: '/leads/[leadId]', params: { leadId: lead.id } }))
                }
                onCall={later('Calling')}
                onWhatsApp={later('WhatsApp sharing')}
              />
            ))}
          </View>
        )}
      </ResourceBoundary>
    </ScreenLayout>
  );
}
