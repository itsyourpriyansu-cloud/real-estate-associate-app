import {
  CalendarX2,
  Building2,
  MessageSquare,
  Search as SearchIcon,
  Trash2,
  UsersRound,
  Phone,
  Share2,
} from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, IconButton } from '@/components/buttons';
import {
  ActionSheet,
  BottomSheet,
  ConfirmationSheet,
  EmptyState,
  InlineError,
  LoadingState,
  OfflineBanner,
  RepositoryErrorState,
  Skeleton,
  SkeletonLeadCard,
  SkeletonMetricStrip,
  SkeletonProjectCard,
  SkeletonRow,
  useToast,
} from '@/components/feedback';
import {
  DetailHeader,
  HomeHeader,
  LargeTitleHeader,
  SearchHeader,
  StandardHeader,
} from '@/components/navigation';
import { AppText, Surface } from '@/components/primitives';
import { space } from '@/design-system';
import { RepositoryError } from '@/repositories';

import { ShowcaseSection, Specimen } from '../ShowcaseSection';

const noop = () => undefined;

export function FeedbackAndNav() {
  const toast = useToast();
  const [sheet, setSheet] = useState<'bottom' | 'action' | 'confirm' | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [search, setSearch] = useState('');

  return (
    <>
      <ShowcaseSection
        title="Empty states"
        note="Human and specific: say what is missing and what to do. Never “No data found”."
      >
        <Surface padding={8}>
          <EmptyState
            icon={UsersRound}
            title="No leads yet"
            description="New enquiries will show up here as they come in."
            actionLabel="Add a lead"
            onAction={noop}
          />
        </Surface>
        <Surface padding={8}>
          <EmptyState
            icon={CalendarX2}
            title="Nothing scheduled today"
            description="Follow-ups and visits you schedule for today will show up here."
          />
        </Surface>
        <Surface padding={8}>
          <EmptyState
            icon={MessageSquare}
            title="No conversations yet"
            description="Customer messages will appear here."
          />
        </Surface>
        <Surface padding={8}>
          <EmptyState
            icon={Building2}
            title="No plots match these filters"
            description="Try a wider size range or include plots on hold."
            actionLabel="Clear filters"
            onAction={noop}
          />
        </Surface>
        <Surface padding={8}>
          <EmptyState
            icon={SearchIcon}
            title="No site visits"
            description="Schedule a visit from any lead to see it here."
          />
        </Surface>
      </ShowcaseSection>

      <ShowcaseSection
        title="Errors and offline"
        note="Recoverable, reassuring, specific. Raw error text is never shown."
      >
        <Specimen label="Repository failure">
          <Surface padding={8}>
            <RepositoryErrorState
              error={new RepositoryError('SERVER_ERROR', 'boom')}
              subject="your leads"
              onRetry={noop}
            />
          </Surface>
        </Specimen>
        <Specimen label="Offline">
          <Surface padding={8}>
            <RepositoryErrorState
              error={new RepositoryError('OFFLINE', 'offline')}
              subject="your leads"
              onRetry={noop}
            />
          </Surface>
        </Specimen>
        <Specimen label="Partial loading · one section failed">
          <RepositoryErrorState
            compact
            error={new RepositoryError('SERVER_ERROR', 'boom')}
            subject="today’s visits"
            onRetry={noop}
          />
        </Specimen>
        <Specimen label="Offline banner · inline field error">
          <OfflineBanner onRetry={noop} />
          <InlineError message="Enter a valid 10-digit mobile number." />
        </Specimen>
        <Specimen label="Action failure (toast) · tap to trigger each tone">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[8] }}>
            <Button
              label="Success"
              variant="secondary"
              size="medium"
              onPress={() => toast.show({ tone: 'success', message: 'Visit marked complete.' })}
            />
            <Button
              label="Error"
              variant="secondary"
              size="medium"
              onPress={() =>
                toast.show({
                  tone: 'error',
                  message: 'Couldn’t mark the visit complete. Try again.',
                })
              }
            />
            <Button
              label="Info"
              variant="secondary"
              size="medium"
              onPress={() =>
                toast.show({ tone: 'info', message: 'Prototype mode: no code is sent.' })
              }
            />
          </View>
        </Specimen>
      </ShowcaseSection>

      <ShowcaseSection
        title="Loading"
        note="Skeletons mirror the real layout, so nothing jumps when data arrives. No lone spinner."
      >
        <Specimen label="Skeleton · line, lead card, row, project card, metric strip">
          <Skeleton width="60%" height={16} />
          <SkeletonLeadCard />
          <SkeletonRow />
          <SkeletonProjectCard />
          <SkeletonMetricStrip />
        </Specimen>
        <Specimen label="LoadingState (cards)">
          <LoadingState variant="cards" count={1} />
        </Specimen>
      </ShowcaseSection>

      <ShowcaseSection
        title="Sheets"
        note="Short contextual choices live in sheets. Drag the handle, tap the scrim, or use Android back."
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[8] }}>
          <Button
            label="Bottom sheet"
            variant="secondary"
            size="medium"
            onPress={() => setSheet('bottom')}
          />
          <Button
            label="Action sheet"
            variant="secondary"
            size="medium"
            onPress={() => setSheet('action')}
          />
          <Button
            label="Confirmation"
            variant="danger"
            size="medium"
            onPress={() => setSheet('confirm')}
          />
        </View>
        <BottomSheet
          visible={sheet === 'bottom'}
          onClose={() => setSheet(null)}
          title="Share project"
        >
          <AppText tone="secondary" style={{ marginBottom: space[16] }}>
            A bottom sheet holds a short, contextual choice. Longer workflows are full screens.
          </AppText>
          <Button label="Done" fullWidth onPress={() => setSheet(null)} />
        </BottomSheet>
        <ActionSheet
          visible={sheet === 'action'}
          onClose={() => setSheet(null)}
          title="Rahul Sharma"
          actions={[
            {
              key: 'call',
              label: 'Call',
              icon: Phone,
              onPress: () =>
                toast.show({ message: 'Calling arrives in a later stage.', tone: 'info' }),
            },
            { key: 'share', label: 'Share project', icon: Share2, onPress: noop },
            { key: 'delete', label: 'Delete lead', icon: Trash2, destructive: true, onPress: noop },
          ]}
        />
        <ConfirmationSheet
          visible={sheet === 'confirm'}
          onClose={() => setSheet(null)}
          title="Delete this lead?"
          message="Its timeline and notes will be removed from this prototype."
          confirmLabel="Delete lead"
          destructive
          loading={confirming}
          onConfirm={() => {
            setConfirming(true);
            setTimeout(() => {
              setConfirming(false);
              setSheet(null);
              toast.show({ message: 'Lead deleted.', tone: 'success' });
            }, 900);
          }}
        />
      </ShowcaseSection>

      <ShowcaseSection
        title="Headers"
        note="The bottom bar is the app’s own — see below this gallery on any tab screen."
      >
        <Specimen label="StandardHeader">
          <StandardHeader
            title="Notifications"
            right={<IconButton icon={SearchIcon} accessibilityLabel="Search" />}
          />
        </Specimen>
        <Specimen label="LargeTitleHeader">
          <LargeTitleHeader
            title="Leads"
            subtitle="18 leads · Hot"
            right={<IconButton icon={SearchIcon} accessibilityLabel="Search" />}
          />
        </Specimen>
        <Specimen label="DetailHeader">
          <DetailHeader
            title="Rahul Sharma"
            subtitle="Real Rise shortlist"
            onBack={noop}
            right={<IconButton icon={Share2} accessibilityLabel="Share" />}
          />
        </Specimen>
        <Specimen label="SearchHeader">
          <SearchHeader value={search} onChangeText={setSearch} onCancel={noop} />
        </Specimen>
        <Specimen label="HomeHeader">
          <HomeHeader
            greeting="Good morning"
            name="Raghunath"
            fullName="K. V. Raghunath Reddy"
            unreadCount={5}
            onSearch={noop}
            onNotifications={noop}
            onProfile={noop}
          />
        </Specimen>
      </ShowcaseSection>
    </>
  );
}
