import { Search, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { DEFAULT_COUNTRY_CODE } from '@/constants/prototype';
import { colors, hitSlop, layout, radius, space, typography } from '@/design-system';

import { AppText } from '../primitives/AppText';
import { Icon } from '../primitives/Icon';
import { fieldShape, fieldSurface, resolveFieldState, FieldFrame } from './FieldFrame';
import { TextField, type TextFieldProps } from './TextField';

/** Compact search input: icon, clear button, `search` return key. Debounce belongs to the caller. */
export function SearchField({
  value,
  onChangeText,
  placeholder = 'Search',
  autoFocus,
  onSubmitEditing,
  accessibilityLabel = 'Search',
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
  accessibilityLabel?: string;
}) {
  const ref = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const state = resolveFieldState({ focused, filled: !!value });
  return (
    <Pressable
      accessible={false}
      onPress={() => ref.current?.focus()}
      style={[
        fieldShape,
        fieldSurface(state),
        { minHeight: layout.minTapTarget, borderRadius: radius.pill },
      ]}
    >
      <Icon icon={Search} size="lg" tone="secondary" />
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        selectionColor={colors.inkPrimary}
        cursorColor={colors.inkPrimary}
        autoFocus={autoFocus}
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={onSubmitEditing}
        accessibilityLabel={accessibilityLabel}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          typography.bodyLG,
          { flex: 1, color: colors.textPrimary, paddingVertical: 0, outlineWidth: 0 },
        ]}
      />
      {value ? (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon icon={X} size="md" tone="secondary" />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

/** +91 mobile field. Digits only, capped at 10; emits the digits, never the formatted text. */
export function PhoneField({
  value,
  onChangeText,
  ...rest
}: Omit<TextFieldProps, 'value' | 'onChangeText' | 'keyboardType' | 'maxLength' | 'left'> & {
  value: string;
  onChangeText: (digits: string) => void;
}) {
  return (
    <TextField
      label="Mobile number"
      placeholder="98765 43210"
      {...rest}
      value={value}
      onChangeText={(text) => onChangeText(text.replace(/\D/g, '').slice(0, 10))}
      keyboardType="phone-pad"
      maxLength={10}
      autoComplete="tel"
      textContentType="telephoneNumber"
      left={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[12] }}>
          <AppText
            variant="labelLG"
            tone="secondary"
            accessibilityLabel="Country code plus nine one"
          >
            {DEFAULT_COUNTRY_CODE}
          </AppText>
          <View style={{ width: 1, height: 20, backgroundColor: colors.borderMedium }} />
        </View>
      }
    />
  );
}

/**
 * Six-cell one-time-code input. A single hidden TextInput receives the digits (so paste and SMS
 * autofill work); the cells only display them. The next cell to fill is highlighted.
 */
export function OTPField({
  value,
  onChange,
  length = 6,
  errorText,
  disabled,
  autoFocus,
  onComplete,
  label = 'Verification code',
}: {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  errorText?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onComplete?: (code: string) => void;
  label?: string;
}) {
  const ref = useRef<TextInput>(null);
  const [focused, setFocused] = useState(!!autoFocus);
  const state = resolveFieldState({ disabled, errorText, focused, filled: value.length > 0 });

  return (
    <FieldFrame label={label} errorText={errorText} state={state}>
      <Pressable accessible={false} onPress={() => ref.current?.focus()} disabled={disabled}>
        <View style={{ flexDirection: 'row', gap: space[8] }}>
          {Array.from({ length }, (_, index) => {
            const active = focused && index === Math.min(value.length, length - 1);
            const cellState = errorText
              ? 'error'
              : active
                ? 'focused'
                : value[index]
                  ? 'filled'
                  : 'idle';
            return (
              <View
                key={index}
                aria-hidden
                style={[
                  fieldSurface(cellState),
                  {
                    flex: 1,
                    height: 56,
                    maxWidth: 56,
                    borderRadius: radius.sm,
                    borderWidth: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
              >
                <AppText variant="metricMD">{value[index] ?? ''}</AppText>
              </View>
            );
          })}
        </View>
        <TextInput
          ref={ref}
          value={value}
          onChangeText={(text) => {
            const digits = text.replace(/\D/g, '').slice(0, length);
            onChange(digits);
            if (digits.length === length) onComplete?.(digits);
          }}
          editable={!disabled}
          autoFocus={autoFocus}
          keyboardType="number-pad"
          maxLength={length}
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          accessibilityLabel={`${label}, ${length} digits`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          caretHidden
          style={{
            position: 'absolute',
            opacity: 0,
            width: '100%',
            height: '100%',
            outlineWidth: 0,
          }}
        />
      </Pressable>
    </FieldFrame>
  );
}

/** Multi-line notes field with a character counter. */
export function TextArea({
  maxLength = 500,
  value = '',
  ...rest
}: TextFieldProps & { maxLength?: number }) {
  return (
    <TextField
      {...rest}
      value={value}
      maxLength={maxLength}
      multiline
      helperText={rest.helperText ?? `${value.length}/${maxLength}`}
    />
  );
}
