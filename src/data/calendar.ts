import { BENCHMARK_DATE_STR } from './sampleTasks';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  endTime?: string; // HH:mm
  description?: string;
  source: 'calendar';
  linkedTaskId?: string;
}

/** Sample calendar events shown in the preview workspace. */
export const SAMPLE_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'event-weekly-planning',
    title: 'Weekly planning sync',
    date: '2026-11-17',
    time: '09:30',
    endTime: '10:00',
    description: 'Review the week ahead and confirm priorities.',
    source: 'calendar',
  },
  {
    id: 'event-design-review',
    title: 'Design review — planning views',
    date: '2026-11-18',
    time: '11:00',
    endTime: '12:00',
    description: 'Walk through the calendar and analytics layouts.',
    source: 'calendar',
  },
  {
    id: 'event-dentist',
    title: 'Dentist appointment',
    date: '2026-11-19',
    time: '15:00',
    endTime: '16:00',
    source: 'calendar',
  },
  {
    id: 'event-standup',
    title: 'Team stand-up',
    date: '2026-11-20',
    time: '10:00',
    endTime: '10:15',
    description: 'Daily check-in with the delivery team.',
    source: 'calendar',
  },
  {
    id: 'event-roadmap',
    title: 'Quarterly roadmap workshop',
    date: '2026-11-23',
    time: '14:00',
    endTime: '16:00',
    source: 'calendar',
  },
  {
    id: 'event-monthly-review',
    title: 'Monthly goals review',
    date: '2026-11-26',
    time: '09:00',
    endTime: '10:00',
    description: 'Compare weekly progress against the monthly goal.',
    source: 'calendar',
  },
  {
    id: 'event-offsite',
    title: 'Team offsite',
    date: '2026-12-01',
    time: '13:00',
    endTime: '17:00',
    source: 'calendar',
  },
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** Local calendar date (avoids the UTC day shift in toISOString). */
export function todayISO(): string {
  return formatISODate(new Date());
}

export function parseISODate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(value: string, days: number): string {
  const date = parseISODate(value);
  date.setDate(date.getDate() + days);
  return formatISODate(date);
}

export function startOfWeek(value: string): string {
  const date = parseISODate(value);
  const mondayOffset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - mondayOffset);
  return formatISODate(date);
}

export function getWeekDays(value: string): string[] {
  const monday = startOfWeek(value);
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

export function startOfMonth(value: string): string {
  return `${value.slice(0, 7)}-01`;
}

export function addMonths(value: string, months: number): string {
  const date = parseISODate(value);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return formatISODate(date);
}

export function monthKey(value: string): string {
  return value.slice(0, 7);
}

/** Six full weeks, so every month renders as a stable 6 x 7 grid. */
export function getMonthGrid(value: string): string[] {
  const gridStart = startOfWeek(startOfMonth(value));
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

export function isSameMonth(value: string, reference: string): boolean {
  return monthKey(value) === monthKey(reference);
}

export function weekdayLabel(value: string): string {
  return WEEKDAYS[(parseISODate(value).getDay() + 6) % 7];
}

export function formatShortDate(value: string): string {
  const date = parseISODate(value);
  return `${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)}`;
}

export function formatLongDate(value: string): string {
  const date = parseISODate(value);
  return `${WEEKDAYS[(date.getDay() + 6) % 7]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatWeekRange(value: string): string {
  const days = getWeekDays(value);
  const first = parseISODate(days[0]);
  const last = parseISODate(days[6]);
  const firstLabel = `${first.getDate()} ${MONTHS[first.getMonth()].slice(0, 3)}`;
  const lastLabel = `${last.getDate()} ${MONTHS[last.getMonth()].slice(0, 3)}`;
  return `${firstLabel} – ${lastLabel} ${last.getFullYear()}`;
}

export function formatMonthLabel(value: string): string {
  const date = parseISODate(startOfMonth(value));
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export interface WeekRange {
  start: string;
  end: string;
  label: string;
}

/** Monday–Sunday weeks that contain at least one day of the given month. */
export function getWeeksInMonth(value: string): WeekRange[] {
  const first = startOfMonth(value);
  const grid = getMonthGrid(first).filter((day) => isSameMonth(day, first));
  const starts = Array.from(new Set(grid.map((day) => startOfWeek(day))));

  return starts.map((start) => {
    const end = addDays(start, 6);
    return {
      start,
      end,
      label: `${formatShortDate(start)} – ${formatShortDate(end)}`,
    };
  });
}

export const DEFAULT_REFERENCE_DATE = BENCHMARK_DATE_STR;

export function compareEvents(a: CalendarEvent, b: CalendarEvent): number {
  const byDate = a.date.localeCompare(b.date);
  if (byDate !== 0) return byDate;
  return (a.time ?? '23:59').localeCompare(b.time ?? '23:59');
}
