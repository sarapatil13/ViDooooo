import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  BarChart3,
  Palette,
  Plus,
  LogOut,
  Users,
  ChevronDown,
  Clock,
  AlertCircle,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui';
import { Team } from '../teams/types';

export interface WorkspaceSidebarProps {
  isPreview?: boolean;
  basePath?: string;
  user?: {
    id?: string;
    name: string;
    email?: string;
  };
  counts: {
    total?: number;
    today: number;
    needsAttention: number;
    upcoming: number;
    completed: number;
    archived: number;
  };
  teams?: Team[];
  onNewTaskClick?: () => void;
  onCreateTeamClick?: () => void;
  onSignOut?: () => void;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  isPreview = true,
  basePath = '/preview',
  user,
  counts,
  teams = [],
  onNewTaskClick,
  onCreateTeamClick,
  onSignOut,
}) => {
  const location = useLocation();

  const totalTasks =
    counts.total ?? counts.today + counts.upcoming + counts.needsAttention;

  const dashboardPath = basePath;
  const tasksPath = `${basePath}/tasks`;
  const calendarPath = `${basePath}/calendar`;
  const analyticsPath = `${basePath}/analytics`;

  const isTaskRoute =
    location.pathname === tasksPath ||
    location.pathname.startsWith(`${tasksPath}/`) ||
    location.pathname === `${basePath}/today` ||
    location.pathname === `${basePath}/upcoming` ||
    location.pathname === `${basePath}/needs-attention` ||
    location.pathname === `${basePath}/completed` ||
    location.pathname === `${basePath}/archived`;

  const [isTasksOpen, setIsTasksOpen] = useState(isTaskRoute);

  useEffect(() => {
    if (isTaskRoute) {
      setIsTasksOpen(true);
    }
  }, [isTaskRoute]);

  const taskSubItems = [
    {
      label: 'All Tasks',
      path: tasksPath,
      icon: CheckSquare,
      iconColor: 'text-emerald-400',
      count: totalTasks,
    },
    {
      label: "Today's Tasks",
      path: `${basePath}/today`,
      icon: Clock,
      iconColor: 'text-[var(--accent)]',
      count: counts.today,
    },
    {
      label: 'Upcoming',
      path: `${basePath}/upcoming`,
      icon: Calendar,
      iconColor: 'text-indigo-400',
      count: counts.upcoming,
    },
    {
      label: 'Needs Attention',
      path: `${basePath}/needs-attention`,
      icon: AlertCircle,
      iconColor: 'text-amber-400',
      count: counts.needsAttention,
    },
    {
      label: 'Completed',
      path: `${basePath}/completed`,
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      count: counts.completed,
    },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-white/15 text-white shadow-xs'
        : 'text-gray-300 hover:bg-white/8 hover:text-white'
    }`;

  return (
    <aside
      aria-label="Workspace navigation"
      className={`w-64 bg-[var(--dark)] text-gray-200 flex flex-col justify-between shrink-0 sticky ${
        isPreview ? 'top-[45px] h-[calc(100vh-45px)]' : 'top-0 h-screen'
      } overflow-y-auto p-5 select-none`}
    >
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6 px-1">
          <div className="w-9 h-9 rounded-xl bg-white text-[var(--dark)] flex items-center justify-center font-black text-base shadow-sm">
            V
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white tracking-tight block">ViDo</span>
              {isPreview ? (
                <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-amber-950 shadow-xs">
                  DEMO
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 text-white border border-white/20">
                  WORKSPACE
                </span>
              )}
            </div>
            <span className="text-[10px] text-amber-300/90 font-medium tracking-wide block">
              {isPreview ? 'Logged-in demo preview' : user?.name || 'Personal Workspace'}
            </span>
          </div>
        </div>

        {/* Quick New Task Button */}
        {onNewTaskClick && (
          <div className="mb-6">
            <Button
              variant="primary"
              size="sm"
              onClick={onNewTaskClick}
              className="w-full justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> New Task
            </Button>
          </div>
        )}

        <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2 px-2.5">
          Workspace
        </div>
        <nav className="space-y-1">
          <NavLink to={dashboardPath} end className={linkClass}>
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 text-[var(--accent)]" />
              <span>Dashboard</span>
            </div>
          </NavLink>

          <div>
            <NavLink
              to={tasksPath}
              onClick={() => setIsTasksOpen(true)}
              className={() =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isTaskRoute
                    ? 'bg-white/15 text-white shadow-xs'
                    : 'text-gray-300 hover:bg-white/8 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>Tasks</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-200 font-bold">
                  {totalTasks}
                </span>
                <button
                  type="button"
                  aria-label={isTasksOpen ? 'Collapse task views' : 'Expand task views'}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsTasksOpen((prev) => !prev);
                  }}
                  className="p-0.5 text-gray-400 hover:text-white rounded transition-colors cursor-pointer"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isTasksOpen ? 'rotate-0' : '-rotate-90'
                    }`}
                  />
                </button>
              </div>
            </NavLink>

            {isTasksOpen && (
              <div className="space-y-0.5 mt-1 mb-1 pl-3 border-l border-white/10 ml-4.5 animate-in fade-in slide-in-from-top-1 duration-150">
                {taskSubItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end
                    className={({ isActive }) =>
                      `flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                        isActive
                          ? 'bg-white/12 text-white font-bold shadow-2xs'
                          : 'text-gray-400 hover:bg-white/6 hover:text-gray-200 font-medium'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2 truncate">
                      <item.icon className={`w-3.5 h-3.5 shrink-0 ${item.iconColor}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 font-semibold shrink-0 ml-1">
                      {item.count}
                    </span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2 mt-6 px-2.5">
          Planning
        </div>
        <nav className="space-y-1">
          <NavLink to={calendarPath} className={linkClass}>
            <div className="flex items-center gap-2.5">
              <CalendarDays className="w-4 h-4 text-indigo-400" />
              <span>Calendar</span>
            </div>
          </NavLink>

          <NavLink to={analyticsPath} className={linkClass}>
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Analytics</span>
            </div>
          </NavLink>
        </nav>

        {/* Teams & Shared Projects Section */}
        <div className="mt-6">
          <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2 px-2.5">
            Teams & Shared Projects
          </div>

          <div className="space-y-1">
            {teams && teams.length > 0 ? (
              teams.map((team) => (
                <NavLink
                  key={team.id}
                  to={`${basePath}/team/${team.id}`}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white/15 text-white shadow-xs'
                        : 'text-gray-300 hover:bg-white/8 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Users className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="truncate">{team.name}</span>
                  </div>
                  {team.leadId === (user?.id || 'demo-user-1') && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-sky-500/20 text-sky-300 rounded font-bold shrink-0">
                      LEAD
                    </span>
                  )}
                </NavLink>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-gray-400 italic">No teams yet</div>
            )}

            {onCreateTeamClick && (
              <button
                type="button"
                onClick={onCreateTeamClick}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:bg-white/8 hover:text-white transition-colors cursor-pointer text-left"
              >
                <Plus className="w-3.5 h-3.5 text-sky-400" />
                <span>Create Team</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
        {!isPreview && (
          <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-white font-bold text-xs flex items-center justify-center shrink-0">
                {(user?.name || 'Alex Morgan')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-white block truncate">
                  {user?.name || 'Alex Morgan'}
                </span>
                <span className="text-[10px] text-gray-400 block truncate">
                  {user?.email || 'alex.morgan@gmail.com'}
                </span>
              </div>
            </div>
          </div>
        )}

        <Link
          to="/style-lab"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Palette className="w-4 h-4" />
          <span>Themes</span>
        </Link>

        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-red-300 hover:bg-white/5 transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
};
