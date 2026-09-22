import { useLocalSearchParams } from 'expo-router';

import { ProjectGalleryScreen } from '@/features/projects/ProjectGalleryScreen';

export default function GalleryRoute() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  return <ProjectGalleryScreen projectId={projectId} />;
}
