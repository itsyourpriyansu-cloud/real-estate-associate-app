import { PlaceholderScreen } from '@/components/feedback';

/** Dashboard 6 · ADD TEAM MEMBER. */
export default function AddTeamMemberScreen() {
  return (
    <PlaceholderScreen
      back
      title="Add Team Member"
      route="/team/add"
      description="Form for a new member's details (React Hook Form + Zod); creates a member under you via TeamRepository.addMember. Built in Stage E."
    />
  );
}
