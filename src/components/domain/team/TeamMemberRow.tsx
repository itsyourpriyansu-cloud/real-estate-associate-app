import { View } from 'react-native';

import type { TeamMember } from '@/domain';
import { space } from '@/design-system';

import { StatusChip } from '../../chips/StatusChip';
import { AppText } from '../../primitives/AppText';
import { Avatar } from '../../primitives/Avatar';
import { Icon } from '../../primitives/Icon';
import { icons } from '../../primitives/icons';
import { PressableScale } from '../../primitives/PressableScale';

/**
 * One person in the associate's team: avatar, name, designation and code, how far down the tree
 * they sit ("Level 2"), and whether they are active. The whole row opens the member. Rows sit in a
 * `NavPanel`, which supplies the card and the hairlines.
 */
export function TeamMemberRow({ member, onPress }: { member: TeamMember; onPress: () => void }) {
  const inactive = member.status === 'INACTIVE';
  return (
    <PressableScale
      onPress={onPress}
      haptic="light"
      scaleTo={1}
      accessibilityLabel={`${member.fullName}, ${member.designation}, level ${member.level}${inactive ? ', inactive' : ''}`}
      accessibilityHint="Opens the member"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[12],
        paddingVertical: space[12],
        paddingHorizontal: space[16],
      }}
    >
      <Avatar name={member.fullName} size="md" />
      <View style={{ flex: 1, gap: space[2] }}>
        <AppText variant="labelLG" numberOfLines={1}>
          {member.fullName}
        </AppText>
        <AppText variant="bodySM" tone="secondary" numberOfLines={1}>
          {member.designation}
        </AppText>
      </View>
      <View style={{ alignItems: 'flex-end', gap: space[4] }}>
        <StatusChip label={`Level ${member.level}`} tone="brand" size="sm" />
        {inactive ? <StatusChip label="Inactive" size="sm" /> : null}
      </View>
      <Icon icon={icons.forward} size="lg" tone="tertiary" />
    </PressableScale>
  );
}
