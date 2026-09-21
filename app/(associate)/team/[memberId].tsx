import { useLocalSearchParams } from 'expo-router';

import { MemberDetailScreen } from '@/features/team/MemberDetailScreen';

export default function TeamMemberRoute() {
  const { memberId } = useLocalSearchParams<{ memberId: string }>();
  return <MemberDetailScreen memberId={memberId} />;
}
