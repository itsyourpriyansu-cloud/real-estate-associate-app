import { colors, motion, radius, space } from '@/design-system';

import { AppText } from '../primitives/AppText';
import { PressableScale } from '../primitives/PressableScale';

export interface FilterChipProps {
  label: string;
  selected?: boolean;
  /** Optional count shown after the label, e.g. number of matching leads. */
  count?: number;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
}

/** Selectable filter pill. Selected = solid ink (the one dark mark in a chip row). */
export function FilterChip({ label, selected, count, onPress, disabled, testID }: FilterChipProps) {
  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      haptic="selection"
      scaleTo={motion.pressScaleChip}
      accessibilityLabel={count !== undefined ? `${label}, ${count}` : label}
      accessibilityState={{ selected: !!selected }}
      hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
      pressedStyle={selected ? { backgroundColor: colors.inkSecondary } : undefined}
      style={{
        height: 36,
        paddingHorizontal: space[16],
        borderRadius: radius.pill,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[6],
        backgroundColor: selected ? colors.inkPrimary : colors.surfacePrimary,
        borderWidth: 1,
        borderColor: selected ? colors.inkPrimary : colors.borderMedium,
      }}
    >
      <AppText variant="labelLG" tone={selected ? 'inverse' : 'secondary'}>
        {label}
      </AppText>
      {count !== undefined ? (
        <AppText
          variant="labelMD"
          tone={selected ? 'inverse' : 'secondary'}
          style={{ opacity: selected ? 0.7 : 1 }}
        >
          {count}
        </AppText>
      ) : null}
    </PressableScale>
  );
}
