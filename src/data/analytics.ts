import type { SampleTask } from './sampleTasks';
import {
  addDays,
  formatWeekRange,
  getWeeksInMonth,
  monthKey,
  startOfMonth,
  startOfWeek,
  type WeekRange,
} from './calendar';

export interface PlanningTargets {
  weekly: number;
  monthly: number;
}

export const DEFAULT_TARGETS: PlanningTargets = {
  weekly: 5,
  monthly: 20,
};

export interface PeriodStats {
  planned: number;
  completed: number;
  remaining: number;
  completionPercentage: number;
  target: number;
  targetPercentage: number;
}

export interface WeekStats extends PeriodStats {
  start: string;
  end: string;
  label: string;
}

export interface MonthStats extends PeriodStats {
  weeks: WeekStats[];
  cumulativeCompleted: number[];
}

function percent(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.min(100, Math.round((numerator / denominator) * 100));
}

function statsFor(tasks: SampleTask[], target: number): PeriodStats {
  const completed = tasks.filter((task) => task.state === 'completed').length;
  return {
    planned: tasks.length,
    completed,
    remaining: Math.max(0, tasks.length - completed),
    completionPercentage: percent(completed, tasks.length),
    target,
    targetPercentage: percent(completed, target),
  };
}

function tasksInRange(
  tasks: SampleTask[],
  start: string,
  end: string,
  monthOnly = false
): SampleTask[] {
  return tasks.filter(
    (task) =>
      !task.isArchived &&
      task.dueDate >= start &&
      task.dueDate <= end &&
      (!monthOnly || monthKey(task.dueDate) === monthKey(start))
  );
}

/** Completion and target progress for the Monday–Sunday week containing `referenceDate`. */
export function computeWeekStats(
  tasks: SampleTask[],
  referenceDate: string,
  target: number
): WeekStats {
  const start = startOfWeek(referenceDate);
  const end = addDays(start, 6);
  return {
    ...statsFor(tasksInRange(tasks, start, end), target),
    start,
    end,
    label: formatWeekRange(referenceDate),
  };
}

/** Monthly goal progress plus the weekly contributions that make it up. */
export function computeMonthStats(
  tasks: SampleTask[],
  referenceDate: string,
  target: number
): MonthStats {
  const first = startOfMonth(referenceDate);
  const monthTasks = tasksInRange(tasks, first, `${monthKey(first)}-31`, true);
  const weeks: WeekStats[] = getWeeksInMonth(first).map((week: WeekRange) => ({
    ...statsFor(tasksInRange(tasks, week.start, week.end, true), target),
    start: week.start,
    end: week.end,
    label: week.label,
  }));

  let running = 0;
  const cumulativeCompleted = weeks.map((week) => {
    running += week.completed;
    return running;
  });

  return {
    ...statsFor(monthTasks, target),
    weeks,
    cumulativeCompleted,
  };
}

export function isTargetReached(stats: PeriodStats): boolean {
  return stats.target > 0 && stats.completed >= stats.target;
}
