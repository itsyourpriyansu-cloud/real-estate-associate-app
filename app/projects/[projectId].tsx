import { useLocalSearchParams } from 'expo-router';

import { PlaceholderLink, PlaceholderScreen } from '@/components/feedback';

export default function ProjectDetailScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  return (
    <PlaceholderScreen
      back
      title="Project detail"
      route={`/projects/${projectId}`}
      description="Hero, summary, highlights, amenities and inventory snapshot. Built in Stage B."
    >
      <PlaceholderLink
        href={{ pathname: '/projects/[projectId]/inventory', params: { projectId } }}
        label="View inventory"
      />
    </PlaceholderScreen>
  );
}
