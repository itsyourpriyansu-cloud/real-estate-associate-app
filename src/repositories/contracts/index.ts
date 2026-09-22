import type { AdminRepository } from './AdminRepository';
import type { ConversationRepository } from './ConversationRepository';
import type { LeadRepository } from './LeadRepository';
import type { NotificationRepository } from './NotificationRepository';
import type { PlotRepository } from './PlotRepository';
import type { ProjectRepository } from './ProjectRepository';
import type { SalesRepository } from './SalesRepository';
import type { SummaryRepository } from './SummaryRepository';
import type { TaskRepository } from './TaskRepository';
import type { TeamRepository } from './TeamRepository';
import type { UserRepository } from './UserRepository';
import type { VisitRepository } from './VisitRepository';

export * from './AdminRepository';
export * from './ConversationRepository';
export * from './LeadRepository';
export * from './NotificationRepository';
export * from './PlotRepository';
export * from './ProjectRepository';
export * from './SalesRepository';
export * from './SummaryRepository';
export * from './TaskRepository';
export * from './TeamRepository';
export * from './UserRepository';
export * from './VisitRepository';
export * from './errors';

/** The full set the app composes. Swapping mock → API means providing another `Repositories`. */
export interface Repositories {
  admin: AdminRepository;
  leads: LeadRepository;
  projects: ProjectRepository;
  plots: PlotRepository;
  tasks: TaskRepository;
  visits: VisitRepository;
  conversations: ConversationRepository;
  notifications: NotificationRepository;
  users: UserRepository;
  summary: SummaryRepository;
  team: TeamRepository;
  sales: SalesRepository;
}
