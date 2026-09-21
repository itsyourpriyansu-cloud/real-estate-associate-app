import type { LucideIcon } from 'lucide-react-native';

import { colors, space } from '@/design-system';

import { AppText } from '../../primitives/AppText';
import { IconContainer } from '../../primitives/IconContainer';
import { Row } from '../../primitives/Layout';
import { PressableScale } from '../../primitives/PressableScale';

/** Icon tile + label. Four of these in a row is the Home quick-action strip. */
export function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      haptic="light"
      accessibilityLabel={label}
      containerStyle={{ flex: 1 }}
      pressedStyle={{ backgroundColor: colors.transparent }}
      style={{ alignItems: 'center', gap: space[8], paddingVertical: space[4] }}
    >
      <IconContainer icon={icon} size="lg" shape="square" />
      <AppText variant="labelMD" tone="secondary" style={{ textAlign: 'center' }} numberOfLines={2}>
        {label}
      </AppText>
    </PressableScale>
  );
}

export function QuickActionStrip({ children }: { children: React.ReactNode }) {
  return (
    <Row align="flex-start" gap={8}>
      {children}
    </Row>
  );
}
