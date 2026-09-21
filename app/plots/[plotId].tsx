import { useLocalSearchParams } from 'expo-router';

import { PlotDetailScreen } from '@/features/projects/PlotDetailScreen';

export default function PlotDetailRoute() {
  const { plotId } = useLocalSearchParams<{ plotId: string }>();
  return <PlotDetailScreen plotId={plotId} />;
}
