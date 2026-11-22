export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export type TeamRole = 'lead' | 'member';

export interface TeamMember {
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: TeamRole;
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  leadId: string;
  leadEmail: string;
  createdAt: string;
  members: TeamMember[];
}

export type TeamInvitationStatus = 'pending' | 'accepted' | 'rejected';

export interface TeamInvitation {
  id: string;
  teamId: string;
  teamName: string;
  inviterId: string;
  inviterName: string;
  inviterEmail: string;
  inviteeEmail: string;
  status: TeamInvitationStatus;
  createdAt: string;
}

export type MilestoneStatus = 'upcoming' | 'active' | 'completed';

export interface TeamMilestone {
  id: string;
  teamId: string;
  title: string;
  targetDate: string;
  status: MilestoneStatus;
  orderIndex: number;
  createdAt: string;
}

export type TeamTaskPriority = 'high' | 'medium' | 'low' | 'none';
export type TeamTaskStatus = 'active' | 'completed' | 'archived';

export interface TeamTaskCheckpoint {
  id: string;
  authorId: string;
  authorName: string;
  timestamp: string;
  progress: number;
  note: string;
}

export interface TeamTask {
  id: string;
  teamId: string;
  milestoneId?: string;
  title: string;
  description?: string;
  deadline: string;
  priority: TeamTaskPriority;
  status: TeamTaskStatus;
  progress: number;
  assigneeId?: string;
  assigneeName?: string;
  assigneeEmail?: string;
  leadId: string;
  checkpoints: TeamTaskCheckpoint[];
  createdAt: string;
  completedAt?: string;
}
