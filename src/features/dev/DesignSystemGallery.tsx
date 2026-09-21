import { useRouter } from 'expo-router';

import { LoadingState } from '@/components/feedback';
import { DetailHeader } from '@/components/navigation';
import { ResourceBoundary, ScreenLayout } from '@/components/patterns';
import { AppText } from '@/components/primitives';

import { Controls } from './sections/Controls';
import { ListsAndCrm } from './sections/ListsAndCrm';
import { PropertyCommsDashboard } from './sections/PropertyCommsDashboard';
import { FeedbackAndNav } from './sections/FeedbackAndNav';
import { Foundations } from './sections/Foundations';
import { useShowcaseData } from './useShowcaseData';

/**
 * DEVELOPMENT ONLY — `/dev/design-system`. Every reusable component in every state, on real seeded
 * data read through repositories. The route is registered only when `__DEV__` is true, so it is
 * absent from production builds.
 */
export function DesignSystemGallery() {
  const router = useRouter();
  const showcase = useShowcaseData();

  return (
    <ScreenLayout
      edges={['top', 'bottom']}
      header={
        <DetailHeader
          title="Design system"
          subtitle="Development only"
          onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        />
      }
    >
      <AppText tone="secondary">
        Typography, colour, controls, lists, CRM, property, communication, dashboard and feedback
        components — every state, plus long names and very large amounts.
      </AppText>
      <Foundations />
      <Controls />
      <ResourceBoundary
        resource={showcase}
        subject="sample data"
        loading={<LoadingState variant="cards" count={2} />}
      >
        {(data) => (
          <>
            <ListsAndCrm data={data} />
            <PropertyCommsDashboard data={data} />
          </>
        )}
      </ResourceBoundary>
      <FeedbackAndNav />
    </ScreenLayout>
  );
}
