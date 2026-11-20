import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeamSpaceView } from './TeamSpaceView';
import { setTeamRepository } from './teamRepository';
import { MockTeamRepository } from './MockTeamRepository';
import { UserProfile } from './types';

describe('TeamSpaceView', () => {
  let mockRepo: MockTeamRepository;

  const leadUser: UserProfile = {
    id: 'sarah-chen-uid',
    name: 'Sarah Chen',
    email: 'sarah@vido.app',
  };

  const memberUser: UserProfile = {
    id: 'demo-user-uid',
    name: 'Demo User',
    email: 'demo@vido.app',
  };

  beforeEach(() => {
    localStorage.clear();
    mockRepo = new MockTeamRepository();
    setTeamRepository(mockRepo);
  });

  it('loads team details, milestones, and initial tasks', async () => {
    render(<TeamSpaceView teamId="team-alpha-launch" currentUser={leadUser} />);

    expect(screen.getByText(/loading team workspace/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /alpha launch/i })).toBeInTheDocument();
      expect(screen.getByText(/team lead/i)).toBeInTheDocument();
      expect(screen.getByText(/phased milestone roadmap/i)).toBeInTheDocument();
      expect(screen.getByText(/team tasks & deliverables/i)).toBeInTheDocument();
    });

    // Check preloaded tasks from MockTeamRepository
    expect(screen.getByText(/design google oauth identity flow/i)).toBeInTheDocument();
    expect(screen.getByText(/build team space dashboard and milestone roadmap/i)).toBeInTheDocument();
  });

  it('filters tasks by "Assigned to Me"', async () => {
    render(<TeamSpaceView teamId="team-alpha-launch" currentUser={memberUser} />);

    await waitFor(() => {
      expect(screen.getByText(/build team space dashboard and milestone roadmap/i)).toBeInTheDocument();
    });

    // Click "Assigned to Me"
    const assignedToMeBtn = screen.getByRole('button', { name: /assigned to me/i });
    fireEvent.click(assignedToMeBtn);

    // Member (demo-user-uid) is assigned to 'Build Team Space dashboard and milestone roadmap'
    expect(screen.getByText(/build team space dashboard and milestone roadmap/i)).toBeInTheDocument();
    // 'Design Google OAuth identity flow' is assigned to Sarah Chen, so it should not appear
    expect(screen.queryByText(/design google oauth identity flow/i)).not.toBeInTheDocument();
  });

  it('filters tasks by selecting a milestone phase', async () => {
    render(<TeamSpaceView teamId="team-alpha-launch" currentUser={leadUser} />);

    await waitFor(() => {
      expect(screen.getByText(/design google oauth identity flow/i)).toBeInTheDocument();
    });

    // Milestone 1: Phase 1: Foundation & Specs
    const phase1Card = screen.getAllByText(/phase 1: foundation & specs/i)[0].closest('[tabIndex]')!;
    fireEvent.click(phase1Card);

    // Showing filter pill
    expect(screen.getByText(/showing tasks in/i)).toBeInTheDocument();
    expect(screen.getByText(/design google oauth identity flow/i)).toBeInTheDocument();

    // Clear filter
    const clearBtn = screen.getByRole('button', { name: /clear filter/i });
    fireEvent.click(clearBtn);

    expect(screen.queryByText(/showing tasks in/i)).not.toBeInTheDocument();
  });

  it('filters tasks using the search input', async () => {
    render(<TeamSpaceView teamId="team-alpha-launch" currentUser={leadUser} />);

    await waitFor(() => {
      expect(screen.getByText(/design google oauth identity flow/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search team tasks/i);
    fireEvent.change(searchInput, { target: { value: 'Document' } });

    // Preloaded task has Document in title
    expect(screen.getByText(/document team invitations and testing workflow/i)).toBeInTheDocument();
    expect(screen.queryByText(/design google oauth identity flow/i)).not.toBeInTheDocument();
  });

  it('hides create task and invite actions for non-lead members', async () => {
    render(<TeamSpaceView teamId="team-alpha-launch" currentUser={memberUser} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /alpha launch/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/^member$/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /invite member/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create task/i })).not.toBeInTheDocument();
  });
});
