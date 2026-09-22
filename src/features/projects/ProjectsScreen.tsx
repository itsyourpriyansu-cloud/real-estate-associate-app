import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import {
  ChipRow,
  DetailHeader,
  EmptyState,
  FilterChip,
  LargeTitleHeader,
  LoadingState,
  ProjectCard,
  ResourceBoundary,
  Reveal,
  ScreenLayout,
  icons,
} from '@/components';
import type { Project, ProjectStatus } from '@/domain';
import { space } from '@/design-system';
import { selectSessionKind, useAuthStore } from '@/store/authStore';
import { PROJECT_STATUS_LABEL } from '@/utils/labels';

import { useProjects } from './useProjects';

type Filter = 'ALL' | ProjectStatus;
const FILTERS: Filter[] = ['ALL', 'ONGOING', 'COMPLETED'];

const label = (filter: Filter) => (filter === 'ALL' ? 'All' : PROJECT_STATUS_LABEL[filter]);

/**
 * 1 · OUR PROJECTS — shared by guest and associate. Associates land here from the dock (a
 * top-level screen with a large title); guests arrive from the guest hub and get a back button.
 * Filter by status; every card opens the project, its inventory, or its photo gallery.
 */
export function ProjectsScreen() {
  const router = useRouter();
  const isAssociate = useAuthStore(selectSessionKind) === 'associate';
  const resource = useProjects();
  const [filter, setFilter] = useState<Filter>('ALL');

  const counts = useMemo(() => {
    const projects = resource.data ?? [];
    return (f: Filter) =>
      f === 'ALL' ? projects.length : projects.filter((p) => p.status === f).length;
  }, [resource.data]);

  const visible = (projects: Project[]) =>
    filter === 'ALL' ? projects : projects.filter((p) => p.status === filter);

  return (
    <ScreenLayout
      onRefresh={resource.reload}
      refreshing={false}
      header={
        isAssociate ? (
          <LargeTitleHeader title="Our Projects" subtitle="Project details, status, locations" />
        ) : (
          <DetailHeader title="Our Projects" onBack={() => router.back()} />
        )
      }
    >
      <ChipRow>
        {FILTERS.map((f) => (
          <FilterChip
            key={f}
            label={label(f)}
            count={resource.data ? counts(f) : undefined}
            selected={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
      </ChipRow>

      <ResourceBoundary
        resource={resource}
        subject="our projects"
        loading={<LoadingState variant="projects" count={2} />}
        isEmpty={(projects) => visible(projects).length === 0}
        empty={
          <EmptyState
            icon={icons.projects}
            title={`No ${label(filter).toLowerCase()} projects`}
            description="Try another filter to see the rest of our projects."
            actionLabel="Show all"
            onAction={() => setFilter('ALL')}
          />
        }
      >
        {(projects) => (
          <View style={{ gap: space[16] }}>
            {visible(projects).map((project, index) => (
              <Reveal key={project.id} index={index}>
                <ProjectCard
                  project={project}
                  onPress={() =>
                    router.push({
                      pathname: '/projects/[projectId]',
                      params: { projectId: project.id },
                    })
                  }
                  onViewInventory={() =>
                    router.push({
                      pathname: '/projects/[projectId]/inventory',
                      params: { projectId: project.id },
                    })
                  }
                  onViewGallery={() =>
                    router.push({
                      pathname: '/projects/[projectId]/gallery',
                      params: { projectId: project.id },
                    })
                  }
                />
              </Reveal>
            ))}
          </View>
        )}
      </ResourceBoundary>
    </ScreenLayout>
  );
}
