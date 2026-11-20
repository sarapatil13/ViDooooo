import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WorkspaceTopBar } from './WorkspaceTopBar';

describe('WorkspaceTopBar', () => {
  it('renders title, subtitle, search placeholder, and preview badge', () => {
    const handleFocus = vi.fn();
    render(
      <MemoryRouter>
        <WorkspaceTopBar
          title="Home Overview"
          subtitle="Daily task summary"
          onSearchFocus={handleFocus}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /home overview/i })).toBeInTheDocument();
    expect(screen.getByText('Daily task summary')).toBeInTheDocument();
    expect(screen.getByText('Interactive Preview')).toBeInTheDocument();
    expect(screen.getByText('Demo User')).toBeInTheDocument();
    expect(screen.getByText('Personal Workspace')).toBeInTheDocument();

    const searchInput = screen.getByLabelText(/search tasks/i);
    fireEvent.focus(searchInput);
    expect(handleFocus).toHaveBeenCalledTimes(1);
  });

  it('renders notification bell with pending team invitations and allows responding', () => {
    const handleRespond = vi.fn().mockResolvedValue(undefined);
    const mockInvites = [
      {
        id: 'invite-topbar-1',
        teamId: 'team-topbar',
        teamName: 'Beta Launch',
        inviterId: 'lead-1',
        inviterName: 'Sarah Chen',
        inviterEmail: 'sarah@vido.app',
        inviteeEmail: 'alex@vido.app',
        status: 'pending' as const,
        createdAt: '2026-11-18T10:00:00Z',
      },
    ];

    render(
      <MemoryRouter>
        <WorkspaceTopBar
          title="Team View"
          invitations={mockInvites}
          onRespondInvitation={handleRespond}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /notifications: 1 pending/i })).toBeInTheDocument();
    expect(screen.getByTestId('notification-badge')).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', { name: /notifications: 1 pending/i }));
    expect(screen.getByText('Beta Launch')).toBeInTheDocument();
  });
});
