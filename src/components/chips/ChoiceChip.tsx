import type { LucideIcon } from 'lucide-react-native';
import { Check } from 'lucide-react-native';

import { colors, layout, motion, radius, space } from '@/design-system';

import { AppText } from '../primitives/AppText';
import { Icon } from '../primitives/Icon';
import { PressableScale } from '../primitives/PressableScale';

export interface ChoiceChipProps {
  label: string;
  selected?: boolean;
  icon?: LucideIcon;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
}

/** A form choice (facing, purpose, timeline). Selection is shown by a border, a tick and a tonal lift — never by colour alone. */
export function ChoiceChip({ label, selected, icon, onPress, disabled, testID }: ChoiceChipProps) {
  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      haptic="selection"
      scaleTo={motion.pressScaleChip}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!selected, checked: !!selected }}
      style={{
        minHeight: layout.minTapTarget,
        paddingHorizontal: space[16],
        borderRadius: radius.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[8],
        backgroundColor: selected ? colors.brandSoft : colors.surfacePrimary,
        borderWidth: 1,
        borderColor: selected ? colors.brand : colors.borderMedium,
      }}
    >
      {icon ? <Icon icon={icon} size="md" tone={selected ? 'brand' : 'secondary'} /> : null}
      <AppText variant="labelLG" tone={selected ? 'brand' : 'secondary'}>
        {label}
      </AppText>
      {selected ? <Icon icon={Check} size="md" tone="brand" /> : null}
    </PressableScale>
  );
}
