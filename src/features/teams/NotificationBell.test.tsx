import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { NotificationBell } from './NotificationBell';
import { TeamInvitation } from './types';

const sampleInvitations: TeamInvitation[] = [
  {
    id: 'invite-1',
    teamId: 'team-1',
    teamName: 'Mobile MVP',
    inviterId: 'user-1',
    inviterName: 'Sarah Chen',
    inviterEmail: 'sarah@vido.app',
    inviteeEmail: 'alex@vido.app',
    status: 'pending',
    createdAt: '2026-11-18T10:00:00Z',
  },
];

describe('NotificationBell', () => {
  it('renders bell button and badge with pending count', () => {
    render(<NotificationBell invitations={sampleInvitations} onRespond={vi.fn()} />);

    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    expect(screen.getByTestId('notification-badge')).toHaveTextContent('1');
  });

  it('does not render count badge when invitations are empty', () => {
    render(<NotificationBell invitations={[]} onRespond={vi.fn()} />);

    expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument();
  });

  it('opens dropdown on click showing invitation details', () => {
    render(<NotificationBell invitations={sampleInvitations} onRespond={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));

    expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();
    expect(screen.getByText('Mobile MVP')).toBeInTheDocument();
    expect(screen.getByText(/Sarah Chen/)).toBeInTheDocument();
  });

  it('calls onRespond with true when Accept is clicked', async () => {
    const handleRespond = vi.fn().mockResolvedValue(undefined);
    render(<NotificationBell invitations={sampleInvitations} onRespond={handleRespond} />);

    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /accept/i }));
    });

    expect(handleRespond).toHaveBeenCalledWith('invite-1', true);
  });

  it('calls onRespond with false when Reject is clicked', async () => {
    const handleRespond = vi.fn().mockResolvedValue(undefined);
    render(<NotificationBell invitations={sampleInvitations} onRespond={handleRespond} />);

    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /reject/i }));
    });

    expect(handleRespond).toHaveBeenCalledWith('invite-1', false);
  });
});

