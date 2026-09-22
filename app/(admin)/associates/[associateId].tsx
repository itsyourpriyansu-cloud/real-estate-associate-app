import { useLocalSearchParams } from 'expo-router';

import { AssociateDetailScreen } from '@/features/admin/AssociateDetailScreen';

export default function AssociateDetailRoute() {
  const { associateId } = useLocalSearchParams<{ associateId: string }>();
  return <AssociateDetailScreen associateId={associateId} />;
}
