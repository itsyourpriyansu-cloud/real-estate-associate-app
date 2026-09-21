import { PlaceholderScreen } from '@/components/feedback';

/** Dashboard 5 · TEAM SALES. */
export default function TeamSalesScreen() {
  return (
    <PlaceholderScreen
      back
      title="Team Sales"
      route="/team-sales"
      description="Team performance and targets. Reads SalesRepository.listTeam and getTargets. Built in Stage E."
    />
  );
}
