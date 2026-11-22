import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  compareEvents,
  formatISODate,
  formatLongDate,
  formatMonthLabel,
  formatShortDate,
  formatWeekRange,
  getMonthGrid,
  getWeeksInMonth,
  getWeekDays,
  isSameMonth,
  monthKey,
  parseISODate,
  startOfMonth,
  startOfWeek,
  weekdayLabel,
  type CalendarEvent,
} from './calendar';

describe('calendar date helpers', () => {
  it('parses and formats local ISO dates without UTC drift', () => {
    const date = parseISODate('2026-11-17');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(10);
    expect(date.getDate()).toBe(17);
    expect(formatISODate(date)).toBe('2026-11-17');
  });

  it('adds days and months, clamping invalid month days', () => {
    expect(addDays('2026-11-17', 5)).toBe('2026-11-22');
    expect(addDays('2026-11-17', -1)).toBe('2026-11-16');
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2026-11-17', 2)).toBe('2027-01-17');
  });

  it('builds Monday-first weeks', () => {
    expect(startOfWeek('2026-11-17')).toBe('2026-11-16');
    expect(getWeekDays('2026-11-17')).toEqual([
      '2026-11-16',
      '2026-11-17',
      '2026-11-18',
      '2026-11-19',
      '2026-11-20',
      '2026-11-21',
      '2026-11-22',
    ]);
    expect(weekdayLabel('2026-11-16')).toBe('Mon');
    expect(weekdayLabel('2026-11-17')).toBe('Tue');
  });

  it('builds a stable 6 x 7 month grid and identifies month boundaries', () => {
    const grid = getMonthGrid('2026-11-17');
    expect(grid).toHaveLength(42);
    expect(grid[0]).toBe('2026-10-26');
    expect(grid[41]).toBe('2026-12-06');
    expect(startOfMonth('2026-11-17')).toBe('2026-11-01');
    expect(monthKey('2026-11-17')).toBe('2026-11');
    expect(isSameMonth('2026-11-30', '2026-11-01')).toBe(true);
    expect(isSameMonth('2026-12-01', '2026-11-01')).toBe(false);
  });

  it('lists every week that touches a month', () => {
    const weeks = getWeeksInMonth('2026-11-17');
    expect(weeks).toHaveLength(6);
    expect(weeks[0].start).toBe('2026-10-26');
    expect(weeks[0].end).toBe('2026-11-01');
    expect(weeks[5].start).toBe('2026-11-30');
    expect(weeks[5].end).toBe('2026-12-06');
  });

  it('formats human-readable labels', () => {
    expect(formatShortDate('2026-11-17')).toBe('17 Nov');
    expect(formatLongDate('2026-11-17')).toBe('Tue, 17 November 2026');
    expect(formatWeekRange('2026-11-17')).toBe('16 Nov – 22 Nov 2026');
    expect(formatMonthLabel('2026-11-17')).toBe('November 2026');
  });

  it('sorts calendar events by date then time', () => {
    const events: CalendarEvent[] = [
      {
        id: 'late',
        title: 'Late',
        date: '2026-11-17',
        time: '15:00',
        source: 'calendar',
      },
      {
        id: 'early',
        title: 'Early',
        date: '2026-11-17',
        time: '09:00',
        source: 'calendar',
      },
      {
        id: 'other-day',
        title: 'Other day',
        date: '2026-11-16',
        time: '20:00',
        source: 'calendar',
      },
    ];

    expect([...events].sort(compareEvents).map((event) => event.id)).toEqual([
      'other-day',
      'early',
      'late',
    ]);
  });
});
