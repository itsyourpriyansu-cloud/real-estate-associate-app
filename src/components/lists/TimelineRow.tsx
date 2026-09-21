import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { colors, radius, space, type Tone } from '@/design-system';

import { AppText } from '../primitives/AppText';
import { Icon } from '../primitives/Icon';
import { toneColors } from '@/design-system';

const RAIL = 32;

/**
 * One entry on a vertical timeline: an icon node on a hairline rail, then title, description and a
 * quiet timestamp. The rail is a line, not a card — history reads as a list, not a stack of boxes.
 */
export function TimelineRow({
  icon,
  title,
  description,
  time,
  tone = 'neutral',
  isLast,
  accessibilityLabel,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  time: string;
  tone?: Tone;
  isLast?: boolean;
  accessibilityLabel?: string;
}) {
  const palette = toneColors[tone];
  return (
    <View
      accessible
      accessibilityLabel={
        accessibilityLabel ?? [title, description, time].filter(Boolean).join('. ')
      }
      style={{ flexDirection: 'row', gap: space[12] }}
    >
      <View style={{ width: RAIL, alignItems: 'center' }}>
        <View
          style={{
            width: RAIL,
            height: RAIL,
            borderRadius: radius.pill,
            backgroundColor: colors.surfaceElevated,
            borderWidth: 1,
            borderColor: tone === 'neutral' ? colors.borderMedium : palette.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            icon={icon}
            size="md"
            color={tone === 'neutral' ? colors.textPrimary : palette.fg}
          />
        </View>
        {!isLast ? (
          <View
            style={{
              flex: 1,
              width: 1,
              backgroundColor: colors.borderMedium,
              marginVertical: space[4],
            }}
          />
        ) : null}
      </View>
      <View style={{ flex: 1, paddingBottom: isLast ? 0 : space[20], gap: space[2] }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space[8] }}>
          <AppText variant="labelLG" style={{ flexShrink: 1 }}>
            {title}
          </AppText>
          <AppText variant="caption" tone="secondary">
            {time}
          </AppText>
        </View>
        {description ? (
          <AppText variant="bodySM" tone="secondary">
            {description}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}
