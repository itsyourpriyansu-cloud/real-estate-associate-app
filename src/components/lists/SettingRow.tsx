import type { LucideIcon } from 'lucide-react-native';
import { AppText } from '../primitives/AppText';
import { IconContainer } from '../primitives/IconContainer';
import { Toggle } from '../primitives/Toggle';
import { ListRow } from './ListRow';

/** A preference row with either a switch or a read-only value (e.g. "Dark · locked"). */
export function SettingRow({
  label,
  description,
  icon,
  value,
  switchValue,
  onSwitchChange,
  onPress,
}: {
  label: string;
  description?: string;
  icon?: LucideIcon;
  /** Read-only value shown on the right when there is no switch. */
  value?: string;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
}) {
  const hasSwitch = switchValue !== undefined && onSwitchChange !== undefined;
  return (
    <ListRow
      title={label}
      subtitle={description}
      leading={icon ? <IconContainer icon={icon} size="sm" /> : undefined}
      onPress={hasSwitch ? undefined : onPress}
      chevron={!hasSwitch && !!onPress}
      trailing={
        hasSwitch ? (
          <Toggle value={switchValue} onValueChange={onSwitchChange} accessibilityLabel={label} />
        ) : value ? (
          <AppText variant="labelMD" tone="secondary">
            {value}
          </AppText>
        ) : undefined
      }
    />
  );
}
