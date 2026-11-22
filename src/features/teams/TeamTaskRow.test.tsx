import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeamTaskRow } from './TeamTaskRow';
import { TeamTask, TeamMilestone, UserProfile } from './types';

describe('TeamTaskRow', () => {
  const leadUser: UserProfile = {
    id: 'lead-1',
    name: 'Sarah Lead',
    email: 'sarah@vido.app',
  };

  const assignedMember: UserProfile = {
    id: 'member-1',
    name: 'Marcus Vance',
    email: 'marcus@vido.app',
  };

  const otherMember: UserProfile = {
    id: 'member-2',
    name: 'Elena Rostova',
    email: 'elena@vido.app',
  };

  const mockMilestone: TeamMilestone = {
    id: 'm-1',
    teamId: 'team-1',
    title: 'Phase 1: Architecture',
    targetDate: '2026-11-20',
    status: 'active',
    orderIndex: 0,
    createdAt: '2026-11-01T00:00:00Z',
  };

  const mockTask: TeamTask = {
    id: 'task-1',
    teamId: 'team-1',
    milestoneId: 'm-1',
    title: 'Design high-scale schema',
    description: 'PostgreSQL relational tables and RLS security',
    deadline: '2026-11-25',
    priority: 'high',
    status: 'active',
    progress: 25,
    assigneeId: 'member-1',
    assigneeName: 'Marcus Vance',
    assigneeEmail: 'marcus@vido.app',
    leadId: 'lead-1',
    checkpoints: [
      {
        id: 'cp-1',
        authorId: 'member-1',
        authorName: 'Marcus Vance',
        timestamp: '2026-11-10T12:00:00Z',
        progress: 25,
        note: 'Completed initial ER diagram and schema spec',
      },
    ],
    createdAt: '2026-11-01T00:00:00Z',
  };

  it('renders task info, milestone badge, priority badge, and progress bar', () => {
    render(
      <TeamTaskRow
        task={mockTask}
        milestone={mockMilestone}
        currentUser={assignedMember}
        isLead={false}
      />
    );

    expect(screen.getByText('Design high-scale schema')).toBeInTheDocument();
    expect(screen.getByText('Phase 1: Architecture')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Marcus Vance')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('allows assigned member to update progress and log checkpoints', async () => {
    const handleUpdateProgress = vi.fn().mockResolvedValue(undefined);

    render(
      <TeamTaskRow
        task={mockTask}
        milestone={mockMilestone}
        currentUser={assignedMember}
        isLead={false}
        onUpdateProgress={handleUpdateProgress}
      />
    );

    // Expand details
    const expandBtn = screen.getByRole('button', { name: /expand task details/i });
    fireEvent.click(expandBtn);

    expect(screen.getByText(/update deliverable progress/i)).toBeInTheDocument();
    expect(screen.getByText('Completed initial ER diagram and schema spec')).toBeInTheDocument();

    // Click 50%
    const fiftyPercentBtn = screen.getByRole('button', { name: /^50%/i });
    fireEvent.click(fiftyPercentBtn);

    await waitFor(() => {
      expect(handleUpdateProgress).toHaveBeenCalledWith('task-1', 50, undefined);
    });

    // Log checkpoint note
    const noteInput = screen.getByPlaceholderText(/record a checkpoint update note/i);
    const logBtn = screen.getByRole('button', { name: /log checkpoint/i });

    fireEvent.change(noteInput, { target: { value: 'Drafted migration scripts' } });
    fireEvent.click(logBtn);

    await waitFor(() => {
      expect(handleUpdateProgress).toHaveBeenCalledWith('task-1', 50, 'Drafted migration scripts');
    });
  });

  it('allows team lead to update progress regardless of assignment', async () => {
    const handleUpdateProgress = vi.fn().mockResolvedValue(undefined);

    render(
      <TeamTaskRow
        task={mockTask}
        milestone={mockMilestone}
        currentUser={leadUser}
        isLead={true}
        onUpdateProgress={handleUpdateProgress}
      />
    );

    // Expand details
    const expandBtn = screen.getByRole('button', { name: /expand task details/i });
    fireEvent.click(expandBtn);

    expect(screen.getByText(/update deliverable progress/i)).toBeInTheDocument();
    expect(screen.queryByText(/read-only: only assignee or lead can modify/i)).not.toBeInTheDocument();

    const completeBtn = screen.getByRole('button', { name: /100% ✓ complete/i });
    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(handleUpdateProgress).toHaveBeenCalledWith('task-1', 100, undefined);
    });
  });

  it('restricts progress controls for non-assigned team members (read-only enforcement)', () => {
    render(
      <TeamTaskRow
        task={mockTask}
        milestone={mockMilestone}
        currentUser={otherMember}
        isLead={false}
      />
    );

    // Expand details
    const expandBtn = screen.getByRole('button', { name: /expand task details/i });
    fireEvent.click(expandBtn);

    expect(screen.getByText(/read-only: only assignee or lead can modify/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^50%/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /log checkpoint/i })).not.toBeInTheDocument();
  });
});
