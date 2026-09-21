import type { ReactNode } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/primitives/AppText';
import { Wordmark } from '@/components/primitives/BrandMark';
import { PROTOTYPE_BADGE_LABEL } from '@/constants/prototype';
import { colors, radius, space } from '@/design-system';

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
        borderColor: colors.borderMedium,
        backgroundColor: colors.surfacePrimary,
      }}
    >
      <AppText variant="labelMD" tone="secondary">
        {children}
      </AppText>
    </View>
  );
}
