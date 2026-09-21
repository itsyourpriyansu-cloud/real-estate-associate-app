import type { ReactNode } from 'react';
import { View } from 'react-native';

import { space } from '@/design-system';

import { SectionHeader, type SectionHeaderProps } from './SectionHeader';

/** A titled page section. Sections are separated by spacing, not by boxes. */
export function Section({ children, ...header }: SectionHeaderProps & { children: ReactNode }) {
  return (
    <View style={{ gap: space[12] }}>
      <SectionHeader {...header} />
      {children}
    </View>
  );
}
