import { PlaceholderLink, PlaceholderScreen } from '@/components/feedback';

/** Dashboard 7 · MY TEAM. */
export default function MyTeamScreen() {
  return (
    <PlaceholderScreen
      back
      title="My Team"
      route="/team"
      description="Details of the members in your team. Reads TeamRepository.listMyTeam. Built in Stage E."
    >
      <PlaceholderLink href="/team/add" label="Add team member" />
      <PlaceholderLink
        href={{ pathname: '/team/[memberId]', params: { memberId: 'preview' } }}
        label="Open a member (route check)"
      />
    </PlaceholderScreen>
  );
}
