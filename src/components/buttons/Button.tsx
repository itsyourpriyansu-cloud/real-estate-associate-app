import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

import { colors, layout, motion, radius, space, typography } from '@/design-system';

import { Icon } from '../primitives/Icon';
import { AppText, type TextTone } from '../primitives/AppText';
import { PressableScale, type HapticKind } from '../primitives/PressableScale';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
export type ButtonSize = 'large' | 'medium' | 'small';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  /** Shows a spinner in place of the label and blocks presses. Width is preserved. */
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  haptic?: HapticKind;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

const heights = { large: 52, medium: 44, small: 36 } as const;
const radii = { large: radius.md, medium: radius.sm, small: radius.sm } as const;
const paddings = { large: space[24], medium: space[20], small: space[12] } as const;
const labelStyle = {
  large: typography.buttonLG,
  medium: typography.buttonMD,
  small: typography.buttonMD,
} as const;

const surfaces: Record<
  ButtonVariant,
  { bg: string; border: string; tone: TextTone; spinner: string }
> = {
  primary: {
    bg: colors.whitePrimary,
    border: colors.whitePrimary,
    tone: 'inverse',
    spinner: colors.textInverse,
  },
  secondary: {
    bg: colors.surfaceElevated,
    border: colors.borderMedium,
    tone: 'primary',
    spinner: colors.textPrimary,
  },
  tertiary: {
    bg: colors.transparent,
    border: colors.transparent,
    tone: 'primary',
    spinner: colors.textPrimary,
  },
  danger: {
    bg: colors.dangerMuted,
    border: colors.dangerMuted,
    tone: 'danger',
    spinner: colors.danger,
  },
};

/**
 * The button system. One hierarchy per screen: a single Primary, then Secondary, then Tertiary;
 * Danger only for destructive actions. Every button is tactile (spring scale + optional haptic) and
 * has real default / pressed / disabled / loading states. Small buttons still get a 44pt hit area.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'large',
  icon,
  iconPosition = 'left',
  loading,
  disabled,
  fullWidth,
  haptic = variant === 'primary' ? 'light' : 'none',
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const inactive = !!disabled || !!loading;
  const dimmed = !!disabled && !loading;
  const palette = dimmed
    ? {
        bg: colors.surfaceElevated,
        border: colors.borderSubtle,
        tone: 'disabled' as TextTone,
        spinner: colors.textDisabled,
      }
    : surfaces[variant];
  const iconNode = icon ? (
    <Icon icon={icon} size={size === 'small' ? 'md' : 'lg'} tone={palette.tone} />
  ) : null;

  return (
    <PressableScale
      testID={testID}
      onPress={inactive ? undefined : onPress}
      disabled={inactive}
      haptic={haptic}
      scaleTo={motion.pressScaleButton}
      dimWhenDisabled={!dimmed}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ busy: !!loading }}
      hitSlop={size === 'small' ? { top: 4, bottom: 4, left: 4, right: 4 } : undefined}
      containerStyle={fullWidth ? { alignSelf: 'stretch' } : { alignSelf: 'flex-start' }}
      pressedStyle={variant === 'primary' ? { backgroundColor: colors.whiteSecondary } : undefined}
      style={{
        minHeight: Math.max(heights[size], size === 'small' ? heights.small : layout.minTapTarget),
        paddingHorizontal: paddings[size],
        borderRadius: radii[size],
        backgroundColor: palette.bg,
        borderWidth: 1,
        borderColor: palette.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: space[8],
        }}
      >
        {/* The label stays laid out (invisible) while loading so the button never changes width. */}
        <View
          style={{
            opacity: loading ? 0 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: space[8],
          }}
        >
          {iconPosition === 'left' ? iconNode : null}
          <AppText style={labelStyle[size]} tone={palette.tone} numberOfLines={1}>
            {label}
          </AppText>
          {iconPosition === 'right' ? iconNode : null}
        </View>
        {loading ? (
          <View style={{ position: 'absolute' }}>
            <ActivityIndicator color={palette.spinner} size="small" />
          </View>
        ) : null}
      </View>
    </PressableScale>
  );
}

type PresetProps = Omit<ButtonProps, 'variant'>;
export const PrimaryButton = (props: PresetProps) => <Button {...props} variant="primary" />;
export const SecondaryButton = (props: PresetProps) => <Button {...props} variant="secondary" />;
export const TertiaryButton = (props: PresetProps) => <Button {...props} variant="tertiary" />;
export const DangerButton = (props: PresetProps) => <Button {...props} variant="danger" />;
