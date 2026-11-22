import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { SampleTask } from '../../../data/sampleTasks';
import type { CalendarEvent } from '../../../data/calendar';
import { CalendarView } from './CalendarView';
import { AnalyticsView } from './AnalyticsView';

const REFERENCE_DATE = '2026-11-17';

const task: SampleTask = {
  id: 'task-unique',
  title: 'Unique planning task',
  description: 'Prepare the release notes.',
  dueDate: REFERENCE_DATE,
  dueTime: '09:00',
  state: 'active',
  category: 'work',
  createdAt: '2026-11-01T12:00:00Z',
};

const event: CalendarEvent = {
  id: 'event-unique',
  title: 'Unique planning sync',
  date: REFERENCE_DATE,
  time: '10:00',
  endTime: '10:30',
  description: 'Review the plan with the team.',
  source: 'calendar',
};

function renderCalendar(overrides: Partial<ComponentProps<typeof CalendarView>> = {}) {
  const onCreateEvent = vi.fn();
  const onDeleteEvent = vi.fn();
  const onCreateTask = vi.fn();
  const onTaskClick = vi.fn();

  render(
    <CalendarView
      tasks={[task]}
      events={[event]}
      onCreateEvent={onCreateEvent}
      onDeleteEvent={onDeleteEvent}
      onCreateTask={onCreateTask}
      onTaskClick={onTaskClick}
      referenceDate={REFERENCE_DATE}
      mode="demo"
      {...overrides}
    />
  );

  return {
    onCreateEvent,
    onDeleteEvent,
    onCreateTask,
    onTaskClick,
  };
}

describe('CalendarView', () => {
  it('renders tasks and connected calendar events in weekly and monthly layouts', () => {
    renderCalendar();

    expect(screen.getByText('Planning Calendar')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Task: Unique planning task' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Calendar event: Unique planning sync' })
    ).toBeInTheDocument();
    expect(screen.getByText('16 Nov – 22 Nov 2026')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'month' }));
    expect(screen.getByText('November 2026')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Open week of/ }).length).toBeGreaterThan(0);
  });

  it('adds a ViDo task to the planning calendar with a task link', () => {
    const { onCreateEvent } = renderCalendar();

    fireEvent.click(
      screen.getByRole('button', { name: 'Add Unique planning task to calendar' })
    );

    expect(onCreateEvent).toHaveBeenCalledTimes(1);
    expect(onCreateEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Unique planning task',
        date: REFERENCE_DATE,
        time: '09:00',
        source: 'calendar',
        linkedTaskId: 'task-unique',
      })
    );
  });

  it('imports a calendar event as a ViDo task and can remove the event', () => {
    const { onCreateTask, onDeleteEvent } = renderCalendar();

    fireEvent.click(
      screen.getByRole('button', { name: 'Calendar event: Unique planning sync' })
    );
    expect(screen.getByRole('dialog', { name: /Unique planning sync/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Add as task/i }));

    expect(onCreateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Unique planning sync',
        dueDate: REFERENCE_DATE,
        dueTime: '10:00',
        state: 'active',
      })
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Calendar event: Unique planning sync' })
    );
    fireEvent.click(screen.getByRole('button', { name: /Remove event/i }));
    expect(onDeleteEvent).toHaveBeenCalledWith('event-unique');
  });

  it('creates a manual calendar event', () => {
    const { onCreateEvent } = renderCalendar();

    fireEvent.click(screen.getByRole('button', { name: /Add event/i }));
    fireEvent.change(screen.getByLabelText(/Event title/i), {
      target: { value: 'Manual event' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save event/i }));

    expect(onCreateEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Manual event',
        date: REFERENCE_DATE,
        source: 'calendar',
      })
    );
  });
});

describe('AnalyticsView', () => {
  const analyticsTasks: SampleTask[] = [
    { ...task, id: 'done-1', title: 'Done 1', dueDate: '2026-11-16', state: 'completed' },
    { ...task, id: 'done-2', title: 'Done 2', state: 'completed' },
    task,
  ];

  function renderAnalytics() {
    const onTargetsChange = vi.fn();
    render(
      <AnalyticsView
        tasks={analyticsTasks}
        targets={{ weekly: 2, monthly: 10 }}
        onTargetsChange={onTargetsChange}
        referenceDate={REFERENCE_DATE}
        mode="demo"
      />
    );
    return { onTargetsChange };
  }

  it('shows weekly completion, target progress, and a target reached badge', () => {
    renderAnalytics();

    expect(screen.getByText('Completion Analytics')).toBeInTheDocument();
    expect(screen.getByText('Target reached')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'week completion against planned work' })).toHaveAttribute(
      'aria-valuenow',
      '67'
    );
    expect(screen.getByRole('progressbar', { name: 'week target achievement' })).toHaveAttribute(
      'aria-valuenow',
      '100'
    );
  });

  it('lets the user edit the weekly target', () => {
    const { onTargetsChange } = renderAnalytics();

    fireEvent.change(screen.getByLabelText(/Weekly target/i), {
      target: { value: '7' },
    });
    expect(onTargetsChange).toHaveBeenCalledWith({ weekly: 7, monthly: 10 });
  });

  it('shows cumulative weekly contributions in the monthly view', () => {
    const { onTargetsChange } = renderAnalytics();

    fireEvent.click(screen.getByRole('button', { name: 'month' }));

    expect(
      screen.getByText('Weekly contributions to the monthly goal')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Cumulative monthly target' })
    ).toHaveAttribute('aria-valuenow', '20');

    fireEvent.change(screen.getByLabelText(/Monthly goal/i), {
      target: { value: '4' },
    });
    expect(onTargetsChange).toHaveBeenCalledWith({ weekly: 2, monthly: 4 });
  });
});
