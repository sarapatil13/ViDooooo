import { describe, it, expect, beforeEach } from 'vitest';
import { MockTeamRepository } from './MockTeamRepository';

describe('MockTeamRepository', () => {
  let repo: MockTeamRepository;

  beforeEach(() => {
    localStorage.clear();
    repo = new MockTeamRepository();
  });

  it('loads default mock teams and filters by user ID', async () => {
    const teams = await repo.getTeams('demo-user-uid');
    expect(teams.length).toBeGreaterThan(0);
    expect(teams[0].name).toBe('Alpha Launch');
  });

  it('creates a new team and assigns creator as lead', async () => {
    const newTeam = await repo.createTeam('Sprint Team', 'Sprint project', {
      id: 'custom-user-1',
      email: 'custom@vido.app',
      name: 'Custom User',
    });

    expect(newTeam.name).toBe('Sprint Team');
    expect(newTeam.leadId).toBe('custom-user-1');
    expect(newTeam.members).toHaveLength(1);
    expect(newTeam.members[0].role).toBe('lead');

    const userTeams = await repo.getTeams('custom-user-1');
    expect(userTeams).toHaveLength(1);
    expect(userTeams[0].id).toBe(newTeam.id);
  });

  it('sends an invitation and retrieves it for the invitee email', async () => {
    const invite = await repo.sendInvitation(
      'team-alpha-launch',
      'Alpha Launch',
      { id: 'sarah-chen-uid', email: 'sarah@vido.app', name: 'Sarah Chen' },
      'newhire@vido.app'
    );

    expect(invite.status).toBe('pending');
    expect(invite.inviteeEmail).toBe('newhire@vido.app');

    const pending = await repo.getInvitations('newhire@vido.app');
    expect(pending.some((i) => i.id === invite.id)).toBe(true);
  });

  it('prevents sending duplicate invitations to the same email', async () => {
    await repo.sendInvitation(
      'team-alpha-launch',
      'Alpha Launch',
      { id: 'sarah-chen-uid', email: 'sarah@vido.app', name: 'Sarah Chen' },
      'duplicate@vido.app'
    );

    await expect(
      repo.sendInvitation(
        'team-alpha-launch',
        'Alpha Launch',
        { id: 'sarah-chen-uid', email: 'sarah@vido.app', name: 'Sarah Chen' },
        'duplicate@vido.app'
      )
    ).rejects.toThrow(/already been sent/);
  });

  it('adds user as team member upon accepting invitation', async () => {
    const invite = await repo.sendInvitation(
      'team-alpha-launch',
      'Alpha Launch',
      { id: 'sarah-chen-uid', email: 'sarah@vido.app', name: 'Sarah Chen' },
      'joiner@vido.app'
    );

    await repo.respondToInvitation(invite.id, true, {
      id: 'joiner-uid',
      email: 'joiner@vido.app',
      name: 'Joiner Person',
    });

    const team = await repo.getTeam('team-alpha-launch');
    expect(team?.members.some((m) => m.userId === 'joiner-uid')).toBe(true);

    const pendingAfter = await repo.getInvitations('joiner@vido.app');
    expect(pendingAfter.some((i) => i.id === invite.id)).toBe(false);
  });

  it('creates milestones and updates milestone status', async () => {
    const ms = await repo.createMilestone(
      'team-alpha-launch',
      'Phase 4: Optimization',
      '2026-12-25',
      4
    );

    expect(ms.title).toBe('Phase 4: Optimization');
    expect(ms.status).toBe('upcoming');

    const updated = await repo.updateMilestoneStatus(ms.id, 'active');
    expect(updated.status).toBe('active');
  });

  it('creates team tasks, updates progress, and adds checkpoints', async () => {
    const task = await repo.createTeamTask({
      teamId: 'team-alpha-launch',
      milestoneId: 'milestone-phase-2',
      title: 'Implement WebSocket tests',
      deadline: '2026-11-29T18:00:00Z',
      priority: 'high',
      status: 'active',
      progress: 0,
      assigneeId: 'demo-user-uid',
      assigneeName: 'Demo User',
      assigneeEmail: 'demo@vido.app',
      leadId: 'sarah-chen-uid',
    });

    expect(task.title).toBe('Implement WebSocket tests');

    const updated = await repo.updateTeamTaskProgress(
      task.id,
      100,
      'All tests passing cleanly',
      { id: 'demo-user-uid', email: 'demo@vido.app', name: 'Demo User' }
    );

    expect(updated.progress).toBe(100);
    expect(updated.status).toBe('completed');
    expect(updated.checkpoints).toHaveLength(1);
    expect(updated.checkpoints[0].note).toBe('All tests passing cleanly');
  });
});
