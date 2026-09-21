import { useLocalSearchParams } from 'expo-router';

import { PlaceholderLink, PlaceholderScreen } from '@/components/feedback';

export default function InventoryScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  return (
    <PlaceholderScreen
      back
      title="Inventory"
      route={`/projects/${projectId}/inventory`}
      description="Plot grid with status legend, filters and sort. Built in Stage B."
    >
      <PlaceholderLink
        href={{ pathname: '/plots/[plotId]', params: { plotId: 'preview' } }}
        label="Open a plot (route check)"
      />
    </PlaceholderScreen>
  );
}
