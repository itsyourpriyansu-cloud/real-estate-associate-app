import { Bell, ChevronLeft, Search } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { colors, layout, space } from '@/design-system';

import { Button } from '../buttons/Button';
import { IconButton } from '../buttons/IconButton';
import { SearchField } from '../forms/SpecialFields';
import { AppText } from '../primitives/AppText';
import { Avatar } from '../primitives/Avatar';
import { PressableScale } from '../primitives/PressableScale';

const bar = {
  minHeight: layout.headerHeight,
  paddingHorizontal: layout.screenPaddingX,
  flexDirection: 'row',
  alignItems: 'center',
  gap: space[8],
} as const;

/** Compact title bar for tab and list screens. */
export function StandardHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <View style={[bar, { justifyContent: 'space-between' }]}>
      <AppText variant="headingMD" header numberOfLines={1} style={{ flex: 1 }}>
        {title}
      </AppText>
      <View style={{ flexDirection: 'row', gap: space[4] }}>{right}</View>
    </View>
  );
}

/** A big, confident page title with an optional supporting line — used at the top of tab screens. */
export function LargeTitleHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <View
      style={{
        paddingHorizontal: layout.screenPaddingX,
        paddingTop: space[8],
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: space[12],
      }}
    >
      <View style={{ flex: 1, gap: space[4] }}>
        <AppText variant="headingXL" header numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText tone="secondary" numberOfLines={2}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <View style={{ flexDirection: 'row', gap: space[4] }}>{right}</View>
    </View>
  );
}

/** Back · title · actions, for pushed detail screens. */
export function DetailHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title?: string;
  subtitle?: string;
  onBack: () => void;
  right?: ReactNode;
}) {
  return (
    <View style={[bar, { paddingHorizontal: space[8] }]}>
      <IconButton icon={ChevronLeft} accessibilityLabel="Back" onPress={onBack} haptic="none" />
      <View style={{ flex: 1, alignItems: 'center' }}>
        {title ? (
          <AppText variant="headingSM" header numberOfLines={1}>
            {title}
          </AppText>
        ) : null}
        {subtitle ? (
          <AppText variant="caption" tone="secondary" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {/* Balances the back button so the title stays optically centred. */}
      <View
        style={{ minWidth: layout.minTapTarget, flexDirection: 'row', justifyContent: 'flex-end' }}
      >
        {right}
      </View>
    </View>
  );
}

/** Search field with a Cancel action. Debounce is the caller's responsibility. */
export function SearchHeader({
  value,
  onChangeText,
  onCancel,
  placeholder = 'Search leads, projects, plots',
}: {
  value: string;
  onChangeText: (text: string) => void;
  onCancel: () => void;
  placeholder?: string;
}) {
  return (
    <View style={[bar, { gap: space[8] }]}>
      <View style={{ flex: 1 }}>
        <SearchField
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          autoFocus
        />
      </View>
      <Button label="Cancel" variant="tertiary" size="medium" onPress={onCancel} />
    </View>
  );
}

/**
 * The Home header: greeting and name on the left; search, notifications and the profile avatar on
 * the right. Search and notifications are header actions, never tabs (spec §7).
 */
export function HomeHeader({
  greeting,
  name,
  fullName,
  unreadCount,
  onSearch,
  onNotifications,
  onProfile,
}: {
  greeting: string;
  name: string;
  fullName: string;
  unreadCount?: number;
  onSearch: () => void;
  onNotifications: () => void;
  onProfile: () => void;
}) {
  return (
    <View style={[bar, { minHeight: 64, justifyContent: 'space-between' }]}>
      <View style={{ flex: 1 }}>
        <AppText variant="labelSM" tone="secondary" uppercase>
          {greeting}
        </AppText>
        <AppText variant="headingXL" header numberOfLines={1}>
          {name}
        </AppText>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
        <IconButton icon={Search} accessibilityLabel="Search" onPress={onSearch} />
        <IconButton
          icon={Bell}
          accessibilityLabel="Notifications"
          badgeCount={unreadCount}
          onPress={onNotifications}
        />
        <PressableScale
          onPress={onProfile}
          haptic="light"
          accessibilityLabel={`Profile, ${fullName}`}
          style={{
            width: layout.minTapTarget,
            height: layout.minTapTarget,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          pressedStyle={{ backgroundColor: colors.transparent }}
        >
          <Avatar name={fullName} size="md" />
        </PressableScale>
      </View>
    </View>
  );
}
