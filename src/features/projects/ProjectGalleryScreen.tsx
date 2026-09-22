import { useRouter } from 'expo-router';
import { View } from 'react-native';

import {
  DetailHeader,
  EmptyState,
  LoadingState,
  ProjectImage,
  ResourceBoundary,
  Reveal,
  ScreenLayout,
  icons,
} from '@/components';
import { radius, space } from '@/design-system';

import { useProjectDetail } from './useProjects';

/** A project's photo gallery: every stock image for the project, two per row. */
export function ProjectGalleryScreen({ projectId }: { projectId: string }) {
  const router = useRouter();
  const resource = useProjectDetail(projectId);

  return (
    <ScreenLayout
      header={
        <DetailHeader
          title="Gallery"
          subtitle={resource.data?.project?.name}
          onBack={() => router.back()}
        />
      }
    >
      <ResourceBoundary
        resource={resource}
        subject="this gallery"
        loading={<LoadingState variant="cards" count={4} />}
        isEmpty={(data) => data.project === null}
        empty={
          <EmptyState
            icon={icons.gallery}
            title="Project not found"
            description="It may have been removed. Head back to see all projects."
            actionLabel="All projects"
            onAction={() => router.back()}
          />
        }
      >
        {({ project }) =>
          project ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[12] }}>
              {project.galleryImages.map((uri, index) => (
                <View key={uri} style={{ flexBasis: '47%', flexGrow: 1 }}>
                  <Reveal index={index}>
                    <View style={{ borderRadius: radius.lg, overflow: 'hidden' }}>
                      <ProjectImage
                        source={uri}
                        height={140}
                        accessibilityLabel={`${project.name} photo ${index + 1}`}
                      />
                    </View>
                  </Reveal>
                </View>
              ))}
            </View>
          ) : null
        }
      </ResourceBoundary>
    </ScreenLayout>
  );
}
