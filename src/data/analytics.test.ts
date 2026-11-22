import { describe, expect, it } from 'vitest';
import type { SampleTask } from './sampleTasks';
import {
  DEFAULT_TARGETS,
  computeMonthStats,
  computeWeekStats,
  isTargetReached,
} from './analytics';

const task = (
  id: string,
  dueDate: string,
  state: SampleTask['state'],
  isArchived = false
): SampleTask => ({
  id,
  title: id,
  dueDate,
  state,
  category: 'work',
  createdAt: '2026-11-01T12:00:00Z',
  isArchived,
});

describe('planning analytics', () => {
  const tasks: SampleTask[] = [
    task('mon', '2026-11-16', 'completed'),
    task('tue', '2026-11-17', 'completed'),
    task('wed', '2026-11-18', 'active'),
    task('month-end', '2026-11-30', 'completed'),
    task('archived', '2026-11-17', 'completed', true),
    task('next-month', '2026-12-01', 'completed'),
  ];

  it('computes weekly completion and target percentages', () => {
    const stats = computeWeekStats(tasks, '2026-11-17', 5);

    expect(stats.start).toBe('2026-11-16');
    expect(stats.end).toBe('2026-11-22');
    expect(stats.planned).toBe(3);
    expect(stats.completed).toBe(2);
    expect(stats.remaining).toBe(1);
    expect(stats.completionPercentage).toBe(67);
    expect(stats.target).toBe(5);
    expect(stats.targetPercentage).toBe(40);
  });

  it('computes cumulative monthly progress from weekly contributions', () => {
    const stats = computeMonthStats(tasks, '2026-11-17', 10);

    expect(stats.planned).toBe(4);
    expect(stats.completed).toBe(3);
    expect(stats.completionPercentage).toBe(75);
    expect(stats.targetPercentage).toBe(30);
    expect(stats.weeks).toHaveLength(6);
    expect(stats.cumulativeCompleted).toHaveLength(stats.weeks.length);
    expect(stats.cumulativeCompleted[stats.cumulativeCompleted.length - 1]).toBe(3);
    expect(stats.weeks[0].start).toBe('2026-10-26');
    expect(stats.weeks[0].completed).toBe(0);
    expect(stats.cumulativeCompleted).toEqual([0, 0, 0, 2, 2, 3]);
    expect(stats.weeks[3].completed).toBe(2);
    expect(stats.weeks[5].completed).toBe(1);
  });

  it('handles empty periods without divide-by-zero', () => {
    const stats = computeWeekStats([], '2026-11-17', DEFAULT_TARGETS.weekly);
    expect(stats.completionPercentage).toBe(0);
    expect(stats.targetPercentage).toBe(0);
    expect(stats.remaining).toBe(0);
  });

  it('detects whether a target has been reached', () => {
    const stats = computeWeekStats(tasks, '2026-11-17', 2);
    expect(isTargetReached(stats)).toBe(true);
    expect(isTargetReached({ ...stats, target: 3 })).toBe(false);
    expect(isTargetReached({ ...stats, target: 0 })).toBe(false);
  });
});
