import type { LucideIcon } from 'lucide-react-native';

import { IconContainer } from '../primitives/IconContainer';
import { ListRow } from './ListRow';

/** A navigational or command row: icon · label · chevron. Used in menus, profile and sheets. */
export function ActionRow({
  label,
  description,
  icon,
  onPress,
  chevron = true,
  destructive,
}: {
  label: string;
  description?: string;
  icon?: LucideIcon;
  onPress: () => void;
  chevron?: boolean;
  destructive?: boolean;
}) {
  return (
    <ListRow
      title={label}
      subtitle={description}
      leading={
        icon ? (
          <IconContainer icon={icon} size="sm" tone={destructive ? 'danger' : 'neutral'} />
        ) : undefined
      }
      chevron={chevron}
      onPress={onPress}
      destructive={destructive}
    />
  );
}
