import { Redirect } from 'expo-router';

import { DesignSystemGallery } from '@/features/dev/DesignSystemGallery';

/** Development-only route. Redirects home in any build where `__DEV__` is false. */
export default function DesignSystemRoute() {
  if (!__DEV__) return <Redirect href="/" />;
  return <DesignSystemGallery />;
}
