import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, View } from 'react-native';

import { colors, layout, space } from '@/design-system';

import { useDockClearance } from '../navigation/AssociateDock';
import { SafeScreen, type SafeEdge } from '../primitives/ScreenContainer';

export interface ScreenLayoutProps {
  /** A header from `components/navigation`. Owns its own horizontal padding. */
  header?: ReactNode;
  children: ReactNode;
  /** Pinned above the bottom edge (a primary action, or a ContactActionBar). */
  stickyAction?: ReactNode;
  /** Tab screens use ['top']; pushed screens use ['top', 'bottom']. */
  edges?: SafeEdge[];
  /** Set false for screens that manage their own scrolling (a chat, a virtualised list). */
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Vertical gap between direct children. Defaults to the section gap. */
  gap?: number;
  testID?: string;
}

/**
 * The template every screen uses:
 *
 *   SafeArea → Header → Scrollable content (20px gutter, section spacing) → Sticky action → (Tab bar)
 *
 * Content is capped at a readable width and centred on wide viewports; the sticky action respects
 * the bottom safe area; the keyboard pushes the layout up rather than covering inputs.
 */
export function ScreenLayout({
  header,
  children,
  stickyAction,
  edges = ['top'],
  scroll = true,
  refreshing,
  onRefresh,
  gap = layout.sectionGap,
  testID,
}: ScreenLayoutProps) {
  const dockClearance = useDockClearance();
  const body = (
    <View style={{ width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center', gap }}>
      {children}
    </View>
  );

  return (
    <SafeScreen edges={edges} testID={testID}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {header}
        {scroll ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: layout.screenPaddingX,
              paddingTop: space[16],
              paddingBottom: space[32] + dockClearance,
              flexGrow: 1,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={!!refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.textSecondary}
                  colors={[colors.textSecondary]}
                  progressBackgroundColor={colors.surfaceElevated}
                />
              ) : undefined
            }
          >
            {body}
          </ScrollView>
        ) : (
          <View style={{ flex: 1, paddingHorizontal: layout.screenPaddingX }}>{body}</View>
        )}
        {stickyAction ? (
          <View
            style={{
              paddingHorizontal: layout.screenPaddingX,
              paddingTop: space[8],
              paddingBottom: space[8],
              backgroundColor: colors.surfacePrimary,
              borderTopWidth: 1,
              borderTopColor: colors.borderSubtle,
            }}
          >
            <View style={{ width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center' }}>
              {stickyAction}
            </View>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
