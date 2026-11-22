import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SAMPLE_CALENDAR_EVENTS,
  compareEvents,
  type CalendarEvent,
} from '../../data/calendar';
import {
  createCalendarEvent,
  deleteCalendarEvent,
  subscribeCalendarEvents,
} from '../../lib/calendarStore';

const DEMO_STORAGE_KEY = 'vido-demo-calendar-v1';

function loadDemoEvents(): CalendarEvent[] {
  if (typeof window === 'undefined') {
    return SAMPLE_CALENDAR_EVENTS;
  }
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return SAMPLE_CALENDAR_EVENTS;
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed as CalendarEvent[];
    }
    if (
      parsed &&
      typeof parsed === 'object' &&
      Array.isArray((parsed as { events?: unknown }).events)
    ) {
      return (parsed as { events: CalendarEvent[] }).events;
    }
    return SAMPLE_CALENDAR_EVENTS;
  } catch {
    return SAMPLE_CALENDAR_EVENTS;
  }
}

function persistDemoEvents(events: CalendarEvent[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(events));
}

export interface UseCalendarResult {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  addEvent: (event: CalendarEvent) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
}

export function useCalendar(
  uid?: string | null,
  mode: 'demo' | 'live' = 'demo'
): UseCalendarResult {
  const resolvedUid = uid ?? undefined;
  const [events, setEvents] = useState<CalendarEvent[]>(() =>
    mode === 'demo' ? loadDemoEvents() : []
  );
  const [loading, setLoading] = useState(mode === 'live');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== 'live' || !resolvedUid) {
      setEvents(mode === 'demo' ? loadDemoEvents() : []);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeCalendarEvents(
      resolvedUid,
      (nextEvents) => {
        setEvents(nextEvents);
        setLoading(false);
      },
      (subscribeError) => {
        setError(subscribeError.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [mode, resolvedUid]);

  const addEvent = useCallback(
    async (event: CalendarEvent) => {
      if (mode === 'demo') {
        const next = [...events.filter((entry) => entry.id !== event.id), event];
        persistDemoEvents(next);
        setEvents(next);
        return;
      }
      if (!resolvedUid) return;
      try {
        await createCalendarEvent(resolvedUid, event);
      } catch (createError) {
        setError((createError as Error).message);
        throw createError;
      }
    },
    [events, mode, resolvedUid]
  );

  const deleteEvent = useCallback(
    async (eventId: string) => {
      if (mode === 'demo') {
        const next = events.filter((event) => event.id !== eventId);
        persistDemoEvents(next);
        setEvents(next);
        return;
      }
      if (!resolvedUid) return;
      try {
        await deleteCalendarEvent(resolvedUid, eventId);
      } catch (deleteError) {
        setError((deleteError as Error).message);
        throw deleteError;
      }
    },
    [events, mode, resolvedUid]
  );

  const sortedEvents = useMemo(
    () => [...events].sort(compareEvents),
    [events]
  );

  return { events: sortedEvents, loading, error, addEvent, deleteEvent };
}
