import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateTeamModal } from './CreateTeamModal';
import { setTeamRepository } from './teamRepository';
import { MockTeamRepository } from './MockTeamRepository';
import { UserProfile } from './types';

describe('CreateTeamModal', () => {
  let mockRepo: MockTeamRepository;
  const mockUser: UserProfile = {
    id: 'lead-user-1',
    name: 'Lead User',
    email: 'lead@vido.app',
  };

  beforeEach(() => {
    localStorage.clear();
    mockRepo = new MockTeamRepository();
    setTeamRepository(mockRepo);
  });

  it('renders nothing when closed', () => {
    render(
      <CreateTeamModal
        isOpen={false}
        onClose={vi.fn()}
        currentUser={mockUser}
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders form inputs when open', () => {
    render(
      <CreateTeamModal
        isOpen={true}
        onClose={vi.fn()}
        currentUser={mockUser}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /create team workspace/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/team \/ project name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project goal & description/i)).toBeInTheDocument();
  });

  it('calls createTeam and invokes onTeamCreated on submit', async () => {
    const handleClose = vi.fn();
    const handleCreated = vi.fn();

    render(
      <CreateTeamModal
        isOpen={true}
        onClose={handleClose}
        currentUser={mockUser}
        onTeamCreated={handleCreated}
      />
    );

    const nameInput = screen.getByLabelText(/team \/ project name/i);
    const descInput = screen.getByLabelText(/project goal & description/i);
    const submitBtn = screen.getByRole('button', { name: /^create team$/i });

    fireEvent.change(nameInput, { target: { value: 'Beta Rollout' } });
    fireEvent.change(descInput, { target: { value: 'Preparing beta deployment' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Beta Rollout',
          description: 'Preparing beta deployment',
          leadId: 'lead-user-1',
          leadEmail: 'lead@vido.app',
        })
      );
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  it('handles cancellation and dismiss', () => {
    const handleClose = vi.fn();
    render(
      <CreateTeamModal
        isOpen={true}
        onClose={handleClose}
        currentUser={mockUser}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
