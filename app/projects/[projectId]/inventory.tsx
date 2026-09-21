import { useLocalSearchParams } from 'expo-router';

import { InventoryScreen } from '@/features/projects/InventoryScreen';

export default function InventoryRoute() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  return <InventoryScreen projectId={projectId} />;
}
