import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_TARGETS, type PlanningTargets } from '../../data/analytics';
import {
  subscribePlanningTargets,
  updatePlanningTargets,
} from '../../lib/settingsStore';

const DEMO_STORAGE_KEY = 'vido-demo-planning-targets-v1';

function normalise(targets: Partial<PlanningTargets> | null | undefined): PlanningTargets {
  return {
    weekly:
      typeof targets?.weekly === 'number' && targets.weekly > 0
        ? Math.round(targets.weekly)
        : DEFAULT_TARGETS.weekly,
    monthly:
      typeof targets?.monthly === 'number' && targets.monthly > 0
        ? Math.round(targets.monthly)
        : DEFAULT_TARGETS.monthly,
  };
}

function loadDemoTargets(): PlanningTargets {
  if (typeof window === 'undefined') return DEFAULT_TARGETS;
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    return raw ? normalise(JSON.parse(raw) as PlanningTargets) : DEFAULT_TARGETS;
  } catch {
    return DEFAULT_TARGETS;
  }
}

export interface PlanningTargetsState {
  targets: PlanningTargets;
  setTargets: (targets: PlanningTargets) => Promise<void>;
  error: string | null;
}

export function usePlanningTargets(
  uid?: string | null,
  mode: 'demo' | 'live' = 'demo'
): PlanningTargetsState {
  const [demoTargets, setDemoTargets] = useState<PlanningTargets>(loadDemoTargets);
  const [liveTargets, setLiveTargets] = useState<PlanningTargets>(DEFAULT_TARGETS);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoTargets));
  }, [demoTargets]);

  useEffect(() => {
    if (mode !== 'live' || !uid) return;
    setError(null);
    return subscribePlanningTargets(
      uid,
      (targets) => setLiveTargets(normalise(targets)),
      (targetError) => setError(targetError.message)
    );
  }, [mode, uid]);

  const setTargets = useCallback(
    async (next: PlanningTargets) => {
      const targets = normalise(next);
      setError(null);
      if (mode !== 'live' || !uid) {
        setDemoTargets(targets);
        return;
      }
      try {
        await updatePlanningTargets(uid, targets);
        setLiveTargets(targets);
      } catch (writeError) {
        setError((writeError as Error).message);
        throw writeError;
      }
    },
    [mode, uid]
  );

  return {
    targets: mode === 'live' ? liveTargets : demoTargets,
    setTargets,
    error,
  };
}
