import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import {
  ChipRow,
  EmptyState,
  FilterChip,
  IconButton,
  LargeTitleHeader,
  LoadingState,
  NavPanel,
  ResourceBoundary,
  Reveal,
  ScreenLayout,
  StatGrid,
  StatTile,
  SummaryPanel,
  TeamMemberRow,
  icons,
} from '@/components';
import type { TeamMember } from '@/domain';
import { pluralize } from '@/utils/format';

import { useTeam } from './useTeam';

/** 7 · MY TEAM — everyone the associate has added, and everyone they added, by level. */
export function MyTeamScreen() {
  const router = useRouter();
  const resource = useTeam();
  const [level, setLevel] = useState<number | 'ALL'>('ALL');

  const levels = useMemo(
    () => [...new Set((resource.data ?? []).map((m) => m.level))].sort((a, b) => a - b),
    [resource.data],
  );
  const visible = (team: TeamMember[]) =>
    level === 'ALL' ? team : team.filter((m) => m.level === level);

  return (
    <ScreenLayout
      onRefresh={resource.reload}
      refreshing={false}
      header={
        <LargeTitleHeader
          title="My Team"
          subtitle={
            resource.data
              ? `${resource.data.length} ${pluralize(resource.data.length, 'member', 'members')}`
              : 'Details of your team members'
          }
          right={
            <IconButton
              icon={icons.addMember}
              variant="filled"
              accessibilityLabel="Add team member"
              onPress={() => router.push('/team/add')}
            />
          }
        />
      }
    >
      <ResourceBoundary
        resource={resource}
        subject="your team"
        loading={<LoadingState variant="rows" count={5} />}
        isEmpty={(team) => team.length === 0}
        empty={
          <EmptyState
            icon={icons.myTeam}
            title="No team members yet"
            description="Add the people you bring in and they will show up here with their level."
            actionLabel="Add team member"
            onAction={() => router.push('/team/add')}
          />
        }
      >
        {(team) => (
          <>
            <Reveal index={0}>
              <SummaryPanel>
                <StatGrid>
                  <StatTile label="In your team" value={team.length} />
                  <StatTile
                    label="Active"
                    value={team.filter((m) => m.status === 'ACTIVE').length}
                  />
                </StatGrid>
              </SummaryPanel>
            </Reveal>

            <ChipRow>
              <FilterChip
                label="All"
                count={team.length}
                selected={level === 'ALL'}
                onPress={() => setLevel('ALL')}
              />
              {levels.map((l) => (
                <FilterChip
                  key={l}
                  label={`Level ${l}`}
                  count={team.filter((m) => m.level === l).length}
                  selected={level === l}
                  onPress={() => setLevel(l)}
                />
              ))}
            </ChipRow>

            <NavPanel>
              {visible(team).map((member) => (
                <TeamMemberRow
                  key={member.id}
                  member={member}
                  onPress={() =>
                    router.push({ pathname: '/team/[memberId]', params: { memberId: member.id } })
                  }
                />
              ))}
            </NavPanel>
          </>
        )}
      </ResourceBoundary>
    </ScreenLayout>
  );
}
