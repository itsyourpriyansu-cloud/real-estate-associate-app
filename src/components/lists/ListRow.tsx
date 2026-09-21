import { ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { layout, radius, space } from '@/design-system';

import { AppText } from '../primitives/AppText';
import { Icon } from '../primitives/Icon';
import { PressableScale } from '../primitives/PressableScale';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  /** Right-aligned quiet text (a time, a count). */
  meta?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  chevron?: boolean;
  onPress?: () => void;
  titleLines?: number;
  subtitleLines?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  destructive?: boolean;
  testID?: string;
}

/**
 * The base list row: leading · title/subtitle · meta · trailing. Rows sit directly on the page and
 * are separated by hairline dividers — they are deliberately not cards. Pressable rows have a
 * 44pt+ target, a surface change on press, and no scale (a full-width row should not shrink).
 */
export function ListRow({
  title,
  subtitle,
  meta,
  leading,
  trailing,
  chevron,
  onPress,
  titleLines = 1,
  subtitleLines = 2,
  accessibilityLabel,
  accessibilityHint,
  destructive,
  testID,
}: ListRowProps) {
  const content = (
    <View
      style={{
        minHeight: layout.minTapTarget + space[12],
        paddingVertical: space[12],
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[12],
      }}
    >
      {leading}
      <View style={{ flex: 1, gap: space[2] }}>
        <AppText
          variant="labelLG"
          tone={destructive ? 'danger' : 'primary'}
          numberOfLines={titleLines}
        >
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="bodySM" tone="secondary" numberOfLines={subtitleLines}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {meta ? (
        <AppText variant="labelMD" tone="secondary">
          {meta}
        </AppText>
      ) : null}
      {trailing}
      {chevron ? <Icon icon={ChevronRight} size="lg" tone="tertiary" /> : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      scaleTo={1}
      accessibilityLabel={accessibilityLabel ?? [title, subtitle, meta].filter(Boolean).join(', ')}
      accessibilityHint={accessibilityHint}
      style={{ marginHorizontal: -space[8], paddingHorizontal: space[8], borderRadius: radius.sm }}
    >
      {content}
    </PressableScale>
  );
}
