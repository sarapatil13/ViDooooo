import {
  Team,
  TeamInvitation,
  TeamMilestone,
  TeamTask,
  UserProfile,
  MilestoneStatus,
} from './types';
import { MockTeamRepository } from './MockTeamRepository';
import { SupabaseTeamRepository } from './SupabaseTeamRepository';
import { NestJsTeamRepository } from './NestJsTeamRepository';

export interface TeamRepository {
  getTeams(userId: string): Promise<Team[]>;
  getTeam(teamId: string): Promise<Team | null>;
  createTeam(name: string, description: string, lead: UserProfile): Promise<Team>;
  removeMember(teamId: string, memberId: string): Promise<void>;
  getInvitations(userEmail: string): Promise<TeamInvitation[]>;
  sendInvitation(
    teamId: string,
    teamName: string,
    inviter: UserProfile,
    inviteeEmail: string
  ): Promise<TeamInvitation>;
  respondToInvitation(
    invitationId: string,
    accept: boolean,
    user: UserProfile
  ): Promise<void>;
  getMilestones(teamId: string): Promise<TeamMilestone[]>;
  createMilestone(
    teamId: string,
    title: string,
    targetDate: string,
    orderIndex: number
  ): Promise<TeamMilestone>;
  updateMilestoneStatus(
    milestoneId: string,
    status: MilestoneStatus
  ): Promise<TeamMilestone>;
  getTeamTasks(teamId: string): Promise<TeamTask[]>;
  createTeamTask(
    task: Omit<TeamTask, 'id' | 'createdAt' | 'checkpoints'>
  ): Promise<TeamTask>;
  updateTeamTaskProgress(
    taskId: string,
    progress: number,
    note?: string,
    user?: UserProfile
  ): Promise<TeamTask>;
  reassignTeamTask(
    taskId: string,
    assignee: { id?: string; name?: string; email?: string }
  ): Promise<TeamTask>;
  subscribeToInvitations(
    userEmail: string,
    onUpdate: (invites: TeamInvitation[]) => void
  ): () => void;
}

let repositoryInstance: TeamRepository | null = null;

export function getTeamRepository(): TeamRepository {
  if (repositoryInstance) return repositoryInstance;

  const backendType = import.meta.env.VITE_BACKEND_TYPE;
  const apiUrl = import.meta.env.VITE_API_URL;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (backendType === 'nestjs' || apiUrl) {
    repositoryInstance = new NestJsTeamRepository(apiUrl || '');
  } else if (
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'mock' &&
    typeof supabaseUrl === 'string' &&
    supabaseUrl.startsWith('http')
  ) {
    repositoryInstance = new SupabaseTeamRepository(supabaseUrl, supabaseAnonKey);
  } else {
    repositoryInstance = new MockTeamRepository();
  }

  return repositoryInstance;
}

export function setTeamRepository(repo: TeamRepository | null): void {
  repositoryInstance = repo;
}
