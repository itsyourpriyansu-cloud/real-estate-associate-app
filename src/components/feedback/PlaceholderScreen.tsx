import { Link, useRouter, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { space } from '@/design-system';

import { Button } from '../buttons/Button';
import { DetailHeader } from '../navigation/Headers';
import { AppText } from '../primitives/AppText';
import { ScreenLayout } from '../patterns/ScreenLayout';

interface PlaceholderScreenProps {
  title: string;
  /** The route pattern this file serves, shown so reviewers can see the tree is wired. */
  route: string;
  /** What the real screen will do and which stage builds it. */
  description: string;
  /** Show a back header (pushed screens). Tab and root screens omit it. */
  back?: boolean;
  children?: ReactNode;
}

/**
 * Stand-in for a route whose real screen is built in a later stage. It now sits on the real design
 * system (ScreenLayout, DetailHeader, Button) so unbuilt screens already look like the product;
 * each usage is replaced by its owning stage.
 */
export function PlaceholderScreen({
  title,
  route,
  description,
  back,
  children,
}: PlaceholderScreenProps) {
  const router = useRouter();
  return (
    <ScreenLayout
      edges={back ? ['top', 'bottom'] : ['top']}
      header={back ? <DetailHeader title={title} onBack={() => router.back()} /> : undefined}
    >
      <View style={{ gap: space[8] }}>
        <AppText variant="labelSM" tone="secondary" uppercase>
          Coming in a later stage
        </AppText>
        {back ? null : (
          <AppText variant="headingXL" header>
            {title}
          </AppText>
        )}
        <AppText variant="labelMD" tone="tertiary">
          {route}
        </AppText>
        <AppText tone="secondary" style={{ marginTop: space[8] }}>
          {description}
        </AppText>
      </View>
      {children ? <View style={{ gap: space[8] }}>{children}</View> : null}
    </ScreenLayout>
  );
}

export function PlaceholderLink({ href, label }: { href: Href; label: string }) {
  return (
    <Link href={href} asChild>
      <Button label={label} variant="secondary" size="medium" fullWidth />
    </Link>
  );
}

export function PlaceholderAction({ label, onPress }: { label: string; onPress: () => void }) {
  return <Button label={label} variant="secondary" size="medium" fullWidth onPress={onPress} />;
}
