import { describe, it, expect, beforeEach } from 'vitest';
import { MockTeamRepository } from './MockTeamRepository';
import { UserProfile, TeamRole } from './types';

describe('Team Coordination Lifecycle Integration', () => {
  let repo: MockTeamRepository;

  const leadUser: UserProfile = {
    id: 'lead-user-alpha',
    name: 'Sarah Connor',
    email: 'sarah@resistance.org',
  };

  const devUser: UserProfile = {
    id: 'dev-user-john',
    name: 'John Connor',
    email: 'john@resistance.org',
  };

  const strangerUser: UserProfile = {
    id: 'stranger-user-t800',
    name: 'Cyberdyne Model 101',
    email: 't800@cyberdyne.com',
  };

  beforeEach(() => {
    localStorage.clear();
    repo = new MockTeamRepository();
  });

  it('executes full end-to-end team lifecycle: creation, invite, accept, milestone, task, and lead permissions', async () => {
    // 1. Team Lead creates a team space
    const team = await repo.createTeam(
      'Mobile Launch Squad',
      'Shipping mobile clients for iOS and Android',
      leadUser
    );

    expect(team.id).toBeDefined();
    expect(team.name).toBe('Mobile Launch Squad');
    expect(team.leadId).toBe(leadUser.id);
    expect(team.members).toHaveLength(1);
    expect(team.members[0]).toMatchObject({
      userId: leadUser.id,
      email: leadUser.email,
      role: 'lead' as TeamRole,
    });

    // 2. Team Lead invites John by email
    const invitation = await repo.sendInvitation(
      team.id,
      team.name,
      leadUser,
      devUser.email
    );

    expect(invitation.id).toBeDefined();
    expect(invitation.status).toBe('pending');
    expect(invitation.inviteeEmail).toBe(devUser.email.toLowerCase());

    // Verify invitation is discoverable by John's email
    const pendingInvites = await repo.getInvitations(devUser.email);
    expect(pendingInvites).toHaveLength(1);
    expect(pendingInvites[0].id).toBe(invitation.id);

    // 3. John accepts the invitation
    await repo.respondToInvitation(invitation.id, true, devUser);

    // Verify invitation status is now accepted
    const remainingInvites = await repo.getInvitations(devUser.email);
    expect(remainingInvites).toHaveLength(0);

    // Verify John is now an active member in the team roster
    const updatedTeam = await repo.getTeam(team.id);
    expect(updatedTeam?.members).toHaveLength(2);
    expect(updatedTeam?.members.some((m) => m.userId === devUser.id && m.role === 'member')).toBe(true);

    // 4. Team Lead defines Milestone Phase 1
    const milestone1 = await repo.createMilestone(
      team.id,
      'Phase 1: Architecture & Auth',
      '2026-11-25',
      0
    );

    expect(milestone1.id).toBeDefined();
    expect(milestone1.status).toBe('upcoming');

    // Lead activates Milestone Phase 1
    const activeMilestone = await repo.updateMilestoneStatus(
      milestone1.id,
      'active'
    );
    expect(activeMilestone.status).toBe('active');

    // 5. Team Lead creates a task under Phase 1 assigned to John
    const task = await repo.createTeamTask({
      teamId: team.id,
      leadId: leadUser.id,
      milestoneId: milestone1.id,
      title: 'Configure OAuth2 and Deep Links',
      description: 'Setup Google identity callback handlers',
      deadline: '2026-11-24',
      priority: 'high',
      status: 'active',
      progress: 0,
      assigneeId: devUser.id,
      assigneeName: devUser.name,
      assigneeEmail: devUser.email,
    });

    expect(task.id).toBeDefined();
    expect(task.assigneeId).toBe(devUser.id);
    expect(task.progress).toBe(0);

    // 6. John updates deliverable progress to 50% with checkpoint note
    const inProgressTask = await repo.updateTeamTaskProgress(
      task.id,
      50,
      'Configured redirect schemes and tested Android intents',
      devUser
    );

    expect(inProgressTask.progress).toBe(50);
    expect(inProgressTask.status).toBe('active');
    expect(inProgressTask.checkpoints).toHaveLength(1);
    expect(inProgressTask.checkpoints[0]).toMatchObject({
      authorId: devUser.id,
      authorName: devUser.name,
      progress: 50,
      note: 'Configured redirect schemes and tested Android intents',
    });

    // 7. John completes the task to 100%
    const completedTask = await repo.updateTeamTaskProgress(
      task.id,
      100,
      'Production verification passed',
      devUser
    );

    expect(completedTask.progress).toBe(100);
    expect(completedTask.status).toBe('completed');
    expect(completedTask.checkpoints).toHaveLength(2);

    // 8. Stranger user attempting to update task progress throws permission error
    await expect(
      repo.updateTeamTaskProgress(task.id, 75, 'Unauthorized attempt', strangerUser)
    ).rejects.toThrow(/permission denied/i);

    // 9. Lead marks milestone as complete
    const completedMilestone = await repo.updateMilestoneStatus(
      milestone1.id,
      'completed'
    );
    expect(completedMilestone.status).toBe('completed');

    // 10. Verify team tasks listing retrieves all shared state
    const allTeamTasks = await repo.getTeamTasks(team.id);
    expect(allTeamTasks).toHaveLength(1);
    expect(allTeamTasks[0].status).toBe('completed');
    expect(allTeamTasks[0].progress).toBe(100);
  });
});
