import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getTeamRepository,
  setTeamRepository,
} from './teamRepository';
import { MockTeamRepository } from './MockTeamRepository';

describe('teamRepository factory', () => {
  beforeEach(() => {
    setTeamRepository(null);
  });

  afterEach(() => {
    setTeamRepository(null);
  });

  it('falls back to MockTeamRepository when Supabase credentials are absent', () => {
    const repo = getTeamRepository();
    expect(repo).toBeInstanceOf(MockTeamRepository);
  });

  it('caches the repository instance as a singleton', () => {
    const repo1 = getTeamRepository();
    const repo2 = getTeamRepository();
    expect(repo1).toBe(repo2);
  });

  it('supports injecting a custom repository instance via setTeamRepository', () => {
    const custom = new MockTeamRepository();
    setTeamRepository(custom);
    expect(getTeamRepository()).toBe(custom);
  });
});
