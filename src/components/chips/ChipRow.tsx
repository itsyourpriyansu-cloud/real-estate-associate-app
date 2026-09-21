import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { layout, space } from '@/design-system';

/**
 * A horizontally scrolling row of chips that bleeds to the screen edges (so chips can slide under
 * the gutter) while the first chip still lines up with the page content.
 */
export function ChipRow({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -layout.screenPaddingX, flexGrow: 0 }}
      contentContainerStyle={{
        gap: space[8],
        paddingHorizontal: layout.screenPaddingX,
        paddingVertical: space[4],
      }}
    >
      {children}
    </ScrollView>
  );
}

/** Two-column grid (plots, tiles). Children should each take half the row minus the gap. */
export function TwoColumnGrid({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[12] }}>{children}</View>;
}
