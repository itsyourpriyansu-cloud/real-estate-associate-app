import { useLocalSearchParams } from 'expo-router';

import { VisitDetailScreen } from '@/features/visits/VisitDetailScreen';

export default function VisitDetailRoute() {
  const { visitId } = useLocalSearchParams<{ visitId: string }>();
  return <VisitDetailScreen visitId={visitId} />;
}
