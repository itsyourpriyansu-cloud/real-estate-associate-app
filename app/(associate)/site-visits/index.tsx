import { PlaceholderLink, PlaceholderScreen } from '@/components/feedback';

/** Dashboard 4 · SITE VISITS HISTORY. */
export default function SiteVisitsScreen() {
  return (
    <PlaceholderScreen
      back
      title="Site Visits History"
      route="/site-visits"
      description="Visit logs, details and statuses for you, with the team total. Reads VisitRepository.list({ associateIds }). Built in Stage D."
    >
      <PlaceholderLink
        href={{ pathname: '/site-visits/[visitId]', params: { visitId: 'visit_001' } }}
        label="Open a visit (route check)"
      />
    </PlaceholderScreen>
  );
}
