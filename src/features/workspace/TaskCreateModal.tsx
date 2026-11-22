import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button, Input, DatePicker, TimePicker } from '../../components/ui';
import { SampleTask } from '../../data/sampleTasks';
import { X, Tag, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  getTodayDateString,
  getSevenDaysAgoDateString,
  getCurrentTimeString,
  getDefaultDueTime,
  validateChronologicalDeadline,
} from '../../utils/dateUtils';

export interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask?: (task: SampleTask) => void;
  /** Clock used for "today" and validation. Defaults to the real current time. */
  now?: Date;
  initialStartDate?: string;
  initialDueDate?: string;
  initialDueTime?: string;
}

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  now: nowProp,
  initialStartDate,
  initialDueDate,
  initialDueTime,
}) => {
  const now = nowProp ?? new Date();
  const todayStr = getTodayDateString(now);
  const sevenDaysAgoStr = getSevenDaysAgoDateString(now);
  const currentTimeStr = getCurrentTimeString(now);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(() => initialStartDate || '');
  const [dueDate, setDueDate] = useState(() => initialDueDate || todayStr);
  const [dueTime, setDueTime] = useState(() => initialDueTime ?? getDefaultDueTime());
  const [priority, setPriority] = useState<'high' | 'medium' | 'low' | ''>('medium');
  const [category, setCategory] = useState<'personal' | 'home' | 'work'>('personal');
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  const validation = useMemo(() => {
    return validateChronologicalDeadline({
      startDate,
      dueDate,
      dueTime,
      now,
    });
  }, [startDate, dueDate, dueTime, now]);

  const isFormValid = Boolean(title.trim()) && validation.isValid;
  const isSelectedDateToday = dueDate === todayStr;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setSubmittedNotice(false);

      if (!dueDate) {
        setDueDate(todayStr);
      }
      setTimeout(() => titleInputRef.current?.focus(), 50);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, todayStr]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !validation.isValid) return;

    const newTask: SampleTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      startDate: startDate.trim() || undefined,
      dueDate: validation.effectiveDueDate,
      dueTime: validation.effectiveDueTime,
      priority: (priority as 'high' | 'medium' | 'low') || undefined,
      state: 'active',
      category,
      createdAt: validation.effectiveCreatedAt,
      checkpoints: [
        {
          id: `cp-${Date.now()}`,
          timestamp: validation.effectiveCreatedAt,
          note: startDate.trim()
            ? `Task initialized in workspace (started on ${startDate.trim()}).`
            : 'Task initialized in workspace.',
        },
      ],
    };

    setSubmittedNotice(true);
    onCreateTask?.(newTask);

    setTitle('');
    setDescription('');
    setStartDate('');
    setDueDate(todayStr);
    setDueTime(getDefaultDueTime());
    setPriority('medium');
    setCategory('personal');

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-task-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close create task modal"
          className="absolute top-5 right-5 text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-lg hover:bg-[var(--canvas)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 id="create-task-title" className="text-xl font-bold text-[var(--ink)]">
          Create New Task
        </h2>
        <p className="text-xs text-[var(--muted)] mt-1 mb-5">
          Define exact deadlines and chronological ownership for your next responsibility.
        </p>

        {submittedNotice && (
          <div className="mb-5 p-3.5 rounded-xl bg-[var(--green-soft)] border border-[var(--green)]/30 text-xs text-[var(--green)] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p className="text-xs font-semibold leading-relaxed">
              Task successfully saved to your workspace.
            </p>
          </div>
        )}

        {validation.generalError && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-xl bg-[var(--red-soft)] border border-[var(--red)]/30 text-xs text-[var(--red)] flex items-start gap-2.5 animate-in fade-in duration-150"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Invalid Chronological Combination</p>
              <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">{validation.generalError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            ref={titleInputRef}
            label="Task Title *"
            required
            placeholder="e.g., Finalize customer onboarding slide deck"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add key context, requirements, or links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[var(--surface)] text-[var(--ink)] placeholder-[var(--faint)] border border-[var(--line)] rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-1 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DatePicker
              label="Start Date (Optional)"
              value={startDate}
              onChange={setStartDate}
              min={sevenDaysAgoStr}
              today={todayStr}
              error={validation.startError}
              helperText="Defaults to today if omitted (max 7 days in past)"
            />

            <DatePicker
              label="Target Due Date *"
              required
              value={dueDate}
              onChange={setDueDate}
              min={startDate || sevenDaysAgoStr}
              today={todayStr}
              error={validation.dateError}
              helperText="Up to 7 days back, for work already started"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TimePicker
              label="Due Time (Optional)"
              value={dueTime}
              onChange={setDueTime}
              minTime={isSelectedDateToday && !startDate ? currentTimeStr : undefined}
              error={validation.timeError}
              helperText={
                isSelectedDateToday && !startDate
                  ? `Must be after ${currentTimeStr} (defaults to 11:59 PM if omitted)`
                  : 'Defaults to 11:59 PM if omitted'
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5 flex items-center gap-1">
                <Tag className="w-3 h-3 text-[var(--faint)]" /> Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              >
                <option value="personal">Personal</option>
                <option value="home">Household / Living</option>
                <option value="work">Work / Professional</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              >
                <option value="">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--line)] flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!isFormValid}
              aria-label="Create Task"
            >
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};