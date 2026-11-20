import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NestJsTeamRepository } from './NestJsTeamRepository';
import { getTeamRepository, setTeamRepository } from './teamRepository';

describe('NestJsTeamRepository', () => {
  let repo: NestJsTeamRepository;

  beforeEach(() => {
    repo = new NestJsTeamRepository('http://localhost:3001');
    setTeamRepository(null);
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setTeamRepository(null);
  });

  it('can be instantiated with a custom base URL', () => {
    expect(repo).toBeInstanceOf(NestJsTeamRepository);
  });

  it('fetches teams from the NestJS /api/teams endpoint', async () => {
    const mockTeams = [
      {
        id: 'team-1',
        name: 'Alpha Team',
        description: 'Test description',
        leadId: 'user-1',
        leadEmail: 'user1@vido.app',
        createdAt: '2026-11-20T10:00:00Z',
        members: [],
      },
    ];

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeams,
    });

    const teams = await repo.getTeams('user-1');
    expect(teams).toHaveLength(1);
    expect(teams[0].name).toBe('Alpha Team');
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/teams',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: expect.stringContaining('Bearer '),
        }),
      })
    );
  });

  it('creates team via POST /api/teams', async () => {
    const createdTeam = {
      id: 'team-2',
      name: 'Beta Team',
      description: 'Beta description',
      leadId: 'user-1',
      leadEmail: 'user1@vido.app',
      createdAt: '2026-11-20T10:00:00Z',
      members: [],
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => createdTeam,
    });

    const team = await repo.createTeam('Beta Team', 'Beta description', {
      id: 'user-1',
      name: 'User One',
      email: 'user1@vido.app',
    });

    expect(team.id).toBe('team-2');
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/teams',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Beta Team', description: 'Beta description' }),
      })
    );
  });

  it('fetches pending invitations via GET /api/invitations/pending', async () => {
    const mockInvites = [
      {
        id: 'inv-1',
        teamId: 'team-1',
        teamName: 'Alpha Team',
        inviterId: 'user-1',
        inviterName: 'Lead',
        inviterEmail: 'lead@vido.app',
        inviteeEmail: 'member@vido.app',
        status: 'pending',
        createdAt: '2026-11-20T10:00:00Z',
      },
    ];

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockInvites,
    });

    const invites = await repo.getInvitations('member@vido.app');
    expect(invites).toHaveLength(1);
    expect(invites[0].inviteeEmail).toBe('member@vido.app');
  });

  it('factory instantiates NestJsTeamRepository when VITE_BACKEND_TYPE is nestjs', () => {
    const original = import.meta.env.VITE_BACKEND_TYPE;
    try {
      (import.meta.env as any).VITE_BACKEND_TYPE = 'nestjs';
      const r = getTeamRepository();
      expect(r).toBeInstanceOf(NestJsTeamRepository);
    } finally {
      (import.meta.env as any).VITE_BACKEND_TYPE = original;
    }
  });
});
