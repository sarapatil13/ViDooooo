import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { CalendarEvent } from '../data/calendar';

const eventsCollection = (uid: string) =>
  collection(db, 'users', uid, 'calendarEvents');
const eventDocument = (uid: string, eventId: string) =>
  doc(db, 'users', uid, 'calendarEvents', eventId);

export function subscribeCalendarEvents(
  uid: string,
  next: (events: CalendarEvent[]) => void,
  onError: (error: Error) => void
) {
  return onSnapshot(
    eventsCollection(uid),
    (snapshot) => {
      const events = snapshot.docs.map(
        (entry) => entry.data() as CalendarEvent
      );
      next(events);
    },
    onError
  );
}

export async function createCalendarEvent(uid: string, event: CalendarEvent) {
  await setDoc(eventDocument(uid, event.id), event, { merge: true });
}

export async function deleteCalendarEvent(uid: string, eventId: string) {
  await deleteDoc(eventDocument(uid, eventId));
}
