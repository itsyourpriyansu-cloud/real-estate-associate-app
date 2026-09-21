import type { LucideIcon } from 'lucide-react-native';
import { useRef, useState, type ReactNode } from 'react';
import { Pressable, TextInput, type TextInputProps } from 'react-native';

import { colors, opacity, space, typography } from '@/design-system';

import { Icon } from '../primitives/Icon';
import {
  FieldFrame,
  fieldShape,
  fieldSurface,
  resolveFieldState,
  type FieldChromeProps,
} from './FieldFrame';

export interface TextFieldProps
  extends FieldChromeProps, Omit<TextInputProps, 'style' | 'editable' | 'placeholderTextColor'> {
  leftIcon?: LucideIcon;
  /** Trailing adornment (unit, button). */
  right?: ReactNode;
  /** Leading adornment rendered instead of an icon (e.g. a country code). */
  left?: ReactNode;
}

/**
 * Text input with five states — idle, focused, filled, error, disabled. 16px text (no iOS zoom),
 * 52pt tall, the whole surface focuses the input, and errors carry an icon and text.
 */
export function TextField({
  label,
  helperText,
  errorText,
  disabled,
  leftIcon,
  left,
  right,
  value,
  onFocus,
  onBlur,
  accessibilityLabel,
  multiline,
  ...input
}: TextFieldProps) {
  const ref = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const state = resolveFieldState({ disabled, errorText, focused, filled: !!value });

  return (
    <FieldFrame label={label} helperText={helperText} errorText={errorText} state={state}>
      <Pressable
        onPress={() => ref.current?.focus()}
        disabled={disabled}
        accessible={false}
        style={[
          fieldShape,
          fieldSurface(state),
          multiline
            ? { alignItems: 'flex-start', paddingVertical: space[12], minHeight: 104 }
            : null,
          disabled ? { opacity: opacity.disabled } : null,
        ]}
      >
        {left}
        {leftIcon ? (
          <Icon icon={leftIcon} size="lg" tone={focused ? 'primary' : 'secondary'} />
        ) : null}
        <TextInput
          {...input}
          ref={ref}
          value={value}
          multiline={multiline}
          editable={!disabled}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityState={{ disabled: !!disabled }}
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.brand}
          cursorColor={colors.brandStrong}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[
            typography.bodyLG,
            {
              flex: 1,
              color: colors.textPrimary,
              paddingVertical: 0,
              outlineWidth: 0,
              outlineColor: colors.transparent,
              minHeight: 24,
            },
            multiline ? { textAlignVertical: 'top', minHeight: 72 } : null,
          ]}
        />
        {right}
      </Pressable>
    </FieldFrame>
  );
}
