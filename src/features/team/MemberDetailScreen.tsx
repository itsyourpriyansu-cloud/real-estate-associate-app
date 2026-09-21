import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import {
  AppText,
  Avatar,
  DetailHeader,
  Divider,
  EmptyState,
  ListRow,
  LoadingState,
  ResourceBoundary,
  Reveal,
  ScreenLayout,
  StatusChip,
  SummaryPanel,
  icons,
} from '@/components';
import { space } from '@/design-system';

import { useMember } from './useTeam';

const phone = (value: string) => value.replace(/^(\+91)(\d{5})(\d{5})$/, '$1 $2 $3');

/** One member of the team: who they are, where they sit in the tree, and who added them. */
export function MemberDetailScreen({ memberId }: { memberId: string }) {
  const router = useRouter();
  const resource = useMember(memberId);

  return (
    <ScreenLayout
      edges={['top', 'bottom']}
      header={<DetailHeader title="Team member" onBack={() => router.back()} />}
    >
      <ResourceBoundary
        resource={resource}
        subject="this member"
        loading={<LoadingState variant="cards" count={2} />}
        isEmpty={(data) => data.member === null}
        empty={
          <EmptyState
            icon={icons.myTeam}
            title="Member not found"
            description="They are not in your team, or were removed."
            actionLabel="Back to my team"
            onAction={() => router.back()}
          />
        }
      >
        {({ member, sponsor }) =>
          member ? (
            <>
              <Reveal index={0}>
                <SummaryPanel>
                  <View style={{ alignItems: 'center', gap: space[12] }}>
                    <Avatar name={member.fullName} size="lg" />
                    <View style={{ alignItems: 'center', gap: space[2] }}>
                      <AppText variant="headingLG" header style={{ textAlign: 'center' }}>
                        {member.fullName}
                      </AppText>
                      <AppText tone="secondary">{member.designation}</AppText>
                    </View>
                    <View style={{ flexDirection: 'row', gap: space[8] }}>
                      <StatusChip label={`Level ${member.level}`} tone="brand" />
                      <StatusChip
                        label={member.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                        tone={member.status === 'ACTIVE' ? 'success' : 'neutral'}
                      />
                    </View>
                  </View>
                </SummaryPanel>
              </Reveal>

              <Reveal index={1}>
                <SummaryPanel title="Details">
                  <View>
                    <ListRow title="Associate code" subtitle={member.associateCode} />
                    <Divider />
                    <ListRow title="Phone" subtitle={phone(member.phone)} />
                    {member.email ? (
                      <>
                        <Divider />
                        <ListRow title="Email" subtitle={member.email} />
                      </>
                    ) : null}
                    <Divider />
                    <ListRow
                      title="Joined"
                      subtitle={format(new Date(member.joinedAt), 'd MMMM yyyy')}
                    />
                    {sponsor ? (
                      <>
                        <Divider />
                        <ListRow title="Added by" subtitle={sponsor.fullName} />
                      </>
                    ) : null}
                  </View>
                </SummaryPanel>
              </Reveal>
            </>
          ) : null
        }
      </ResourceBoundary>
    </ScreenLayout>
  );
}
