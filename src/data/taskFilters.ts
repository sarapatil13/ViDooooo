import { SampleTask, BENCHMARK_DATE_STR, BENCHMARK_DATE_TIME } from './sampleTasks';

export interface ViewFilteredTasks {
  today: SampleTask[];
  needsAttention: SampleTask[];
  upcoming: SampleTask[];
  completed: SampleTask[];
  recentlyCompleted: SampleTask[];
  archived: SampleTask[];
}

export interface HomeDashboardTasks {
  today: { items: SampleTask[]; totalCount: number; limit: number };
  needsAttention: { items: SampleTask[]; totalCount: number; limit: number };
  upcoming: { items: SampleTask[]; totalCount: number; limit: number };
  recentlyCompleted: { items: SampleTask[]; totalCount: number; limit: number };
}

export const HOME_LIMITS = {
  today: 5,
  needsAttention: 3,
  upcoming: 3,
  recentlyCompleted: 3,
} as const;

/**
 * Filter tasks by view relative to deterministic benchmark date and optional today date.
 */
export function getFilteredTasks(
  tasks: SampleTask[],
  benchmarkDateStr: string = BENCHMARK_DATE_STR,
  benchmarkDateTime: string = BENCHMARK_DATE_TIME,
  currentDateStr?: string
): ViewFilteredTasks {
  const benchmarkTime = new Date(benchmarkDateTime).getTime();
  const sevenDaysAgoTime = benchmarkTime - 7 * 24 * 60 * 60 * 1000;

  const nonArchived = tasks.filter((t) => !t.isArchived);
  const archived = tasks.filter((t) => !!t.isArchived);

  // Active tasks
  const activeTasks = nonArchived.filter((t) => t.state === 'active');

  // Completed tasks
  const completedTasks = nonArchived.filter((t) => t.state === 'completed');

  // Today tasks: active and due on benchmark date or current today date
  const today = activeTasks.filter(
    (t) =>
      t.dueDate === benchmarkDateStr ||
      (Boolean(currentDateStr) && t.dueDate === currentDateStr)
  );

  // Needs attention: active and overdue (due date < benchmark date and not today)
  const needsAttention = activeTasks.filter(
    (t) =>
      t.dueDate < benchmarkDateStr &&
      (!currentDateStr || t.dueDate !== currentDateStr)
  );

  // Upcoming: active and due after benchmark date and not today
  const upcoming = activeTasks.filter(
    (t) =>
      t.dueDate > benchmarkDateStr &&
      (!currentDateStr || t.dueDate !== currentDateStr)
  );

  // Recently completed: completed within 7 days before benchmark date
  const recentlyCompleted = completedTasks.filter((t) => {
    if (!t.completedAt) return false;
    const completedTime = new Date(t.completedAt).getTime();
    return completedTime >= sevenDaysAgoTime && completedTime <= benchmarkTime;
  });

  return {
    today,
    needsAttention,
    upcoming,
    completed: completedTasks,
    recentlyCompleted,
    archived,
  };
}

/**
 * Builds Home dashboard sections with limits from pre-filtered task sets.
 */
export function buildHomeDashboard(filtered: ViewFilteredTasks): HomeDashboardTasks {
  return {
    today: {
      items: filtered.today.slice(0, HOME_LIMITS.today),
      totalCount: filtered.today.length,
      limit: HOME_LIMITS.today,
    },
    needsAttention: {
      items: filtered.needsAttention.slice(0, HOME_LIMITS.needsAttention),
      totalCount: filtered.needsAttention.length,
      limit: HOME_LIMITS.needsAttention,
    },
    upcoming: {
      items: filtered.upcoming.slice(0, HOME_LIMITS.upcoming),
      totalCount: filtered.upcoming.length,
      limit: HOME_LIMITS.upcoming,
    },
    recentlyCompleted: {
      items: filtered.recentlyCompleted.slice(0, HOME_LIMITS.recentlyCompleted),
      totalCount: filtered.recentlyCompleted.length,
      limit: HOME_LIMITS.recentlyCompleted,
    },
  };
}

/**
 * Returns limited slices for the Home dashboard with total counts.
 */
export function getHomeDashboardTasks(
  tasks: SampleTask[],
  benchmarkDateStr: string = BENCHMARK_DATE_STR,
  benchmarkDateTime: string = BENCHMARK_DATE_TIME,
  currentDateStr?: string
): HomeDashboardTasks {
  const filtered = getFilteredTasks(tasks, benchmarkDateStr, benchmarkDateTime, currentDateStr);
  return buildHomeDashboard(filtered);
}

