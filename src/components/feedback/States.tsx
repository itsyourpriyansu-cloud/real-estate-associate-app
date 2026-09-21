import { AlertCircle, RefreshCw, WifiOff, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { space, layout } from '@/design-system';
import { isRepositoryError } from '@/repositories/contracts';

import { Button } from '../buttons/Button';
import { AppText } from '../primitives/AppText';
import { Icon } from '../primitives/Icon';
import { IconContainer } from '../primitives/IconContainer';
import { Row } from '../primitives/Layout';
import { Surface } from '../primitives/Surface';

/** Inline, field- or section-level error: an icon AND text, never a red border alone. */
export function InlineError({ message }: { message: string }) {
  return (
    <Row gap={6} accessible accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Icon icon={AlertCircle} size="sm" tone="danger" />
      <AppText variant="bodySM" tone="danger" style={{ flexShrink: 1 }}>
        {message}
      </AppText>
    </Row>
  );
}

/** Human, specific empty state. Say what is missing and what to do — never "No data found". */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View
      style={{
        alignItems: 'center',
        paddingVertical: space[40],
        paddingHorizontal: space[24],
        gap: space[12],
      }}
    >
      <IconContainer icon={icon} size="lg" />
      <AppText variant="headingMD" style={{ textAlign: 'center' }} header>
        {title}
      </AppText>
      {description ? (
        <AppText tone="secondary" style={{ textAlign: 'center', maxWidth: 320 }}>
          {description}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <View style={{ marginTop: space[8] }}>
          <Button label={actionLabel} onPress={onAction} variant="secondary" size="medium" />
        </View>
      ) : null}
    </View>
  );
}

/** Persistent banner when the device is offline. Data already on the device stays usable. */
export function OfflineBanner({ onRetry }: { onRetry?: () => void }) {
  return (
    <Surface padding={12} rounded="sm" accessibilityRole="alert">
      <Row gap={12} justify="space-between">
        <Row gap={12} style={{ flex: 1 }}>
          <Icon icon={WifiOff} size="lg" tone="warning" />
          <View style={{ flex: 1 }}>
            <AppText variant="labelLG">You’re offline</AppText>
            <AppText variant="bodySM" tone="secondary">
              Previously loaded prototype data is available.
            </AppText>
          </View>
        </Row>
        {onRetry ? (
          <Button label="Retry" variant="tertiary" size="small" onPress={onRetry} />
        ) : null}
      </Row>
    </Surface>
  );
}

/** Copy for a repository failure. `RepositoryError.message` is for logs and is never shown. */
export function describeRepositoryError(error: unknown, subject: string) {
  if (isRepositoryError(error) && error.code === 'OFFLINE') {
    return {
      offline: true,
      title: 'You’re offline',
      message: 'Previously loaded prototype data is available.',
    };
  }
  if (isRepositoryError(error) && error.code === 'NOT_FOUND') {
    return {
      offline: false,
      title: `Couldn’t find ${subject}`,
      message: 'It may have been removed.',
    };
  }
  return {
    offline: false,
    title: `Couldn’t load ${subject}`,
    message: 'Your prototype data is still safe.',
  };
}

/**
 * Recoverable failure state: what happened, reassurance, and a way forward. `compact` renders an
 * inline strip for a section that failed while the rest of the page loaded (partial failure).
 */
export function RepositoryErrorState({
  error,
  subject,
  onRetry,
  compact,
}: {
  error: unknown;
  /** What was being loaded, in lower case: "your leads", "this project". */
  subject: string;
  onRetry?: () => void;
  compact?: boolean;
}) {
  const { offline, title, message } = describeRepositoryError(error, subject);

  if (compact) {
    return (
      <Surface padding={12} rounded="sm" accessibilityRole="alert">
        <Row gap={12} justify="space-between">
          <Row gap={12} style={{ flex: 1 }}>
            <Icon
              icon={offline ? WifiOff : AlertCircle}
              size="lg"
              tone={offline ? 'warning' : 'danger'}
            />
            <AppText variant="labelLG" style={{ flexShrink: 1 }}>
              {title}
            </AppText>
          </Row>
          {onRetry ? (
            <Button label="Try again" variant="tertiary" size="small" onPress={onRetry} />
          ) : null}
        </Row>
      </Surface>
    );
  }

  return (
    <View
      accessibilityRole="alert"
      style={{
        alignItems: 'center',
        paddingVertical: space[40],
        paddingHorizontal: layout.screenPaddingX,
        gap: space[12],
      }}
    >
      <IconContainer
        icon={offline ? WifiOff : AlertCircle}
        size="lg"
        tone={offline ? 'warning' : 'danger'}
      />
      <AppText variant="headingMD" header style={{ textAlign: 'center' }}>
        {title}
      </AppText>
      <AppText tone="secondary" style={{ textAlign: 'center', maxWidth: 320 }}>
        {message}
      </AppText>
      {onRetry ? (
        <View style={{ marginTop: space[8] }}>
          <Button
            label="Try again"
            icon={RefreshCw}
            variant="secondary"
            size="medium"
            onPress={onRetry}
          />
        </View>
      ) : null}
    </View>
  );
}
