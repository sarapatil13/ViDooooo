import { onSnapshot, setDoc } from 'firebase/firestore';
import { userDocument } from './userDocument';
import { DEFAULT_TARGETS, type PlanningTargets } from '../data/analytics';

export function subscribePlanningTargets(
  uid: string,
  next: (targets: PlanningTargets) => void,
  onError: (error: Error) => void
) {
  return onSnapshot(
    userDocument(uid),
    (snapshot) => {
      const stored = snapshot.data()?.planningTargets as
        | Partial<PlanningTargets>
        | undefined;
      next({
        weekly: stored?.weekly ?? DEFAULT_TARGETS.weekly,
        monthly: stored?.monthly ?? DEFAULT_TARGETS.monthly,
      });
    },
    onError
  );
}

export async function updatePlanningTargets(
  uid: string,
  targets: PlanningTargets
) {
  await setDoc(userDocument(uid), { planningTargets: targets }, { merge: true });
}
