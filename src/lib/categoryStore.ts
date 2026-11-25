import { onSnapshot, setDoc } from 'firebase/firestore';
import { userDocument } from './userDocument';
import type { UserCategory } from '../data/categories';

export function subscribeUserCategories(
  uid: string,
  next: (customCategories: UserCategory[]) => void,
  onError: (error: Error) => void
) {
  return onSnapshot(
    userDocument(uid),
    (snapshot) => {
      const stored = snapshot.data()?.customCategories as
        | UserCategory[]
        | undefined;
      next(Array.isArray(stored) ? stored : []);
    },
    onError
  );
}

export async function updateUserCustomCategories(
  uid: string,
  customCategories: UserCategory[]
): Promise<void> {
  await setDoc(userDocument(uid), { customCategories }, { merge: true });
}
