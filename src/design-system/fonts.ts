// Import each weight from its own subpath. The package root re-exports all 18 Inter files
// (every weight and italic, ~6 MB) and Metro cannot tree-shake assets, so a barrel import would
// bundle fonts the app never uses. Only the three weights in `fontFamily` are shipped.
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';

import { fontFamily } from './typography';

/**
 * Font assets for expo-font's `useFonts`. Kept out of typography.ts so token consumers (and tests)
 * never pull font binaries. Keys must equal the `fontFamily` token values.
 */
export const interFontAssets = {
  [fontFamily.regular]: Inter_400Regular,
  [fontFamily.medium]: Inter_500Medium,
  [fontFamily.semibold]: Inter_600SemiBold,
};
