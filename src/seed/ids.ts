/** Deterministic, human-readable ids. The single place seed ids are minted. */

export const ASSOCIATE_ID = 'usr_raghunath';
export const TEAM_LEAD_ID = 'usr_meenakshi';
export const ASSOCIATE_NAME = 'K. V. Raghunath Reddy';
export const ADMIN_ID = 'usr_admin_priya';

export type ProjectKey = 'rr' | 'ag' | 'nc' | 'ce';

export const PROJECT_ID: Record<ProjectKey, string> = {
  rr: 'prj_real_rise',
  ag: 'prj_aurelia_greens',
  nc: 'prj_northgate_county',
  ce: 'prj_cedar_enclave',
};

const pad = (n: number, width = 3) => String(n).padStart(width, '0');

export const leadId = (n: number) => `lead_${pad(n)}`;
export const memberId = (n: number) => `usr_member_${pad(n)}`;
export const saleId = (n: number) => `sale_${pad(n)}`;
export const salesTargetId = (n: number) => `target_${pad(n)}`;
export const incentiveId = (n: number) => `incentive_${pad(n)}`;
export const plotId = (key: ProjectKey, n: number) => `plot_${key}_${pad(n)}`;
export const taskId = (n: number) => `task_${pad(n)}`;
export const visitId = (n: number) => `visit_${pad(n)}`;
export const conversationId = (n: number) => `conv_${pad(n)}`;
export const messageId = (conversation: number, n: number) => `msg_${pad(conversation)}_${pad(n)}`;
export const notificationId = (n: number) => `notif_${pad(n)}`;
export const timelineId = (n: number) => `tl_${pad(n)}`;
