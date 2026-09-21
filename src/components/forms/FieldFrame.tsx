import type { ReactNode } from 'react';
import { View } from 'react-native';

import { colors, radius, space } from '@/design-system';

import { InlineError } from '../feedback/States';
import { AppText } from '../primitives/AppText';

export type FieldState = 'idle' | 'focused' | 'filled' | 'error' | 'disabled';

/** Border/background for each field state — shared by every input so they cannot drift apart. */
export function fieldSurface(state: FieldState) {
  switch (state) {
    case 'focused':
      return { backgroundColor: colors.surfaceElevated, borderColor: colors.borderStrong };
    case 'error':
      return { backgroundColor: colors.surfaceSecondary, borderColor: colors.danger };
    case 'filled':
      return { backgroundColor: colors.surfaceSecondary, borderColor: colors.borderMedium };
    default:
      return { backgroundColor: colors.surfaceSecondary, borderColor: colors.borderSubtle };
  }
}

export interface FieldChromeProps {
  label?: string;
  helperText?: string;
  /** Error text is always rendered with an icon — never only a red border. */
  errorText?: string;
  disabled?: boolean;
}

/** Label above, control in the middle, helper or error below. */
export function FieldFrame({
  label,
  helperText,
  errorText,
  state,
  children,
}: FieldChromeProps & { state: FieldState; children: ReactNode }) {
  return (
    <View style={{ gap: space[8] }}>
      {label ? (
        <AppText variant="labelMD" tone={state === 'disabled' ? 'disabled' : 'secondary'}>
          {label}
        </AppText>
      ) : null}
      {children}
      {errorText ? (
        <InlineError message={errorText} />
      ) : helperText ? (
        <AppText variant="bodySM" tone="secondary">
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}

export const fieldShape = {
  minHeight: 52,
  borderRadius: radius.sm,
  borderWidth: 1,
  paddingHorizontal: space[16],
  flexDirection: 'row',
  alignItems: 'center',
  gap: space[12],
} as const;

export function resolveFieldState(options: {
  disabled?: boolean;
  errorText?: string;
  focused: boolean;
  filled: boolean;
}): FieldState {
  if (options.disabled) return 'disabled';
  if (options.errorText) return 'error';
  if (options.focused) return 'focused';
  return options.filled ? 'filled' : 'idle';
}
