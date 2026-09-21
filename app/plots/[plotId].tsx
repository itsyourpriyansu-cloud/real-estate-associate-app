import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/feedback';

export default function PlotDetailScreen() {
  const { plotId } = useLocalSearchParams<{ plotId: string }>();
  return (
    <PlaceholderScreen
      back
      title="Plot detail"
      route={`/plots/${plotId}`}
      description="Plot facts, cost preview, WhatsApp share, shortlist and Prototype Hold. Built in Stage B."
    />
  );
}
