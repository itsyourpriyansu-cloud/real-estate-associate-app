import type { AddTeamMemberInput, TeamMember } from '@/domain';

/**
 * Maps to /api/v1/team/*. The team is the signed-in user's downline (`User.reportingManagerId`
 * chain). Folds into `EmployeeRepository` in a later phase; unchanged self-service shape for now.
 */
export interface TeamRepository {
  /** GET /team/members — direct reports first, then deeper levels; each carries its `level`. */
  listMyTeam(): Promise<TeamMember[]>;
  /** GET /team/members/{id} — null when the user is not in the caller's downline. */
  getMember(id: string): Promise<TeamMember | null>;
  /**
   * POST /team/members — adds a member under the caller (or under someone in the caller's
   * downline via `reportingManagerId`). Rejects with INVALID_INPUT for a duplicate phone number,
   * a manager outside the downline, or a caller not eligible to add a member.
   */
  addMember(input: AddTeamMemberInput): Promise<TeamMember>;
  /** GET /team/me — the caller's own team name, or null when they belong to no team. */
  getMyTeamName(): Promise<string | null>;
}
