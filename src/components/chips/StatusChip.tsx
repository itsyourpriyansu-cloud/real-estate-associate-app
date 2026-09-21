import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { colors, radius, space, toneColors, type Tone } from '@/design-system';

import { AppText, type TextTone } from '../primitives/AppText';
import { Icon } from '../primitives/Icon';

const textToneFor: Record<Tone, TextTone> = {
  neutral: 'secondary',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
};

export interface StatusChipProps {
  label: string;
  tone?: Tone;
  /** Status is never colour alone: pass an icon whenever the tone is not neutral. */
  icon?: LucideIcon;
  size?: 'sm' | 'md';
  accessibilityLabel?: string;
}

/** Non-interactive status pill: icon + label, with colour reserved for the semantic tone. */
export function StatusChip({
  label,
  tone = 'neutral',
  icon,
  size = 'md',
  accessibilityLabel,
}: StatusChipProps) {
  const palette = toneColors[tone];
  const neutral = tone === 'neutral';
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel ?? label}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: space[4],
        height: size === 'sm' ? 22 : 26,
        paddingHorizontal: size === 'sm' ? 8 : 10,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: neutral ? colors.borderMedium : palette.border,
        backgroundColor: neutral ? colors.transparent : palette.bg,
      }}
    >
      {icon ? <Icon icon={icon} size="sm" color={palette.fg} /> : null}
      <AppText variant="labelSM" uppercase tone={textToneFor[tone]} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}
