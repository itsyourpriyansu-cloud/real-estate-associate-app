import * as Haptics from 'expo-haptics';

/**
 * Thin haptics wrapper. Feature code calls these semantic helpers instead of expo-haptics directly,
 * so the user preference (`preferencesStore.hapticsEnabled`) and unsupported-device failures are
 * handled in one place. Every call is fire-and-forget and can never throw into UI code.
 */
let enabled = true;

export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

function run(action: () => Promise<void>): void {
  if (!enabled) return;
  action().catch(() => undefined);
}

export const haptics = {
  /** Card / row press. */
  light: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  medium: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  /** Selection changes: chips, segments, plot tiles. */
  selection: () => run(() => Haptics.selectionAsync()),
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
