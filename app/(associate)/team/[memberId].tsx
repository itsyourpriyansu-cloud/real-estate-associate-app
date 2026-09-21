import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/feedback';

export default function TeamMemberScreen() {
  const { memberId } = useLocalSearchParams<{ memberId: string }>();
  return (
    <PlaceholderScreen
      back
      title="Team member"
      route={`/team/${memberId}`}
      description="One member's details, sales and site visits. Reads TeamRepository.getMember. Built in Stage E."
    />
  );
}
