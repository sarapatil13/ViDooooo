import { doc } from 'firebase/firestore';
import { db } from './firebase';

/** The single per-user document that stores connection and planning settings. */
export const userDocument = (uid: string) => doc(db, 'users', uid);
