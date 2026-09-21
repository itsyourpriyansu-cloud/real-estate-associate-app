import { View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { colors, radius, space } from '@/design-system';

import { AppText } from './AppText';

const SIZES = { sm: 32, md: 40, lg: 64 } as const;

export interface BrandMarkProps {
  size?: keyof typeof SIZES;
}

/**
 * The Vara mark: a charcoal rounded tile carrying a "V" whose right stroke is the brand green.
 * Drawn as vector so it is crisp at every size. The same artwork is exported as the app icon.
 */
export function BrandMark({ size = 'md' }: BrandMarkProps) {
  const dimension = SIZES[size];
  return (
    <View aria-hidden style={{ width: dimension, height: dimension }}>
      <Svg width={dimension} height={dimension} viewBox="0 0 48 48">
        <Rect width="48" height="48" rx="14" fill={colors.surfaceInverse} />
        <Path
          d="M13.5 14.5 L24 33"
          stroke={colors.textOnInverse}
          strokeWidth="4.2"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M24 33 L34.5 14.5"
          stroke={colors.brand}
          strokeWidth="4.2"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

export interface WordmarkProps {
  size?: keyof typeof SIZES;
  /** Light text for placement on a charcoal surface. */
  onInverse?: boolean;
}

/** The mark with "Vara" and "Real Estates" beside it. Announced once, as the company name. */
export function Wordmark({ size = 'md', onInverse }: WordmarkProps) {
  const large = size === 'lg';
  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel="Vara Real Estates"
      style={{ flexDirection: 'row', alignItems: 'center', gap: large ? space[16] : space[12] }}
    >
      <BrandMark size={size} />
      <View style={{ gap: space[2], borderRadius: radius.xs }}>
        <AppText
          variant={large ? 'displayMedium' : 'headingMD'}
          tone={onInverse ? 'onInverse' : 'primary'}
        >
          Vara
        </AppText>
        <AppText variant="labelSM" tone={onInverse ? 'onInverseMuted' : 'secondary'} uppercase>
          Real Estates
        </AppText>
      </View>
    </View>
  );
}
