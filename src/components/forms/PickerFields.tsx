import { format } from 'date-fns';
import { CalendarDays, Check, ChevronDown, Clock } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { colors, opacity } from '@/design-system';
import { useNow } from '@/hooks/useNow';
import { haptics } from '@/services/haptics';
import { formatDayLabel, nextDays } from '@/utils/format';

import { BottomSheet } from '../feedback/BottomSheet';
import { Icon } from '../primitives/Icon';
import { AppText } from '../primitives/AppText';
import { Divider } from '../primitives/Layout';
import { ListRow } from '../lists/ListRow';
import {
  FieldFrame,
  fieldShape,
  fieldSurface,
  resolveFieldState,
  type FieldChromeProps,
} from './FieldFrame';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

export interface SelectFieldProps<T extends string> extends FieldChromeProps {
  options: SelectOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  placeholder?: string;
  /** Sheet title. Defaults to the field label. */
  sheetTitle?: string;
  leftIcon?: typeof CalendarDays;
}

/** A field that opens a bottom sheet of choices. Short contextual choices live in sheets (spec §17.8). */
export function SelectField<T extends string>({
  label,
  helperText,
  errorText,
  disabled,
  options,
  value,
  onChange,
  placeholder = 'Select',
  sheetTitle,
  leftIcon,
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  const state = resolveFieldState({ disabled, errorText, focused: open, filled: !!selected });

  return (
    <FieldFrame label={label} helperText={helperText} errorText={errorText} state={state}>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label ?? 'Select'}, ${selected?.label ?? placeholder}`}
        accessibilityState={{ disabled: !!disabled, expanded: open }}
        style={[fieldShape, fieldSurface(state), disabled ? { opacity: opacity.disabled } : null]}
      >
        {leftIcon ? <Icon icon={leftIcon} size="lg" tone="secondary" /> : null}
        <AppText
          variant="bodyLG"
          tone={selected ? 'primary' : 'tertiary'}
          style={{ flex: 1 }}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </AppText>
        <Icon icon={ChevronDown} size="lg" tone="secondary" />
      </Pressable>
      <BottomSheet visible={open} onClose={() => setOpen(false)} title={sheetTitle ?? label}>
        <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
          {options.map((option, index) => (
            <View key={option.value}>
              {index > 0 ? <Divider /> : null}
              <ListRow
                title={option.label}
                subtitle={option.description}
                trailing={
                  option.value === value ? (
                    <Icon icon={Check} size="lg" color={colors.inkPrimary} />
                  ) : undefined
                }
                accessibilityLabel={
                  option.value === value ? `${option.label}, selected` : option.label
                }
                onPress={() => {
                  haptics.selection();
                  onChange(option.value);
                  setOpen(false);
                }}
              />
            </View>
          ))}
        </ScrollView>
      </BottomSheet>
    </FieldFrame>
  );
}

/** Pick one of the next 14 days. Days come from the Clock, so demo mode always offers "Today". */
export function DateField({
  value,
  onChange,
  now: nowProp,
  ...rest
}: FieldChromeProps & {
  /** Selected day (any time on it). */
  value?: Date;
  onChange: (day: Date) => void;
  now?: Date;
  placeholder?: string;
}) {
  const clockNow = useNow();
  const now = nowProp ?? clockNow;
  const days = useMemo(() => nextDays(now, 14), [now]);
  const options = days.map((day) => ({
    value: day.toISOString(),
    label: `${formatDayLabel(day, now)} · ${format(day, 'EEE d MMM')}`,
  }));
  const selected = value
    ? days.find((day) => format(day, 'yyyy-MM-dd') === format(value, 'yyyy-MM-dd'))
    : undefined;
  return (
    <SelectField
      label="Date"
      placeholder="Choose a day"
      {...rest}
      leftIcon={CalendarDays}
      options={options}
      value={selected?.toISOString()}
      onChange={(iso) => onChange(new Date(iso))}
    />
  );
}

const TIME_SLOTS = Array.from({ length: 21 }, (_, index) => {
  const minutes = 9 * 60 + index * 30; // 09:00 – 19:00
  const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
  const mm = String(minutes % 60).padStart(2, '0');
  const date = new Date(2000, 0, 1, Math.floor(minutes / 60), minutes % 60);
  return { value: `${hh}:${mm}`, label: format(date, 'h:mm a') };
});

/** Pick a half-hour slot between 9:00 AM and 7:00 PM. Value is "HH:mm". */
export function TimeField({
  value,
  onChange,
  ...rest
}: FieldChromeProps & { value?: string; onChange: (hhmm: string) => void; placeholder?: string }) {
  return (
    <SelectField
      label="Time"
      placeholder="Choose a time"
      {...rest}
      leftIcon={Clock}
      options={TIME_SLOTS}
      value={value}
      onChange={onChange}
    />
  );
}
