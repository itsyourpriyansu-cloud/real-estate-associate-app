import type { AddTeamMemberInput, TeamMember } from '@/domain';

/** Maps to /api/v1/team/*. The team is the signed-in associate's downline (`User.sponsorId` chain). */
export interface TeamRepository {
  /** GET /team/members — direct members first, then deeper levels; each carries its `level`. */
  listMyTeam(): Promise<TeamMember[]>;
  /** GET /team/members/{id} — null when the user is not in the caller's downline. */
  getMember(id: string): Promise<TeamMember | null>;
  /**
   * POST /team/members — adds a member under the caller (or under a member of the caller's
   * downline via `sponsorId`). Rejects with INVALID_INPUT for a duplicate phone number or a
   * sponsor outside the downline.
   */
  addMember(input: AddTeamMemberInput): Promise<TeamMember>;
}
