import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotFoundView } from './NotFoundView';
import { useAuth } from '../../auth';

vi.mock('../../auth', () => ({
  useAuth: vi.fn(),
}));

describe('NotFoundView', () => {
  const mockUseAuth = vi.mocked(useAuth);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
      authMode: 'emulator',
    });
  });

  it('renders headline, animated vector character, and brand link', () => {
    render(
      <MemoryRouter>
        <NotFoundView />
      </MemoryRouter>
    );

    // Headline & subtext
    expect(
      screen.getByRole('heading', { name: /you've wandered off the scheduled horizon/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/there are no tasks, events, or milestones located here/i)
    ).toBeInTheDocument();

    // Brand and character container
    expect(screen.getByLabelText('ViDo Home')).toBeInTheDocument();
    expect(screen.getByTestId('animated-character')).toBeInTheDocument();
  });

  it('renders only Return to Home for unauthenticated guest visitors', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
      authMode: 'unconfigured',
    });

    render(
      <MemoryRouter>
        <NotFoundView isPreview={false} />
      </MemoryRouter>
    );

    // Only Return to Home should be visible
    expect(screen.getByRole('link', { name: /return to home/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /back to workspace/i })).not.toBeInTheDocument();
  });

  it('renders Back to Workspace pointing to /workspace for authenticated users', () => {
    mockUseAuth.mockReturnValue({
      user: {
        uid: 'user-123',
        email: 'user@vido.app',
        displayName: 'Test User',
      } as any,
      loading: false,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
      authMode: 'emulator',
    });

    render(
      <MemoryRouter>
        <NotFoundView isPreview={false} />
      </MemoryRouter>
    );

    const workspaceLink = screen.getByRole('link', { name: /back to workspace/i });
    expect(workspaceLink).toBeInTheDocument();
    expect(workspaceLink).toHaveAttribute('href', '/workspace');
    expect(screen.getByRole('link', { name: /return to home/i })).toBeInTheDocument();
  });

  it('renders Back to Workspace pointing to /preview when in demo mode', () => {
    render(
      <MemoryRouter>
        <NotFoundView isPreview={true} />
      </MemoryRouter>
    );

    const workspaceLink = screen.getByRole('link', { name: /back to workspace/i });
    expect(workspaceLink).toBeInTheDocument();
    expect(workspaceLink).toHaveAttribute('href', '/preview');
  });
});
