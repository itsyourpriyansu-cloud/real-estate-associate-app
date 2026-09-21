import { useLocalSearchParams } from 'expo-router';

import { ProjectDetailScreen } from '@/features/projects/ProjectDetailScreen';

export default function ProjectDetailRoute() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  return <ProjectDetailScreen projectId={projectId} />;
}
