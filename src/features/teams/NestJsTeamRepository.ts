import {
  Team,
  TeamInvitation,
  TeamMilestone,
  TeamTask,
  UserProfile,
  MilestoneStatus,
} from './types';
import { TeamRepository } from './teamRepository';
import { getFirebaseInstance } from '../auth/firebase';

export class NestJsTeamRepository implements TeamRepository {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async getHeaders(): Promise<HeadersInit> {
    const { auth } = getFirebaseInstance();
    let token = '';

    if (auth?.currentUser) {
      try {
        token = await auth.currentUser.getIdToken();
      } catch {
        // Fallback
      }
    }

    if (!token) {
      token = 'dev-token-demo-user-uid:demo@vido.app';
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  async getTeams(_userId: string): Promise<Team[]> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.baseUrl}/api/teams`, { headers });
    if (!res.ok) {
      throw new Error(`Failed to load teams: ${res.statusText}`);
    }
    const data = await res.json();
    return data.map((t: any) => ({
      ...t,
      createdAt: typeof t.createdAt === 'string' ? t.createdAt : new Date(t.createdAt).toISOString(),
    }));
  }

  async getTeam(teamId: string): Promise<Team | null> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.baseUrl}/api/teams/${teamId}`, { headers });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`Failed to load team: ${res.statusText}`);
    }
    const t = await res.json();
    return {
      ...t,
      createdAt: typeof t.createdAt === 'string' ? t.createdAt : new Date(t.createdAt).toISOString(),
    };
  }

  async createTeam(
    name: string,
    description: string,
    _lead: UserProfile
  ): Promise<Team> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.baseUrl}/api/teams`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name, description }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create team');
    }
    const created = await res.json();
    return {
      ...created,
      createdAt: typeof created.createdAt === 'string' ? created.createdAt : new Date(created.createdAt).toISOString(),
    };
  }

  async removeMember(_teamId: string, _memberId: string): Promise<void> {
    // Optional member removal
  }

  async getInvitations(_userEmail: string): Promise<TeamInvitation[]> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.baseUrl}/api/invitations/pending`, { headers });
    if (!res.ok) {
      throw new Error(`Failed to load invitations: ${res.statusText}`);
    }
    return res.json();
  }

  async sendInvitation(
    teamId: string,
    _teamName: string,
    _inviter: UserProfile,
    inviteeEmail: string
  ): Promise<TeamInvitation> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.baseUrl}/api/teams/${teamId}/invitations`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ inviteeEmail }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to send invitation');
    }
    return res.json();
  }

  async respondToInvitation(
    invitationId: string,
    accept: boolean,
    _user: UserProfile
  ): Promise<void> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.baseUrl}/api/invitations/${invitationId}/respond`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ accept }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to respond to invitation');
    }
  }

  async getMilestones(teamId: string): Promise<TeamMilestone[]> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.baseUrl}/api/teams/${teamId}/milestones`, { headers });
    if (!res.ok) {
      throw new Error(`Failed to load milestones: ${res.statusText}`);
    }
    return res.json();
  }

  async createMilestone(
    teamId: string,
    title: string,
    targetDate: string,
    orderIndex: number
  ): Promise<TeamMilestone> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.baseUrl}/api/teams/${teamId}/milestones`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ title, targetDate, orderIndex }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create milestone');
    }
    return res.json();
  }

  async updateMilestoneStatus(
    milestoneId: string,
    status: MilestoneStatus
  ): Promise<TeamMilestone> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.baseUrl}/api/milestones/${milestoneId}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update milestone status');
    }
    return res.json();
  }

  async getTeamTasks(teamId: string): Promise<TeamTask[]> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.baseUrl}/api/teams/${teamId}/tasks`, { headers });
    if (!res.ok) {
      throw new Error(`Failed to load tasks: ${res.statusText}`);
    }
    const data = await res.json();
    return data.map((task: any) => ({
      ...task,
      createdAt: typeof task.createdAt === 'string' ? task.createdAt : new Date(task.createdAt).toISOString(),
      completedAt: task.completedAt ? (typeof task.completedAt === 'string' ? task.completedAt : new Date(task.completedAt).toISOString()) : undefined,
      checkpoints: (task.checkpoints || []).map((cp: any) => ({
        ...cp,
        timestamp: typeof cp.timestamp === 'string' ? cp.timestamp : new Date(cp.timestamp).toISOString(),
      })),
    }));
  }

  async createTeamTask(
    task: Omit<TeamTask, 'id' | 'createdAt' | 'checkpoints'>
  ): Promise<TeamTask> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.baseUrl}/api/teams/${task.teamId}/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        deadline: task.deadline,
        priority: task.priority,
        milestoneId: task.milestoneId,
        assignee: {
          userId: task.assigneeId,
          name: task.assigneeName,
          email: task.assigneeEmail,
        },
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create task');
    }
    const created = await res.json();
    return {
      ...created,
      createdAt: typeof created.createdAt === 'string' ? created.createdAt : new Date(created.createdAt).toISOString(),
      checkpoints: created.checkpoints || [],
    };
  }

  async updateTeamTaskProgress(
    taskId: string,
    progress: number,
    note?: string,
    _user?: UserProfile
  ): Promise<TeamTask> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.baseUrl}/api/tasks/${taskId}/progress`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ progress, checkpointNote: note }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update task progress');
    }
    const updated = await res.json();
    return {
      ...updated,
      createdAt: typeof updated.createdAt === 'string' ? updated.createdAt : new Date(updated.createdAt).toISOString(),
      checkpoints: (updated.checkpoints || []).map((cp: any) => ({
        ...cp,
        timestamp: typeof cp.timestamp === 'string' ? cp.timestamp : new Date(cp.timestamp).toISOString(),
      })),
    };
  }

  async reassignTeamTask(
    _taskId: string,
    _assignee: { id?: string; name?: string; email?: string }
  ): Promise<TeamTask> {
    throw new Error('Task reassignment is not supported yet');
  }

  subscribeToInvitations(
    userEmail: string,
    onUpdate: (invites: TeamInvitation[]) => void
  ): () => void {
    const refresh = () => {
      this.getInvitations(userEmail)
        .then(onUpdate)
        .catch(() => {});
    };

    // Immediate initial fetch
    refresh();

    if (typeof EventSource === 'undefined') {
      return () => {};
    }

    try {
      const sse = new EventSource(`${this.baseUrl}/api/events/stream`);

      sse.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (
            payload.type === 'invitation.created' ||
            payload.type === 'invitation.responded' ||
            payload.type === 'team.created'
          ) {
            refresh();
          }
        } catch {
          // Ignore parse errors
        }
      };

      return () => {
        sse.close();
      };
    } catch {
      return () => {};
    }
  }
}
