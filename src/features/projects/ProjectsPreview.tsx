import { useRouter } from 'expo-router';
import { Building2 } from 'lucide-react-native';
import { View } from 'react-native';

import { EmptyState, LoadingState, useToast } from '@/components/feedback';
import { InventorySummary, PlotCard, ProjectCard } from '@/components/domain';
import { LargeTitleHeader } from '@/components/navigation';
import { ResourceBoundary, ScreenLayout } from '@/components/patterns';
import { Section } from '@/components/primitives';
import { space } from '@/design-system';
import { pluralize } from '@/utils/format';

import { useProjectsPreview } from './useProjectsPreview';

/**
 * REPRESENTATIVE COMPOSITION (not the final Projects screen): the project list, then an inventory
 * sample for the first project — summary, legend and plot tiles — to judge the property components
 * (ProjectCard, InventorySummary, PlotCard) together on real seeded data.
 */
export function ProjectsPreview() {
  const router = useRouter();
  const toast = useToast();
  const projects = useProjectsPreview();
  const available = projects.data?.projects.reduce((sum, p) => sum + p.availableUnits, 0);

  return (
    <ScreenLayout
      header={
        <LargeTitleHeader
          title="Projects"
          subtitle={
            projects.data
              ? `${projects.data.projects.length} ${pluralize(projects.data.projects.length, 'project', 'projects')} · ${available} plots available`
              : 'Loading projects'
          }
        />
      }
    >
      <ResourceBoundary
        resource={projects}
        subject="your projects"
        loading={<LoadingState variant="projects" count={2} />}
        isEmpty={(data) => data.projects.length === 0}
        empty={
          <EmptyState
            icon={Building2}
            title="No projects yet"
            description="Projects assigned to you will appear here."
          />
        }
      >
        {({ projects: items, featured, summary, plots }) => (
          <>
            <View style={{ gap: space[16] }}>
              {items.map((project) => (
                <ProjectCard
                  key={project.id}
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
                  onShare={() =>
                    toast.show({ tone: 'info', message: 'Sharing arrives in a later stage.' })
                  }
                />
              ))}
            </View>

            {featured && summary ? (
              <Section title={`Inventory · ${featured.name}`} meta="Prototype data">
                <View style={{ gap: space[20] }}>
                  <InventorySummary summary={summary} />
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[12] }}>
                    {plots.map((plot) => (
                      <View key={plot.id} style={{ width: '47.5%', flexGrow: 1 }}>
                        <PlotCard
                          plot={plot}
                          onPress={() =>
                            router.push({
                              pathname: '/plots/[plotId]',
                              params: { plotId: plot.id },
                            })
                          }
                        />
                      </View>
                    ))}
                  </View>
                </View>
              </Section>
            ) : null}
          </>
        )}
      </ResourceBoundary>
    </ScreenLayout>
  );
}
