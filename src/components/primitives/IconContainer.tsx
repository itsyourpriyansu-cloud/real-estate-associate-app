import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { colors, radius, toneColors, type Tone } from '@/design-system';

import { Icon } from './Icon';

const sizes = { sm: 32, md: 40, lg: 48 } as const;

export interface IconContainerProps {
  icon: LucideIcon;
  size?: keyof typeof sizes;
  tone?: Tone;
  /** Circle for people/actions, rounded square for objects. */
  shape?: 'circle' | 'square';
}

/** An icon on a quiet tinted tile. Neutral by default; a tone is used only when it carries meaning. */
export function IconContainer({
  icon,
  size = 'md',
  tone = 'neutral',
  shape = 'circle',
}: IconContainerProps) {
  const dimension = sizes[size];
  const palette = toneColors[tone];
  return (
    <View
      aria-hidden
      style={{
        width: dimension,
        height: dimension,
        borderRadius: shape === 'circle' ? radius.pill : radius.sm,
        backgroundColor: tone === 'neutral' ? colors.surfaceElevated : palette.bg,
        borderWidth: 1,
        borderColor: tone === 'neutral' ? colors.borderSubtle : palette.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon
        icon={icon}
        size={size === 'sm' ? 'md' : 'lg'}
        color={tone === 'neutral' ? colors.textPrimary : palette.fg}
      />
    </View>
  );
}
