import { Building2 } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/primitives/AppText';
import { Icon } from '@/components/primitives/Icon';
import { PROTOTYPE_BADGE_LABEL, APP_NAME } from '@/constants/prototype';
import { colors, radius, space } from '@/design-system';

/** Product mark: a white tile with a building glyph, and the name. Deliberately quiet. */
export function Wordmark({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const tile = size === 'lg' ? 56 : 36;
  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel={APP_NAME}
      style={{ flexDirection: 'row', alignItems: 'center', gap: space[12] }}
    >
      <View
        style={{
          width: tile,
          height: tile,
          borderRadius: size === 'lg' ? radius.md : radius.sm,
          backgroundColor: colors.whitePrimary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon icon={Building2} size={size === 'lg' ? 'hero' : 'xl'} color={colors.textInverse} />
      </View>
      <AppText variant={size === 'lg' ? 'displayMedium' : 'headingMD'}>{APP_NAME}</AppText>
    </View>
  );
}

/** Centred wordmark on the page background, for the moment between launch and the first screen. */
export function SplashView() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.backgroundPrimary,
        gap: space[12],
      }}
    >
      <Wordmark size="lg" />
      <AppText variant="labelSM" tone="secondary" uppercase>
        {PROTOTYPE_BADGE_LABEL}
      </AppText>
    </View>
  );
}

/** Discreet prototype notice shown on auth screens. Says what this is; claims nothing about security. */
export function PrototypeNotice({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingHorizontal: space[12],
        paddingVertical: space[8],
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
      }}
    >
      <AppText variant="labelMD" tone="secondary">
        {children}
      </AppText>
    </View>
  );
}
