import { Share2 } from 'lucide-react-native';
import { View } from 'react-native';

import type { Project } from '@/domain';
import { elevation, radius, space } from '@/design-system';
import { formatAreaRange, formatInr } from '@/utils/format';
import { PROJECT_STATUS_LABEL } from '@/utils/labels';

import { Button } from '../../buttons/Button';
import { IconButton } from '../../buttons/IconButton';
import { StatusChip } from '../../chips/StatusChip';
import { AppText } from '../../primitives/AppText';
import { statusGlyph } from '../../primitives/Icon';
import { CardPressRegion, PressableCard } from '../../primitives/PressableCard';
import { PropertyMetric } from './InventoryParts';
import { ProjectImage } from './ProjectImage';

/**
 * A project for browsing: image, name and location, price and size, live availability, and its
 * actions. Availability is a chip with a dot and the count in words — a sales person cares how
 * many plots can be shown today. The card opens the project; "View inventory", "View Gallery" and
 * "Share" are siblings of that press region, never nested inside it.
 */
export function ProjectCard({
  project,
  onPress,
  onViewInventory,
  onViewGallery,
  onShare,
}: {
  project: Project;
  onPress?: () => void;
  onViewInventory?: () => void;
  onViewGallery?: () => void;
  onShare?: () => void;
}) {
  const soldOut = project.availableUnits === 0;
  return (
    <PressableCard style={[elevation.raised, { borderRadius: radius.xl, overflow: 'hidden' }]}>
      <CardPressRegion
        onPress={onPress}
        accessibilityLabel={`${project.name}, ${project.location}. From ${formatInr(project.startingPrice)}. ${project.availableUnits} of ${project.totalUnits} plots available.`}
        accessibilityHint="Opens the project"
      >
        <ProjectImage
          source={project.heroImageUrl}
          height={148}
          accessibilityLabel={`${project.name} layout illustration`}
        />
        <View style={{ padding: space[16], paddingBottom: space[4], gap: space[16] }}>
          <View style={{ gap: space[4] }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: space[12],
              }}
            >
              <AppText variant="headingMD" numberOfLines={1} style={{ flex: 1 }} header>
                {project.name}
              </AppText>
              <StatusChip
                label={soldOut ? 'Sold out' : `${project.availableUnits} available`}
                tone={soldOut ? 'neutral' : 'success'}
                icon={statusGlyph(soldOut ? 'minus' : 'dot')}
              />
            </View>
            <AppText tone="secondary" numberOfLines={1}>
              {project.location} · {PROJECT_STATUS_LABEL[project.status]}
            </AppText>
          </View>
          <View style={{ flexDirection: 'row', gap: space[24] }}>
            <PropertyMetric label="Starting from" value={formatInr(project.startingPrice)} />
            <PropertyMetric
              label="Plot sizes"
              value={formatAreaRange(project.minPlotAreaSqYd, project.maxPlotAreaSqYd)}
            />
          </View>
        </View>
      </CardPressRegion>
      <View style={{ gap: space[8], padding: space[16] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[8] }}>
          <View style={{ flex: 1 }}>
            <Button label="View inventory" size="medium" fullWidth onPress={onViewInventory} />
          </View>
          {onShare ? (
            <IconButton
              icon={Share2}
              accessibilityLabel={`Share ${project.name}`}
              variant="outline"
              onPress={onShare}
            />
          ) : null}
        </View>
        {onViewGallery ? (
          <Button
            label="View Gallery"
            variant="secondary"
            size="medium"
            fullWidth
            onPress={onViewGallery}
          />
        ) : null}
      </View>
    </PressableCard>
  );
}

/** Large image with name, developer and location beneath — the top of a project page. */
export function ProjectHero({ project }: { project: Project }) {
  return (
    <View style={{ gap: space[16] }}>
      <View style={{ borderRadius: radius.xl, overflow: 'hidden' }}>
        <ProjectImage
          source={project.heroImageUrl}
          height={200}
          accessibilityLabel={`${project.name} layout illustration`}
        />
      </View>
      <View style={{ gap: space[4] }}>
        <AppText variant="headingXL" header>
          {project.name}
        </AppText>
        <AppText tone="secondary">
          {project.developerName} · {project.location}, {project.city}
        </AppText>
        {project.possessionLabel ? (
          <AppText variant="bodySM" tone="secondary">
            Possession · {project.possessionLabel}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}
