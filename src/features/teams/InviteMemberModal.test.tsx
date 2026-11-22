import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InviteMemberModal } from './InviteMemberModal';
import { MockTeamRepository } from './MockTeamRepository';
import { setTeamRepository } from './teamRepository';

describe('InviteMemberModal', () => {
  let mockRepo: MockTeamRepository;

  beforeEach(() => {
    localStorage.clear();
    mockRepo = new MockTeamRepository();
    setTeamRepository(mockRepo);
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <InviteMemberModal
        isOpen={false}
        onClose={vi.fn()}
        teamId="team-alpha-launch"
        teamName="Alpha Launch"
        inviter={{ id: 'sarah-chen-uid', email: 'sarah@vido.app', name: 'Sarah Chen' }}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal dialog when isOpen is true', () => {
    render(
      <InviteMemberModal
        isOpen={true}
        onClose={vi.fn()}
        teamId="team-alpha-launch"
        teamName="Alpha Launch"
        inviter={{ id: 'sarah-chen-uid', email: 'sarah@vido.app', name: 'Sarah Chen' }}
      />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/collaborator google email/i)).toBeInTheDocument();
  });

  it('displays error if inviter tries to invite their own email', async () => {
    render(
      <InviteMemberModal
        isOpen={true}
        onClose={vi.fn()}
        teamId="team-alpha-launch"
        teamName="Alpha Launch"
        inviter={{ id: 'sarah-chen-uid', email: 'sarah@vido.app', name: 'Sarah Chen' }}
      />
    );

    fireEvent.change(screen.getByLabelText(/collaborator google email/i), {
      target: { value: 'sarah@vido.app' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send invitation/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/already the Team Lead/i);
  });

  it('successfully sends invitation and calls onInviteSent and onClose', async () => {
    const handleClose = vi.fn();
    const handleInviteSent = vi.fn();

    render(
      <InviteMemberModal
        isOpen={true}
        onClose={handleClose}
        teamId="team-alpha-launch"
        teamName="Alpha Launch"
        inviter={{ id: 'sarah-chen-uid', email: 'sarah@vido.app', name: 'Sarah Chen' }}
        onInviteSent={handleInviteSent}
      />
    );

    fireEvent.change(screen.getByLabelText(/collaborator google email/i), {
      target: { value: 'colleague@vido.app' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send invitation/i }));

    await waitFor(() => {
      expect(handleInviteSent).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
