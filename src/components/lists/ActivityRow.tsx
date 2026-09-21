import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { space } from '@/design-system';

import { AppText } from '../primitives/AppText';
import { Icon } from '../primitives/Icon';

/** Compact "recent activity" line: icon · "Rahul Sharma — call" · time. Denser than a timeline row. */
export function ActivityRow({
  icon,
  title,
  subtitle,
  time,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  time: string;
}) {
  return (
    <View
      accessible
      accessibilityLabel={[title, subtitle, time].filter(Boolean).join(', ')}
      style={{ flexDirection: 'row', alignItems: 'center', gap: space[12], minHeight: 44 }}
    >
      <Icon icon={icon} size="lg" tone="secondary" />
      <View style={{ flex: 1 }}>
        <AppText variant="labelLG" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="bodySM" tone="secondary" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <AppText variant="caption" tone="secondary">
        {time}
      </AppText>
    </View>
  );
}
