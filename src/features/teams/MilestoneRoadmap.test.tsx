import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeamHeader, MilestoneRoadmap } from './MilestoneRoadmap';
import { Team, TeamMilestone, UserProfile } from './types';

describe('MilestoneRoadmap & TeamHeader', () => {
  const leadUser: UserProfile = {
    id: 'lead-1',
    name: 'Sarah Lead',
    email: 'sarah@vido.app',
  };

  const memberUser: UserProfile = {
    id: 'member-2',
    name: 'Alex Member',
    email: 'alex@vido.app',
  };

  const mockTeam: Team = {
    id: 'team-1',
    name: 'Alpha Launch Project',
    description: 'Delivering the public release by Q4',
    leadId: 'lead-1',
    leadEmail: 'sarah@vido.app',
    createdAt: '2026-11-01T00:00:00Z',
    members: [
      {
        userId: 'lead-1',
        name: 'Sarah Lead',
        email: 'sarah@vido.app',
        role: 'lead',
        joinedAt: '2026-11-01T00:00:00Z',
      },
      {
        userId: 'member-2',
        name: 'Alex Member',
        email: 'alex@vido.app',
        role: 'member',
        joinedAt: '2026-11-05T00:00:00Z',
      },
    ],
  };

  const mockMilestones: TeamMilestone[] = [
    {
      id: 'm-1',
      teamId: 'team-1',
      title: 'Foundation Architecture',
      targetDate: '2026-11-20',
      status: 'completed',
      orderIndex: 0,
      createdAt: '2026-11-01T00:00:00Z',
    },
    {
      id: 'm-2',
      teamId: 'team-1',
      title: 'User Onboarding Flow',
      targetDate: '2026-11-27',
      status: 'active',
      orderIndex: 1,
      createdAt: '2026-11-01T00:00:00Z',
    },
    {
      id: 'm-3',
      teamId: 'team-1',
      title: 'Beta Launch and Feedback',
      targetDate: '2026-12-05',
      status: 'upcoming',
      orderIndex: 2,
      createdAt: '2026-11-01T00:00:00Z',
    },
  ];

  describe('TeamHeader', () => {
    it('renders team details, lead badge, and invite action for lead', () => {
      const handleInvite = vi.fn();
      render(
        <TeamHeader
          team={mockTeam}
          currentUser={leadUser}
          onInviteClick={handleInvite}
        />
      );

      expect(screen.getByRole('heading', { name: /alpha launch project/i })).toBeInTheDocument();
      expect(screen.getByText(/delivering the public release by q4/i)).toBeInTheDocument();
      expect(screen.getByText(/team lead/i)).toBeInTheDocument();
      expect(screen.getByText(/roster \(2\):/i)).toBeInTheDocument();

      const inviteBtn = screen.getByRole('button', { name: /invite member/i });
      fireEvent.click(inviteBtn);
      expect(handleInvite).toHaveBeenCalledTimes(1);
    });

    it('renders member badge and hides invite button for non-lead member', () => {
      render(
        <TeamHeader
          team={mockTeam}
          currentUser={memberUser}
          onInviteClick={vi.fn()}
        />
      );

      expect(screen.getByText(/^member$/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /invite member/i })).not.toBeInTheDocument();
    });
  });

  describe('MilestoneRoadmap', () => {
    it('renders all phases with appropriate status badges', () => {
      render(
        <MilestoneRoadmap
          milestones={mockMilestones}
          selectedMilestoneId={null}
        />
      );

      expect(screen.getByText(/foundation architecture/i)).toBeInTheDocument();
      expect(screen.getByText(/user onboarding flow/i)).toBeInTheDocument();
      expect(screen.getByText(/beta launch and feedback/i)).toBeInTheDocument();

      expect(screen.getByText(/completed/i)).toBeInTheDocument();
      expect(screen.getByText(/active phase/i)).toBeInTheDocument();
      expect(screen.getByText(/upcoming/i)).toBeInTheDocument();
    });

    it('handles milestone selection filter toggle', () => {
      const handleSelect = vi.fn();
      render(
        <MilestoneRoadmap
          milestones={mockMilestones}
          selectedMilestoneId={null}
          onSelectMilestone={handleSelect}
        />
      );

      const phaseCard = screen.getByText(/foundation architecture/i).closest('[tabIndex]')!;
      fireEvent.click(phaseCard);
      expect(handleSelect).toHaveBeenCalledWith('m-1');
    });

    it('allows team lead to add a new milestone phase', async () => {
      const handleAdd = vi.fn().mockResolvedValue(undefined);
      render(
        <MilestoneRoadmap
          milestones={mockMilestones}
          isLead={true}
          onAddMilestone={handleAdd}
        />
      );

      const addBtn = screen.getByRole('button', { name: /add phase/i });
      fireEvent.click(addBtn);

      const titleInput = screen.getByLabelText(/milestone title/i);
      const dateInput = screen.getByLabelText(/target delivery date/i);
      const saveBtn = screen.getByRole('button', { name: /save milestone/i });

      fireEvent.change(titleInput, { target: { value: 'Phase 4: Security Audit' } });
      fireEvent.change(dateInput, { target: { value: '2026-12-15' } });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(handleAdd).toHaveBeenCalledWith('Phase 4: Security Audit', '2026-12-15');
      });
    });

    it('allows team lead to toggle milestone status', () => {
      const handleUpdateStatus = vi.fn();
      render(
        <MilestoneRoadmap
          milestones={mockMilestones}
          isLead={true}
          onUpdateMilestoneStatus={handleUpdateStatus}
        />
      );

      // On active milestone m-2, click 'Mark Complete'
      const markCompleteBtns = screen.getAllByRole('button', { name: /mark complete/i });
      fireEvent.click(markCompleteBtns[0]);
      expect(handleUpdateStatus).toHaveBeenCalled();
    });
  });
});
