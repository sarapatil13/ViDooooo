import React, { useState } from 'react';
import { Flag, CheckCircle2, Circle, Clock, Plus, UserPlus, Users, ShieldCheck } from 'lucide-react';
import { Team, TeamMilestone, MilestoneStatus, UserProfile } from './types';
import { Button } from '../../components/ui';

export interface TeamHeaderProps {
  team: Team;
  currentUser: UserProfile;
  onInviteClick?: () => void;
}

export const TeamHeader: React.FC<TeamHeaderProps> = ({
  team,
  currentUser,
  onInviteClick,
}) => {
  const isLead = team.leadId === currentUser.id;

  return (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
              {team.name}
            </h2>
            {isLead ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30">
                <ShieldCheck className="w-3 h-3" /> Team Lead
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20">
                Member
              </span>
            )}
          </div>
          {team.description && (
            <p className="text-xs text-[var(--muted)] mt-1.5 max-w-2xl">
              {team.description}
            </p>
          )}
        </div>

        {/* Action Button: Invite Member (Visible to Lead) */}
        {isLead && onInviteClick && (
          <Button
            variant="primary"
            size="sm"
            onClick={onInviteClick}
            className="self-start md:self-auto gap-1.5 shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Member</span>
          </Button>
        )}
      </div>

      {/* Roster & Members Info */}
      <div className="mt-5 pt-4 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[var(--muted)] font-medium flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Roster ({team.members.length}):
          </span>
          <div className="flex items-center -space-x-1.5">
            {team.members.map((member) => (
              <div
                key={member.userId}
                title={`${member.name} (${member.email}) - ${member.role}`}
                className="w-7 h-7 rounded-full bg-[var(--canvas)] border border-[var(--line)] text-[var(--ink)] font-bold text-[10px] flex items-center justify-center uppercase shadow-2xs"
              >
                {member.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-[var(--muted)] font-mono">
          Lead: <span className="text-[var(--ink)] font-medium">{team.leadEmail}</span>
        </div>
      </div>
    </div>
  );
};

export interface MilestoneRoadmapProps {
  milestones: TeamMilestone[];
  selectedMilestoneId?: string | null;
  onSelectMilestone?: (milestoneId: string | null) => void;
  isLead?: boolean;
  onAddMilestone?: (title: string, targetDate: string) => Promise<void>;
  onUpdateMilestoneStatus?: (milestoneId: string, status: MilestoneStatus) => Promise<void>;
}

export const MilestoneRoadmap: React.FC<MilestoneRoadmapProps> = ({
  milestones,
  selectedMilestoneId,
  onSelectMilestone,
  isLead = false,
  onAddMilestone,
  onUpdateMilestoneStatus,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedMilestones = [...milestones].sort((a, b) => a.orderIndex - b.orderIndex);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTargetDate.trim() || !onAddMilestone) return;

    try {
      setIsSubmitting(true);
      await onAddMilestone(newTitle.trim(), newTargetDate.trim());
      setNewTitle('');
      setNewTargetDate('');
      setIsAdding(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: MilestoneStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> Active Phase
          </span>
        );
      case 'upcoming':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 rounded-full">
            <Circle className="w-3 h-3" /> Upcoming
          </span>
        );
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-2">
            <Flag className="w-4 h-4 text-[var(--accent)]" />
            <span>Phased Milestone Roadmap</span>
          </h3>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Sequential project goals and release milestones
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedMilestoneId && onSelectMilestone && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onSelectMilestone(null)}
              className="text-xs"
            >
              Show All Phases
            </Button>
          )}

          {isLead && onAddMilestone && !isAdding && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAdding(true)}
              className="gap-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Phase</span>
            </Button>
          )}
        </div>
      </div>

      {/* Add Milestone Inline Form */}
      {isAdding && (
        <form
          onSubmit={handleAddSubmit}
          className="mt-4 p-4 rounded-xl bg-[var(--canvas)] border border-[var(--line)] space-y-3 animate-in fade-in duration-150"
        >
          <div className="text-xs font-bold text-[var(--ink)]">Add Project Milestone Phase</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="milestone-title" className="block text-[11px] font-semibold text-[var(--muted)] mb-1">
                Milestone Title
              </label>
              <input
                id="milestone-title"
                type="text"
                placeholder="e.g., Phase 3: Launch Readiness"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-xs text-[var(--ink)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent)]/30"
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="milestone-date" className="block text-[11px] font-semibold text-[var(--muted)] mb-1">
                Target Delivery Date
              </label>
              <input
                id="milestone-date"
                type="date"
                value={newTargetDate}
                onChange={(e) => setNewTargetDate(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-xs text-[var(--ink)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent)]/30"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsAdding(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || !newTitle.trim() || !newTargetDate.trim()}
            >
              {isSubmitting ? 'Saving...' : 'Save Milestone'}
            </Button>
          </div>
        </form>
      )}

      {/* Milestone Cards Horizontal Grid */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
        {sortedMilestones.length === 0 ? (
          <div className="col-span-3 text-center py-6 text-xs text-[var(--muted)] italic">
            No milestones configured yet.
          </div>
        ) : (
          sortedMilestones.map((milestone, idx) => {
            const isSelected = selectedMilestoneId === milestone.id;
            return (
              <div
                key={milestone.id}
                tabIndex={0}
                aria-label={`Milestone phase ${idx + 1}: ${milestone.title}`}
                onClick={() => onSelectMilestone?.(isSelected ? null : milestone.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectMilestone?.(isSelected ? null : milestone.id);
                  }
                }}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[var(--accent)]/5 border-[var(--accent)] shadow-xs ring-1 ring-[var(--accent)]'
                    : 'bg-[var(--canvas)] border-[var(--line)] hover:border-[var(--ink)]/30'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--muted)]">
                    Phase {idx + 1}
                  </span>
                  {getStatusBadge(milestone.status)}
                </div>

                <div className="text-xs font-bold text-[var(--ink)] line-clamp-1">
                  {milestone.title}
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--muted)]">
                  <span>Target: {milestone.targetDate}</span>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-[var(--accent)]">
                      Filtering Tasks
                    </span>
                  )}
                </div>

                {/* Lead Status Toggle Actions */}
                {isLead && onUpdateMilestoneStatus && (
                  <div
                    className="mt-3 pt-2.5 border-t border-[var(--line)]/60 flex items-center justify-between gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[10px] text-[var(--muted)]">Status:</span>
                    <div className="flex items-center gap-1">
                      {milestone.status !== 'active' && (
                        <button
                          type="button"
                          onClick={() => onUpdateMilestoneStatus(milestone.id, 'active')}
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/15 text-sky-700 dark:text-sky-300 hover:bg-sky-500/25 cursor-pointer"
                        >
                          Set Active
                        </button>
                      )}
                      {milestone.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={() => onUpdateMilestoneStatus(milestone.id, 'completed')}
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 cursor-pointer"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
