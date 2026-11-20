import { TeamRepository } from './teamRepository';
import {
  Team,
  TeamInvitation,
  TeamMilestone,
  TeamTask,
  UserProfile,
  MilestoneStatus,
} from './types';

const TEAMS_KEY = 'vido_mock_teams_data';
const INVITES_KEY = 'vido_mock_invites_data';
const MILESTONES_KEY = 'vido_mock_milestones_data';
const TASKS_KEY = 'vido_mock_team_tasks_data';

export const INITIAL_MOCK_TEAMS: Team[] = [
  {
    id: 'team-alpha-launch',
    name: 'Alpha Launch',
    description: 'Delivering the next-generation task workspace for high-focus teams',
    leadId: 'sarah-chen-uid',
    leadEmail: 'sarah@vido.app',
    createdAt: '2026-11-01T09:00:00Z',
    members: [
      {
        userId: 'sarah-chen-uid',
        email: 'sarah@vido.app',
        name: 'Sarah Chen',
        role: 'lead',
        joinedAt: '2026-11-01T09:00:00Z',
      },
      {
        userId: 'demo-user-uid',
        email: 'demo@vido.app',
        name: 'Demo User',
        role: 'member',
        joinedAt: '2026-11-02T10:00:00Z',
      },
      {
        userId: 'marcus-vance-uid',
        email: 'marcus@vido.app',
        name: 'Marcus Vance',
        role: 'member',
        joinedAt: '2026-11-05T14:30:00Z',
      },
    ],
  },
];

export const INITIAL_MOCK_MILESTONES: TeamMilestone[] = [
  {
    id: 'milestone-phase-1',
    teamId: 'team-alpha-launch',
    title: 'Phase 1: Foundation & Specs',
    targetDate: '2026-11-15',
    status: 'completed',
    orderIndex: 1,
    createdAt: '2026-11-01T09:30:00Z',
  },
  {
    id: 'milestone-phase-2',
    teamId: 'team-alpha-launch',
    title: 'Phase 2: Core Build & Collaboration',
    targetDate: '2026-11-30',
    status: 'active',
    orderIndex: 2,
    createdAt: '2026-11-01T09:35:00Z',
  },
  {
    id: 'milestone-phase-3',
    teamId: 'team-alpha-launch',
    title: 'Phase 3: Public Release',
    targetDate: '2026-12-15',
    status: 'upcoming',
    orderIndex: 3,
    createdAt: '2026-11-01T09:40:00Z',
  },
];

export const INITIAL_MOCK_TASKS: TeamTask[] = [
  {
    id: 'task-auth-architecture',
    teamId: 'team-alpha-launch',
    milestoneId: 'milestone-phase-1',
    title: 'Design Google OAuth identity flow',
    description: 'Ensure token storage complies with minimal privilege principles',
    deadline: '2026-11-15T18:00:00Z',
    priority: 'high',
    status: 'completed',
    progress: 100,
    assigneeId: 'sarah-chen-uid',
    assigneeName: 'Sarah Chen',
    assigneeEmail: 'sarah@vido.app',
    leadId: 'sarah-chen-uid',
    checkpoints: [
      {
        id: 'cp-1',
        authorId: 'sarah-chen-uid',
        authorName: 'Sarah Chen',
        timestamp: '2026-11-15T17:30:00Z',
        progress: 100,
        note: 'Completed architecture review and security invariants',
      },
    ],
    createdAt: '2026-11-02T10:00:00Z',
    completedAt: '2026-11-15T17:30:00Z',
  },
  {
    id: 'task-team-ui',
    teamId: 'team-alpha-launch',
    milestoneId: 'milestone-phase-2',
    title: 'Build Team Space dashboard and milestone roadmap',
    description: 'Render shared views with lead assignment and progress updating',
    deadline: '2026-11-28T18:00:00Z',
    priority: 'high',
    status: 'active',
    progress: 60,
    assigneeId: 'demo-user-uid',
    assigneeName: 'Demo User',
    assigneeEmail: 'demo@vido.app',
    leadId: 'sarah-chen-uid',
    checkpoints: [
      {
        id: 'cp-2',
        authorId: 'demo-user-uid',
        authorName: 'Demo User',
        timestamp: '2026-11-18T12:00:00Z',
        progress: 60,
        note: 'Completed MockTeamRepository and notification bell component',
      },
    ],
    createdAt: '2026-11-16T09:00:00Z',
  },
  {
    id: 'task-docs',
    teamId: 'team-alpha-launch',
    milestoneId: 'milestone-phase-2',
    title: 'Document team invitations and testing workflow',
    description: 'Provide quickstart guidance in project README',
    deadline: '2026-11-30T18:00:00Z',
    priority: 'medium',
    status: 'active',
    progress: 0,
    assigneeId: 'marcus-vance-uid',
    assigneeName: 'Marcus Vance',
    assigneeEmail: 'marcus@vido.app',
    leadId: 'sarah-chen-uid',
    checkpoints: [],
    createdAt: '2026-11-17T11:00:00Z',
  },
];

export const INITIAL_MOCK_INVITES: TeamInvitation[] = [
  {
    id: 'invite-sample-1',
    teamId: 'team-alpha-launch',
    teamName: 'Alpha Launch',
    inviterId: 'sarah-chen-uid',
    inviterName: 'Sarah Chen',
    inviterEmail: 'sarah@vido.app',
    inviteeEmail: 'alex@vido.app',
    status: 'pending',
    createdAt: '2026-11-18T10:00:00Z',
  },
];

type InviteListener = (invites: TeamInvitation[]) => void;

export class MockTeamRepository implements TeamRepository {
  private listeners: Set<InviteListener> = new Set();

  constructor() {
    this.initDevSync();
  }

  private initDevSync(): void {
    if (typeof window === 'undefined') return;
    if (import.meta.env?.MODE === 'test') return;

    // 1. Listen to storage event across same-profile tabs
    try {
      window.addEventListener('storage', (e) => {
        if (e.key === INVITES_KEY) {
          this.notifyListeners();
        }
      });
    } catch {
      // ignore
    }

    // 2. Connect to local Vite dev server SSE if running
    if (typeof EventSource !== 'undefined') {
      try {
        const sse = new EventSource('/api/local-dev-teams/stream');
        sse.onmessage = (event) => {
          try {
            const remote = JSON.parse(event.data);
            if (remote.teams) this.saveLocalOnly(TEAMS_KEY, remote.teams);
            if (remote.invitations) this.saveLocalOnly(INVITES_KEY, remote.invitations);
            if (remote.milestones) this.saveLocalOnly(MILESTONES_KEY, remote.milestones);
            if (remote.tasks) this.saveLocalOnly(TASKS_KEY, remote.tasks);
            this.notifyListeners();
          } catch {
            // ignore
          }
        };
        sse.onerror = () => {
          // Dev server SSE endpoint not active (e.g. test runner or static preview)
          // Seamlessly keeps local storage fallback
        };
      } catch {
        // ignore
      }
    }

    // 3. Initial fetch from local dev server (vital for Incognito windows on first open)
    if (typeof fetch !== 'undefined') {
      fetch('/api/local-dev-teams')
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((remote) => {
          if (remote) {
            if (remote.teams) this.saveLocalOnly(TEAMS_KEY, remote.teams);
            if (remote.invitations) this.saveLocalOnly(INVITES_KEY, remote.invitations);
            if (remote.milestones) this.saveLocalOnly(MILESTONES_KEY, remote.milestones);
            if (remote.tasks) this.saveLocalOnly(TASKS_KEY, remote.tasks);
            this.notifyListeners();
          }
        })
        .catch(() => {
          // Ignore
        });
    }
  }

  private saveLocalOnly<T>(key: string, data: T): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch {
      // Ignore
    }
  }

  private load<T>(key: string, defaultData: T): T {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = localStorage.getItem(key);
        if (item) {
          return JSON.parse(item);
        }
      }
    } catch {
      // Fallback
    }
    return defaultData;
  }

  private save<T>(key: string, data: T): void {
    this.saveLocalOnly(key, data);

    // Broadcast update to Vite dev server so all incognito and other browser windows update!
    if (
      typeof window !== 'undefined' &&
      typeof fetch !== 'undefined' &&
      import.meta.env?.MODE !== 'test'
    ) {
      const payload: Record<string, any> = {};
      if (key === TEAMS_KEY) payload.teams = data;
      if (key === INVITES_KEY) payload.invitations = data;
      if (key === MILESTONES_KEY) payload.milestones = data;
      if (key === TASKS_KEY) payload.tasks = data;

      fetch('/api/local-dev-teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {
        // Ignore in test environment
      });
    }
  }

  public resetToDefaults(): void {
    this.save(TEAMS_KEY, INITIAL_MOCK_TEAMS);
    this.save(INVITES_KEY, INITIAL_MOCK_INVITES);
    this.save(MILESTONES_KEY, INITIAL_MOCK_MILESTONES);
    this.save(TASKS_KEY, INITIAL_MOCK_TASKS);
    this.notifyListeners();
  }

  private notifyListeners(): void {
    const invites = this.load<TeamInvitation[]>(INVITES_KEY, INITIAL_MOCK_INVITES);
    this.listeners.forEach((listener) => listener(invites));
  }

  async getTeams(userId: string): Promise<Team[]> {
    const teams = this.load<Team[]>(TEAMS_KEY, INITIAL_MOCK_TEAMS);
    return teams.filter(
      (t) => t.leadId === userId || t.members.some((m) => m.userId === userId)
    );
  }

  async getTeam(teamId: string): Promise<Team | null> {
    const teams = this.load<Team[]>(TEAMS_KEY, INITIAL_MOCK_TEAMS);
    return teams.find((t) => t.id === teamId) || null;
  }

  async createTeam(
    name: string,
    description: string,
    lead: UserProfile
  ): Promise<Team> {
    const teams = this.load<Team[]>(TEAMS_KEY, INITIAL_MOCK_TEAMS);
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      leadId: lead.id,
      leadEmail: lead.email,
      createdAt: new Date().toISOString(),
      members: [
        {
          userId: lead.id,
          email: lead.email,
          name: lead.name,
          avatarUrl: lead.avatarUrl,
          role: 'lead',
          joinedAt: new Date().toISOString(),
        },
      ],
    };
    const updated = [...teams, newTeam];
    this.save(TEAMS_KEY, updated);
    return newTeam;
  }

  async removeMember(teamId: string, memberId: string): Promise<void> {
    const teams = this.load<Team[]>(TEAMS_KEY, INITIAL_MOCK_TEAMS);
    const updated = teams.map((team) => {
      if (team.id === teamId) {
        return {
          ...team,
          members: team.members.filter((m) => m.userId !== memberId),
        };
      }
      return team;
    });
    this.save(TEAMS_KEY, updated);
  }

  async getInvitations(userEmail: string): Promise<TeamInvitation[]> {
    const cleanEmail = userEmail.trim().toLowerCase();
    const invites = this.load<TeamInvitation[]>(INVITES_KEY, INITIAL_MOCK_INVITES);
    return invites.filter(
      (inv) =>
        inv.inviteeEmail.trim().toLowerCase() === cleanEmail &&
        inv.status === 'pending'
    );
  }

  async sendInvitation(
    teamId: string,
    teamName: string,
    inviter: UserProfile,
    inviteeEmail: string
  ): Promise<TeamInvitation> {
    const cleanEmail = inviteeEmail.trim().toLowerCase();
    const invites = this.load<TeamInvitation[]>(INVITES_KEY, INITIAL_MOCK_INVITES);

    // Check if already invited
    const existing = invites.find(
      (inv) =>
        inv.teamId === teamId &&
        inv.inviteeEmail.trim().toLowerCase() === cleanEmail &&
        inv.status === 'pending'
    );
    if (existing) {
      throw new Error(`An invitation has already been sent to ${cleanEmail}`);
    }

    // Check if already a member
    const team = await this.getTeam(teamId);
    if (team?.members.some((m) => m.email.trim().toLowerCase() === cleanEmail)) {
      throw new Error(`${cleanEmail} is already a member of this team`);
    }

    const newInvite: TeamInvitation = {
      id: `invite-${Date.now()}`,
      teamId,
      teamName,
      inviterId: inviter.id,
      inviterName: inviter.name,
      inviterEmail: inviter.email,
      inviteeEmail: cleanEmail,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const updated = [...invites, newInvite];
    this.save(INVITES_KEY, updated);
    this.notifyListeners();
    return newInvite;
  }

  async respondToInvitation(
    invitationId: string,
    accept: boolean,
    user: UserProfile
  ): Promise<void> {
    const invites = this.load<TeamInvitation[]>(INVITES_KEY, INITIAL_MOCK_INVITES);
    const targetInvite = invites.find((inv) => inv.id === invitationId);
    if (!targetInvite) {
      throw new Error('Invitation not found');
    }

    const updatedInvites: TeamInvitation[] = invites.map((inv) =>
      inv.id === invitationId
        ? { ...inv, status: accept ? 'accepted' : 'rejected' }
        : inv
    );
    this.save(INVITES_KEY, updatedInvites);

    if (accept) {
      const teams = this.load<Team[]>(TEAMS_KEY, INITIAL_MOCK_TEAMS);
      const updatedTeams = teams.map((team) => {
        if (team.id === targetInvite.teamId) {
          const alreadyMember = team.members.some((m) => m.userId === user.id);
          if (!alreadyMember) {
            return {
              ...team,
              members: [
                ...team.members,
                {
                  userId: user.id,
                  email: user.email,
                  name: user.name,
                  avatarUrl: user.avatarUrl,
                  role: 'member' as const,
                  joinedAt: new Date().toISOString(),
                },
              ],
            };
          }
        }
        return team;
      });
      this.save(TEAMS_KEY, updatedTeams);
    }

    this.notifyListeners();
  }

  async getMilestones(teamId: string): Promise<TeamMilestone[]> {
    const milestones = this.load<TeamMilestone[]>(
      MILESTONES_KEY,
      INITIAL_MOCK_MILESTONES
    );
    return milestones
      .filter((m) => m.teamId === teamId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async createMilestone(
    teamId: string,
    title: string,
    targetDate: string,
    orderIndex: number
  ): Promise<TeamMilestone> {
    const milestones = this.load<TeamMilestone[]>(
      MILESTONES_KEY,
      INITIAL_MOCK_MILESTONES
    );
    const newMilestone: TeamMilestone = {
      id: `milestone-${Date.now()}`,
      teamId,
      title: title.trim(),
      targetDate,
      status: 'upcoming',
      orderIndex,
      createdAt: new Date().toISOString(),
    };
    const updated = [...milestones, newMilestone];
    this.save(MILESTONES_KEY, updated);
    return newMilestone;
  }

  async updateMilestoneStatus(
    milestoneId: string,
    status: MilestoneStatus
  ): Promise<TeamMilestone> {
    const milestones = this.load<TeamMilestone[]>(
      MILESTONES_KEY,
      INITIAL_MOCK_MILESTONES
    );
    let updatedMilestone: TeamMilestone | null = null;
    const updated = milestones.map((m) => {
      if (m.id === milestoneId) {
        updatedMilestone = { ...m, status };
        return updatedMilestone;
      }
      return m;
    });
    if (!updatedMilestone) {
      throw new Error('Milestone not found');
    }
    this.save(MILESTONES_KEY, updated);
    return updatedMilestone;
  }

  async getTeamTasks(teamId: string): Promise<TeamTask[]> {
    const tasks = this.load<TeamTask[]>(TASKS_KEY, INITIAL_MOCK_TASKS);
    return tasks.filter((t) => t.teamId === teamId);
  }

  async createTeamTask(
    task: Omit<TeamTask, 'id' | 'createdAt' | 'checkpoints'>
  ): Promise<TeamTask> {
    const tasks = this.load<TeamTask[]>(TASKS_KEY, INITIAL_MOCK_TASKS);
    const newTask: TeamTask = {
      ...task,
      id: `task-${Date.now()}`,
      checkpoints: [],
      createdAt: new Date().toISOString(),
      progress: task.progress ?? 0,
      status: task.status ?? 'active',
    };
    const updated = [...tasks, newTask];
    this.save(TASKS_KEY, updated);
    return newTask;
  }

  async updateTeamTaskProgress(
    taskId: string,
    progress: number,
    note?: string,
    user?: UserProfile
  ): Promise<TeamTask> {
    const tasks = this.load<TeamTask[]>(TASKS_KEY, INITIAL_MOCK_TASKS);
    let updatedTask: TeamTask | null = null;

    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        if (user && user.id !== t.leadId && user.id !== t.assigneeId) {
          throw new Error('Permission denied: Only the assigned member or Team Lead can update task progress');
        }
        const isComplete = progress >= 100;
        const newCheckpoints = [...t.checkpoints];
        if (note && user) {
          newCheckpoints.push({
            id: `cp-${Date.now()}`,
            authorId: user.id,
            authorName: user.name,
            timestamp: new Date().toISOString(),
            progress,
            note,
          });
        }
        updatedTask = {
          ...t,
          progress,
          status: isComplete ? 'completed' : 'active',
          completedAt: isComplete ? (t.completedAt || new Date().toISOString()) : undefined,
          checkpoints: newCheckpoints,
        };
        return updatedTask;
      }
      return t;
    });

    if (!updatedTask) {
      throw new Error('Task not found');
    }
    this.save(TASKS_KEY, updated);
    return updatedTask;
  }

  async reassignTeamTask(
    taskId: string,
    assignee: { id?: string; name?: string; email?: string }
  ): Promise<TeamTask> {
    const tasks = this.load<TeamTask[]>(TASKS_KEY, INITIAL_MOCK_TASKS);
    let updatedTask: TeamTask | null = null;

    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        updatedTask = {
          ...t,
          assigneeId: assignee.id,
          assigneeName: assignee.name,
          assigneeEmail: assignee.email,
        };
        return updatedTask;
      }
      return t;
    });

    if (!updatedTask) {
      throw new Error('Task not found');
    }
    this.save(TASKS_KEY, updated);
    return updatedTask;
  }

  subscribeToInvitations(
    userEmail: string,
    onUpdate: (invites: TeamInvitation[]) => void
  ): () => void {
    const cleanEmail = userEmail.trim().toLowerCase();
    const handler: InviteListener = (invites) => {
      const userInvites = invites.filter(
        (inv) =>
          inv.inviteeEmail.trim().toLowerCase() === cleanEmail &&
          inv.status === 'pending'
      );
      onUpdate(userInvites);
    };

    this.listeners.add(handler);
    // Initial emission
    const initialInvites = this.load<TeamInvitation[]>(
      INVITES_KEY,
      INITIAL_MOCK_INVITES
    ).filter(
      (inv) =>
        inv.inviteeEmail.trim().toLowerCase() === cleanEmail &&
        inv.status === 'pending'
    );
    onUpdate(initialInvites);

    return () => {
      this.listeners.delete(handler);
    };
  }
}
