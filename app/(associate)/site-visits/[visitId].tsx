import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/feedback';

export default function VisitDetailScreen() {
  const { visitId } = useLocalSearchParams<{ visitId: string }>();
  return (
    <PlaceholderScreen
      back
      title="Site visit"
      route={`/site-visits/${visitId}`}
      description="Confirm, mark arrived, shortlist plots, capture the outcome and create a follow-up. Built in Stage D."
    />
  );
}
