import { AlertTriangle, CircleAlert, Info, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { radius, space, toneColors, type Tone } from '@/design-system';

import { Button } from '../../buttons/Button';
import { AppText } from '../../primitives/AppText';
import { Icon } from '../../primitives/Icon';

const toneIcon: Record<Exclude<Tone, 'success'>, LucideIcon> = {
  neutral: Info,
  info: Info,
  warning: AlertTriangle,
  danger: CircleAlert,
};

/**
 * "What needs attention today." One short line and an optional action — used at the top of Home.
 * The tone tints the icon and hairline only; the text stays primary for contrast.
 */
export function AttentionBanner({
  title,
  message,
  tone = 'warning',
  actionLabel,
  onAction,
}: {
  title: string;
  message?: string;
  tone?: Exclude<Tone, 'success'>;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const palette = toneColors[tone];
  return (
    <View
      accessibilityRole="alert"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[12],
        padding: space[16],
        borderRadius: radius.md,
        backgroundColor: palette.bg,
        borderWidth: 1,
        borderColor: palette.border,
      }}
    >
      <Icon icon={toneIcon[tone]} size="xl" color={palette.fg} />
      <View style={{ flex: 1, gap: space[2] }}>
        <AppText variant="labelLG">{title}</AppText>
        {message ? (
          <AppText variant="bodySM" tone="secondary">
            {message}
          </AppText>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          accessibilityLabel={`${actionLabel}: ${title}`}
          variant="secondary"
          size="small"
          onPress={onAction}
        />
      ) : null}
    </View>
  );
}
