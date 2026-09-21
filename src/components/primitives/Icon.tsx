import { Check, Circle, Clock, Lock, Minus, type LucideIcon } from 'lucide-react-native';

import { iconSize, type StatusIconName } from '@/design-system';

import { textColors, type TextTone } from './AppText';

export interface IconProps {
  icon: LucideIcon;
  size?: keyof typeof iconSize;
  tone?: TextTone;
  /** Override with a raw token colour (e.g. a status colour from `plotStatusTokens`). */
  color?: string;
  filled?: boolean;
}

/** One icon style everywhere: lucide, 1.75 stroke, sizes from `iconSize` (18–22 typical). */
export function Icon({ icon: Glyph, size = 'md', tone = 'secondary', color, filled }: IconProps) {
  const resolved = color ?? textColors[tone];
  return (
    <Glyph
      size={iconSize[size]}
      color={resolved}
      strokeWidth={1.75}
      fill={filled ? resolved : 'none'}
      aria-hidden
    />
  );
}

const statusGlyphs: Record<StatusIconName, LucideIcon> = {
  dot: Circle,
  clock: Clock,
  check: Check,
  lock: Lock,
  minus: Minus,
};

/** Resolves a status token's icon *name* to its glyph — status is never colour alone. */
export const statusGlyph = (name: StatusIconName): LucideIcon => statusGlyphs[name];
