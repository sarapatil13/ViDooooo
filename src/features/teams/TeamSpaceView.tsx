import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  CheckSquare,
  AlertCircle,
  Inbox,
  UserCheck,
  Flag,
} from 'lucide-react';
import { getTeamRepository } from './teamRepository';
import { Team, TeamMilestone, TeamTask, UserProfile, MilestoneStatus } from './types';
import { TeamHeader, MilestoneRoadmap } from './MilestoneRoadmap';
import { TeamTaskRow } from './TeamTaskRow';
import { TeamTaskCreateModal } from './TeamTaskCreateModal';
import { InviteMemberModal } from './InviteMemberModal';
import { Button } from '../../components/ui';

export interface TeamSpaceViewProps {
  teamId: string;
  currentUser: UserProfile;
  basePath?: string;
}

export const TeamSpaceView: React.FC<TeamSpaceViewProps> = ({
  teamId,
  currentUser,
}) => {
  const [team, setTeam] = useState<Team | null>(null);
  const [milestones, setMilestones] = useState<TeamMilestone[]>([]);
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Modal State
  const [filterMode, setFilterMode] = useState<'all' | 'assigned-to-me'>('all');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  const repo = getTeamRepository();

  const loadTeamData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [loadedTeam, loadedMilestones, loadedTasks] = await Promise.all([
        repo.getTeam(teamId),
        repo.getMilestones(teamId),
        repo.getTeamTasks(teamId),
      ]);

      if (!loadedTeam) {
        setError('Team workspace not found');
        return;
      }

      setTeam(loadedTeam);
      setMilestones(loadedMilestones);
      setTasks(loadedTasks);
    } catch (err: any) {
      setError(err?.message || 'Failed to load team workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamData();
    const handleFocus = () => {
      void loadTeamData();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [teamId]);

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto flex items-center justify-center min-h-[300px]">
        <div className="flex items-center gap-2.5 text-xs text-[var(--muted)]">
          <div className="w-4 h-4 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          <span>Loading team workspace...</span>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error || 'Team workspace not found'}</span>
        </div>
      </div>
    );
  }

  const isLead = team.leadId === currentUser.id;

  // Milestone Actions
  const handleAddMilestone = async (title: string, targetDate: string) => {
    const created = await repo.createMilestone(teamId, title, targetDate, milestones.length);
    setMilestones((prev) => [...prev, created]);
  };

  const handleUpdateMilestoneStatus = async (milestoneId: string, status: MilestoneStatus) => {
    const updated = await repo.updateMilestoneStatus(milestoneId, status);
    setMilestones((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  // Task Actions
  const handleTaskCreated = (newTask: TeamTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateProgress = async (taskId: string, progress: number, note?: string) => {
    const updated = await repo.updateTeamTaskProgress(taskId, progress, note, currentUser);
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  // Filtering Logic
  const filteredTasks = tasks.filter((task) => {
    // 1. Assignee Filter
    if (filterMode === 'assigned-to-me' && task.assigneeId !== currentUser.id) {
      return false;
    }
    // 2. Milestone Filter
    if (selectedMilestoneId && task.milestoneId !== selectedMilestoneId) {
      return false;
    }
    // 3. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const selectedMilestone = milestones.find((m) => m.id === selectedMilestoneId);

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* 1. Team Header */}
      <TeamHeader
        team={team}
        currentUser={currentUser}
        onInviteClick={isLead ? () => setIsInviteOpen(true) : undefined}
      />

      {/* 2. Phased Milestone Roadmap */}
      <MilestoneRoadmap
        milestones={milestones}
        selectedMilestoneId={selectedMilestoneId}
        onSelectMilestone={setSelectedMilestoneId}
        isLead={isLead}
        onAddMilestone={isLead ? handleAddMilestone : undefined}
        onUpdateMilestoneStatus={isLead ? handleUpdateMilestoneStatus : undefined}
      />

      {/* 3. Team Tasks Section */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 shadow-xs space-y-5">
        {/* Section Top Bar: Title & Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[var(--accent)]" />
                <span>Team Tasks & Deliverables</span>
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--canvas)] border border-[var(--line)] text-[var(--muted)]">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Collaborative deliverables tracked across milestone phases
            </p>
          </div>

          {isLead && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateTaskOpen(true)}
              className="gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </Button>
          )}
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-[var(--canvas)] p-1 rounded-xl border border-[var(--line)] self-start md:self-auto">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-[var(--surface)] text-[var(--ink)] shadow-2xs'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              All Tasks ({tasks.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('assigned-to-me')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterMode === 'assigned-to-me'
                  ? 'bg-[var(--surface)] text-[var(--ink)] shadow-2xs'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Assigned to Me ({tasks.filter((t) => t.assigneeId === currentUser.id).length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-[var(--faint)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team tasks..."
              className="w-full pl-8 pr-3 py-1.5 bg-[var(--canvas)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] placeholder-[var(--faint)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent)]/30 transition-all"
            />
          </div>
        </div>

        {/* Milestone Filter Pill Active Indicator */}
        {selectedMilestone && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-xs">
            <Flag className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="text-[var(--ink)]">
              Showing tasks in <span className="font-bold">{selectedMilestone.title}</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedMilestoneId(null)}
              className="ml-auto text-xs font-bold text-[var(--accent)] hover:underline cursor-pointer"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--muted)] space-y-2">
              <Inbox className="w-8 h-8 mx-auto text-[var(--faint)]" />
              <p>No tasks match the selected view.</p>
              {isLead && (
                <button
                  type="button"
                  onClick={() => setIsCreateTaskOpen(true)}
                  className="text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer"
                >
                  Create a task for the team
                </button>
              )}
            </div>
          ) : (
            filteredTasks.map((task) => {
              const taskMilestone = milestones.find((m) => m.id === task.milestoneId);
              return (
                <TeamTaskRow
                  key={task.id}
                  task={task}
                  milestone={taskMilestone}
                  currentUser={currentUser}
                  isLead={isLead}
                  onUpdateProgress={handleUpdateProgress}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Modals */}
      {isLead && (
        <>
          <InviteMemberModal
            isOpen={isInviteOpen}
            onClose={() => setIsInviteOpen(false)}
            teamId={team.id}
            teamName={team.name}
            inviter={currentUser}
            onInviteSent={() => {
              // Reload team
              void loadTeamData();
            }}
          />

          <TeamTaskCreateModal
            isOpen={isCreateTaskOpen}
            onClose={() => setIsCreateTaskOpen(false)}
            teamId={team.id}
            leadId={team.leadId}
            members={team.members}
            milestones={milestones}
            onTaskCreated={handleTaskCreated}
          />
        </>
      )}
    </div>
  );
};
