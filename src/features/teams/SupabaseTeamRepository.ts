import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TeamRepository } from './teamRepository';
import {
  Team,
  TeamInvitation,
  TeamMilestone,
  TeamTask,
  UserProfile,
  MilestoneStatus,
} from './types';

export class SupabaseTeamRepository implements TeamRepository {
  private client: SupabaseClient;

  constructor(url: string, anonKey: string) {
    this.client = createClient(url, anonKey);
  }

  async getTeams(userId: string): Promise<Team[]> {
    const { data: memberTeams, error } = await this.client
      .from('team_members')
      .select('team_id, role, joined_at, teams(*, team_members(*, users(*)))')
      .eq('user_id', userId);

    if (error || !memberTeams) {
      return [];
    }

    return memberTeams.map((entry: any) => {
      const rawTeam = entry.teams;
      return {
        id: rawTeam.id,
        name: rawTeam.name,
        description: rawTeam.description,
        leadId: rawTeam.lead_id,
        leadEmail: rawTeam.lead_email || '',
        createdAt: rawTeam.created_at,
        members: (rawTeam.team_members || []).map((m: any) => ({
          userId: m.user_id,
          email: m.users?.email || '',
          name: m.users?.name || '',
          avatarUrl: m.users?.avatar_url,
          role: m.role,
          joinedAt: m.joined_at,
        })),
      };
    });
  }

  async getTeam(teamId: string): Promise<Team | null> {
    const { data: rawTeam, error } = await this.client
      .from('teams')
      .select('*, team_members(*, users(*))')
      .eq('id', teamId)
      .single();

    if (error || !rawTeam) return null;

    return {
      id: rawTeam.id,
      name: rawTeam.name,
      description: rawTeam.description,
      leadId: rawTeam.lead_id,
      leadEmail: rawTeam.lead_email || '',
      createdAt: rawTeam.created_at,
      members: (rawTeam.team_members || []).map((m: any) => ({
        userId: m.user_id,
        email: m.users?.email || '',
        name: m.users?.name || '',
        avatarUrl: m.users?.avatar_url,
        role: m.role,
        joinedAt: m.joined_at,
      })),
    };
  }

  async createTeam(
    name: string,
    description: string,
    lead: UserProfile
  ): Promise<Team> {
    // Upsert lead in users table
    await this.client.from('users').upsert({
      id: lead.id,
      email: lead.email.trim().toLowerCase(),
      name: lead.name,
      avatar_url: lead.avatarUrl,
    });

    const { data: team, error: teamErr } = await this.client
      .from('teams')
      .insert({
        name: name.trim(),
        description: description.trim(),
        lead_id: lead.id,
      })
      .select()
      .single();

    if (teamErr || !team) {
      throw new Error(`Failed to create team: ${teamErr?.message}`);
    }

    await this.client.from('team_members').insert({
      team_id: team.id,
      user_id: lead.id,
      role: 'lead',
    });

    return {
      id: team.id,
      name: team.name,
      description: team.description,
      leadId: lead.id,
      leadEmail: lead.email,
      createdAt: team.created_at,
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
  }

  async removeMember(teamId: string, memberId: string): Promise<void> {
    await this.client
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', memberId);
  }

  async getInvitations(userEmail: string): Promise<TeamInvitation[]> {
    const cleanEmail = userEmail.trim().toLowerCase();
    const { data, error } = await this.client
      .from('team_invitations')
      .select('*')
      .eq('invitee_email', cleanEmail)
      .eq('status', 'pending');

    if (error || !data) return [];

    return data.map((inv: any) => ({
      id: inv.id,
      teamId: inv.team_id,
      teamName: inv.team_name,
      inviterId: inv.inviter_id,
      inviterName: inv.inviter_name,
      inviterEmail: inv.inviter_email,
      inviteeEmail: inv.invitee_email,
      status: inv.status,
      createdAt: inv.created_at,
    }));
  }

  async sendInvitation(
    teamId: string,
    teamName: string,
    inviter: UserProfile,
    inviteeEmail: string
  ): Promise<TeamInvitation> {
    const cleanEmail = inviteeEmail.trim().toLowerCase();

    const { data, error } = await this.client
      .from('team_invitations')
      .insert({
        team_id: teamId,
        team_name: teamName,
        inviter_id: inviter.id,
        inviter_name: inviter.name,
        inviter_email: inviter.email,
        invitee_email: cleanEmail,
        status: 'pending',
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to send invitation: ${error?.message}`);
    }

    return {
      id: data.id,
      teamId: data.team_id,
      teamName: data.team_name,
      inviterId: data.inviter_id,
      inviterName: data.inviter_name,
      inviterEmail: data.inviter_email,
      inviteeEmail: data.invitee_email,
      status: data.status,
      createdAt: data.created_at,
    };
  }

  async respondToInvitation(
    invitationId: string,
    accept: boolean,
    user: UserProfile
  ): Promise<void> {
    const { data: inv, error: invErr } = await this.client
      .from('team_invitations')
      .update({ status: accept ? 'accepted' : 'rejected' })
      .eq('id', invitationId)
      .select()
      .single();

    if (invErr || !inv) {
      throw new Error(`Failed to update invitation: ${invErr?.message}`);
    }

    if (accept) {
      // Upsert user profile
      await this.client.from('users').upsert({
        id: user.id,
        email: user.email.trim().toLowerCase(),
        name: user.name,
        avatar_url: user.avatarUrl,
      });

      // Insert team member
      await this.client.from('team_members').insert({
        team_id: inv.team_id,
        user_id: user.id,
        role: 'member',
      });
    }
  }

  async getMilestones(teamId: string): Promise<TeamMilestone[]> {
    const { data, error } = await this.client
      .from('team_milestones')
      .select('*')
      .eq('team_id', teamId)
      .order('order_index', { ascending: true });

    if (error || !data) return [];

    return data.map((m: any) => ({
      id: m.id,
      teamId: m.team_id,
      title: m.title,
      targetDate: m.target_date,
      status: m.status,
      orderIndex: m.order_index,
      createdAt: m.created_at,
    }));
  }

  async createMilestone(
    teamId: string,
    title: string,
    targetDate: string,
    orderIndex: number
  ): Promise<TeamMilestone> {
    const { data, error } = await this.client
      .from('team_milestones')
      .insert({
        team_id: teamId,
        title: title.trim(),
        target_date: targetDate,
        order_index: orderIndex,
        status: 'upcoming',
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create milestone: ${error?.message}`);
    }

    return {
      id: data.id,
      teamId: data.team_id,
      title: data.title,
      targetDate: data.target_date,
      status: data.status,
      orderIndex: data.order_index,
      createdAt: data.created_at,
    };
  }

  async updateMilestoneStatus(
    milestoneId: string,
    status: MilestoneStatus
  ): Promise<TeamMilestone> {
    const { data, error } = await this.client
      .from('team_milestones')
      .update({ status })
      .eq('id', milestoneId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update milestone: ${error?.message}`);
    }

    return {
      id: data.id,
      teamId: data.team_id,
      title: data.title,
      targetDate: data.target_date,
      status: data.status,
      orderIndex: data.order_index,
      createdAt: data.created_at,
    };
  }

  async getTeamTasks(teamId: string): Promise<TeamTask[]> {
    const { data, error } = await this.client
      .from('team_tasks')
      .select('*')
      .eq('team_id', teamId);

    if (error || !data) return [];

    return data.map((t: any) => ({
      id: t.id,
      teamId: t.team_id,
      milestoneId: t.milestone_id,
      title: t.title,
      description: t.description,
      deadline: t.deadline,
      priority: t.priority,
      status: t.status,
      progress: t.progress,
      assigneeId: t.assignee_id,
      assigneeName: t.assignee_name,
      assigneeEmail: t.assignee_email,
      leadId: t.lead_id,
      checkpoints: t.checkpoints || [],
      createdAt: t.created_at,
      completedAt: t.completed_at,
    }));
  }

  async createTeamTask(
    task: Omit<TeamTask, 'id' | 'createdAt' | 'checkpoints'>
  ): Promise<TeamTask> {
    const { data, error } = await this.client
      .from('team_tasks')
      .insert({
        team_id: task.teamId,
        milestone_id: task.milestoneId,
        title: task.title.trim(),
        description: task.description?.trim(),
        deadline: task.deadline,
        priority: task.priority,
        status: task.status || 'active',
        progress: task.progress || 0,
        assignee_id: task.assigneeId,
        assignee_name: task.assigneeName,
        assignee_email: task.assigneeEmail,
        lead_id: task.leadId,
        checkpoints: [],
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create team task: ${error?.message}`);
    }

    return {
      id: data.id,
      teamId: data.team_id,
      milestoneId: data.milestone_id,
      title: data.title,
      description: data.description,
      deadline: data.deadline,
      priority: data.priority,
      status: data.status,
      progress: data.progress,
      assigneeId: data.assignee_id,
      assigneeName: data.assignee_name,
      assigneeEmail: data.assignee_email,
      leadId: data.lead_id,
      checkpoints: data.checkpoints || [],
      createdAt: data.created_at,
    };
  }

  async updateTeamTaskProgress(
    taskId: string,
    progress: number,
    note?: string,
    user?: UserProfile
  ): Promise<TeamTask> {
    const isComplete = progress >= 100;
    const { data: existing } = await this.client
      .from('team_tasks')
      .select('checkpoints, completed_at')
      .eq('id', taskId)
      .single();

    const newCheckpoints = [...(existing?.checkpoints || [])];
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

    const { data, error } = await this.client
      .from('team_tasks')
      .update({
        progress,
        status: isComplete ? 'completed' : 'active',
        completed_at: isComplete
          ? existing?.completed_at || new Date().toISOString()
          : null,
        checkpoints: newCheckpoints,
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update task progress: ${error?.message}`);
    }

    return {
      id: data.id,
      teamId: data.team_id,
      milestoneId: data.milestone_id,
      title: data.title,
      description: data.description,
      deadline: data.deadline,
      priority: data.priority,
      status: data.status,
      progress: data.progress,
      assigneeId: data.assignee_id,
      assigneeName: data.assignee_name,
      assigneeEmail: data.assignee_email,
      leadId: data.lead_id,
      checkpoints: data.checkpoints || [],
      createdAt: data.created_at,
      completedAt: data.completed_at,
    };
  }

  async reassignTeamTask(
    taskId: string,
    assignee: { id?: string; name?: string; email?: string }
  ): Promise<TeamTask> {
    const { data, error } = await this.client
      .from('team_tasks')
      .update({
        assignee_id: assignee.id || null,
        assignee_name: assignee.name || null,
        assignee_email: assignee.email || null,
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to reassign task: ${error?.message}`);
    }

    return {
      id: data.id,
      teamId: data.team_id,
      milestoneId: data.milestone_id,
      title: data.title,
      description: data.description,
      deadline: data.deadline,
      priority: data.priority,
      status: data.status,
      progress: data.progress,
      assigneeId: data.assignee_id,
      assigneeName: data.assignee_name,
      assigneeEmail: data.assignee_email,
      leadId: data.lead_id,
      checkpoints: data.checkpoints || [],
      createdAt: data.created_at,
    };
  }

  subscribeToInvitations(
    userEmail: string,
    onUpdate: (invites: TeamInvitation[]) => void
  ): () => void {
    const cleanEmail = userEmail.trim().toLowerCase();

    // Initial fetch
    this.getInvitations(cleanEmail).then(onUpdate);

    const channel = this.client
      .channel(`invites-${cleanEmail}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_invitations',
          filter: `invitee_email=eq.${cleanEmail}`,
        },
        () => {
          this.getInvitations(cleanEmail).then(onUpdate);
        }
      )
      .subscribe();

    return () => {
      this.client.removeChannel(channel);
    };
  }
}
