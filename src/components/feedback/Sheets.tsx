import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { space } from '@/design-system';

import { Button } from '../buttons/Button';
import { ActionRow } from '../lists/ActionRow';
import { AppText } from '../primitives/AppText';
import { Divider } from '../primitives/Layout';
import { BottomSheet } from './BottomSheet';

export interface SheetAction {
  key: string;
  label: string;
  icon?: LucideIcon;
  onPress: () => void;
  destructive?: boolean;
}

/** A short list of contextual actions ("Share project", "Call customer"). Closes after a choice. */
export function ActionSheet({
  visible,
  onClose,
  title,
  actions,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  actions: SheetAction[];
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      <View>
        {actions.map((action, index) => (
          <View key={action.key}>
            {index > 0 ? <Divider /> : null}
            <ActionRow
              label={action.label}
              icon={action.icon}
              destructive={action.destructive}
              chevron={false}
              onPress={() => {
                onClose();
                action.onPress();
              }}
            />
          </View>
        ))}
      </View>
    </BottomSheet>
  );
}

/** Destructive or irreversible actions require an explicit confirmation (spec §17.4). */
export function ConfirmationSheet({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  loading,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      <View style={{ gap: space[20] }}>
        {message ? <AppText tone="secondary">{message}</AppText> : null}
        <View style={{ gap: space[8] }}>
          <Button
            label={confirmLabel}
            variant={destructive ? 'danger' : 'primary'}
            onPress={onConfirm}
            loading={loading}
            fullWidth
            haptic={destructive ? 'warning' : 'medium'}
          />
          <Button
            label={cancelLabel}
            variant="tertiary"
            onPress={onClose}
            disabled={loading}
            fullWidth
          />
        </View>
      </View>
    </BottomSheet>
  );
}
