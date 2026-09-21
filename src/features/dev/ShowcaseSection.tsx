import type { ReactNode } from 'react';
import { View } from 'react-native';

import { AppText, Divider } from '@/components/primitives';
import { space } from '@/design-system';

/** Section wrapper for the gallery: a small title, a one-line note, then the specimens. */
export function ShowcaseSection({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <View style={{ gap: space[16] }}>
      <Divider />
      <View style={{ gap: space[4] }}>
        <AppText variant="headingMD" header>
          {title}
        </AppText>
        {note ? (
          <AppText variant="bodySM" tone="secondary">
            {note}
          </AppText>
        ) : null}
      </View>
      {children}
    </View>
  );
}

/** A labelled specimen. */
export function Specimen({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ gap: space[8] }}>
      <AppText variant="labelSM" tone="tertiary" uppercase>
        {label}
      </AppText>
      {children}
    </View>
  );
}
