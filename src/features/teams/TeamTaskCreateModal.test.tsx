import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeamTaskCreateModal } from './TeamTaskCreateModal';
import { setTeamRepository } from './teamRepository';
import { MockTeamRepository } from './MockTeamRepository';
import { TeamMember, TeamMilestone } from './types';

describe('TeamTaskCreateModal', () => {
  let mockRepo: MockTeamRepository;

  const mockMembers: TeamMember[] = [
    {
      userId: 'user-lead',
      name: 'Sarah Lead',
      email: 'sarah@vido.app',
      role: 'lead',
      joinedAt: '2026-11-01T00:00:00Z',
    },
    {
      userId: 'user-member-1',
      name: 'Alex Developer',
      email: 'alex@vido.app',
      role: 'member',
      joinedAt: '2026-11-05T00:00:00Z',
    },
  ];

  const mockMilestones: TeamMilestone[] = [
    {
      id: 'm-phase-1',
      teamId: 'team-1',
      title: 'Foundation Architecture',
      targetDate: '2026-11-20',
      status: 'active',
      orderIndex: 0,
      createdAt: '2026-11-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    localStorage.clear();
    mockRepo = new MockTeamRepository();
    setTeamRepository(mockRepo);
  });

  it('renders nothing when closed', () => {
    render(
      <TeamTaskCreateModal
        isOpen={false}
        onClose={vi.fn()}
        teamId="team-1"
        leadId="user-lead"
        members={mockMembers}
        milestones={mockMilestones}
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders all fields when open', () => {
    render(
      <TeamTaskCreateModal
        isOpen={true}
        onClose={vi.fn()}
        teamId="team-1"
        leadId="user-lead"
        members={mockMembers}
        milestones={mockMilestones}
      />
    );

    expect(screen.getByRole('heading', { name: /create team task/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/task title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/target deadline/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/associated milestone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/assign deliverable to/i)).toBeInTheDocument();
  });

  it('creates task and invokes callbacks upon submission', async () => {
    const handleCreated = vi.fn();
    const handleClose = vi.fn();

    render(
      <TeamTaskCreateModal
        isOpen={true}
        onClose={handleClose}
        teamId="team-1"
        leadId="user-lead"
        members={mockMembers}
        milestones={mockMilestones}
        onTaskCreated={handleCreated}
      />
    );

    fireEvent.change(screen.getByLabelText(/task title/i), {
      target: { value: 'Implement WebSocket Sync' },
    });
    fireEvent.change(screen.getByLabelText(/associated milestone/i), {
      target: { value: 'm-phase-1' },
    });
    fireEvent.change(screen.getByLabelText(/assign deliverable to/i), {
      target: { value: 'user-member-1' },
    });

    const submitBtn = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Implement WebSocket Sync',
          milestoneId: 'm-phase-1',
          assigneeId: 'user-member-1',
          assigneeName: 'Alex Developer',
          assigneeEmail: 'alex@vido.app',
        })
      );
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
