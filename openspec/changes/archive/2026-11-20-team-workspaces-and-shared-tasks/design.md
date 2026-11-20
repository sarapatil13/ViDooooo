# Design: team-workspaces-and-shared-tasks

## Context

See `proposal.md` for motivation. Currently, ViDo uses Firebase Auth for Google OAuth and stores private tasks in browser `localStorage` keyed by `vido_tasks_${user.uid}`. Collaborative team coordination requires sharing state across different authenticated users, tracking invitations by email, grouping tasks by project milestones, and delivering in-app notification alerts.

## Goals / Non-Goals

**Goals:**
- **Dual-Mode Team Repository**: Provide an offline, zero-credential client-side repository for frictionless local testing and CI (`npm run dev`, `npm test`), while integrating with Supabase PostgreSQL and Realtime for production multi-device synchronization.
- **Unified Sidebar Navigation**: Place the `👥 TEAMS & SHARED PROJECTS` section directly in the persistent left sidebar beneath personal views.
- **Email-Based Invitations & Notifications**: Enable Team Leads to invite members via email address and deliver in-app notifications with Accept/Reject actions via top-bar notification bell (`🔔`).
- **Phased Milestones**: Structure team projects into sequential milestone phases with deadline tracking.
- **Lead-Driven Permissions**: Enforce strict authority where Team Leads manage team structure, milestones, and task assignments, while team members can update progress (0–100%) and add checkpoints only on tasks assigned to them.

**Non-Goals:**
- Outbound third-party email delivery (SMTP/SendGrid/Resend) for external invite emails; invitations are tracked in-app based on the user's authenticated Google email.
- Real-time chat, threaded comments, or video huddles within tasks.
- Granular custom role matrices (e.g., Admin, Viewer, Guest); the team model uses only **Team Lead** and **Team Member**.
- Replacing private task storage; personal tasks remain private in local storage.

## Decisions

### 1. Hybrid Backend Architecture (Firebase Auth + Supabase PostgreSQL & Realtime)
- **Decision**: Retain Firebase Auth for user authentication (preserving local Auth emulator support and existing Google sign-in) while using Supabase PostgreSQL for collaborative team data and Realtime WebSocket notifications.
- **Rationale**: PostgreSQL offers robust relational integrity, foreign-key cascades, and Row-Level Security (RLS) for team boundaries, while Supabase Realtime enables instant notification badge updates without polling.
- **Alternatives Considered**:
  - *Cloud Firestore*: Would keep everything under Firebase, but relational schemas (teams, memberships, milestones, tasks) and cascade constraints are more natural and strictly typed in SQL.
  - *Custom Node/Express backend*: Adds significant hosting, server maintenance, and operational overhead.

### 2. Dual-Mode Storage via TeamRepository Interface
- **Decision**: Abstract all team, invitation, milestone, and task operations behind a clean `TeamRepository` interface:
  ```typescript
  export interface TeamRepository {
    getTeams(userId: string): Promise<Team[]>;
    createTeam(name: string, description: string, lead: UserProfile): Promise<Team>;
    getInvitations(userEmail: string): Promise<TeamInvitation[]>;
    sendInvitation(teamId: string, teamName: string, inviter: UserProfile, inviteeEmail: string): Promise<TeamInvitation>;
    respondToInvitation(invitationId: string, accept: boolean, user: UserProfile): Promise<void>;
    getMilestones(teamId: string): Promise<TeamMilestone[]>;
    createMilestone(teamId: string, title: string, targetDate: string, orderIndex: number): Promise<TeamMilestone>;
    getTeamTasks(teamId: string): Promise<TeamTask[]>;
    createTeamTask(task: Omit<TeamTask, 'id' | 'createdAt'>): Promise<TeamTask>;
    updateTeamTaskProgress(taskId: string, progress: number, checkpointText?: string, user?: UserProfile): Promise<TeamTask>;
    subscribeToInvitations(userEmail: string, onUpdate: (invites: TeamInvitation[]) => void): () => void;
  }
  ```
- **Implementation**:
  - `MockTeamRepository`: In-memory and local-storage backed mock providing preloaded test personas (e.g. Alex Morgan, Sarah Chen, Marcus Vance) and reactive simulated invitations. Activated automatically when `VITE_SUPABASE_URL` is omitted.
  - `SupabaseTeamRepository`: Production client connecting to Supabase PostgreSQL and Realtime channels.
- **Rationale**: Anyone cloning the repository can run `npm run dev` and test full team creation, invitation flows, and milestone task assignments with zero external credentials.

### 3. Unified Sidebar Layout over Modal Workspace Switcher
- **Decision**: Integrate team spaces directly into `WorkspaceSidebar.tsx` beneath the personal views section rather than introducing a global workspace switcher modal or dropdown.
- **Rationale**: Matches ViDo's calm visual hierarchy, allowing users to see their personal agenda (*Today*, *Upcoming*) and active team commitments (*Alpha Launch*, *Sprint 4*) in one glance without modal disorientation.
- **Alternatives Considered**: Global workspace switcher dropdown in the top header. Rejected because it hides personal context while working in a team space.

### 4. Phased Milestones with Derived Roadmap Status
- **Decision**: Represent project goals as sequential milestone phases (`team_milestones`) with title, target date, and status. Tasks created within a team space link to an active milestone.
- **Rationale**: Teams need shared structure beyond flat to-do lists. Grouping tasks by milestone allows teams to understand current progress toward the active phase.

### 5. Lead-Driven Permissions Matrix
- **Decision**:
  - **Team Lead**: Creator of the team. Has full CRUD over team settings, milestones, member invitations, and task assignments.
  - **Team Member**: Accepted invitee. Can view all team tasks and milestones. Can update progress percentage (0–100%), add checkpoints, and mark completion **only** on tasks assigned to them (`assigneeId === authUser.uid`).
- **Rationale**: Preserves accountability and prevents members from accidentally modifying or completing deliverables assigned to teammates.

## Database Schema (Production Supabase)

```sql
-- Users cache
CREATE TABLE users (
  id TEXT PRIMARY KEY, -- Firebase Auth UID
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Teams
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  lead_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Team Members
CREATE TABLE team_members (
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('lead', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);

-- Team Invitations
CREATE TABLE team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  inviter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  inviter_email TEXT NOT NULL,
  inviter_name TEXT NOT NULL,
  invitee_email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_invitations_email ON team_invitations(invitee_email, status);

-- Team Milestones
CREATE TABLE team_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'active', 'completed')),
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Team Tasks
CREATE TABLE team_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES team_milestones(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMPTZ NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low', 'none')),
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'archived')),
  progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  assignee_name TEXT,
  assignee_email TEXT,
  lead_id TEXT NOT NULL REFERENCES users(id),
  checkpoints JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Risks / Trade-offs

- **[Email Normalization]** → Mitigation: All email matching (invitations, user logins) must convert input strings to lowercase and trimmed format (`email.trim().toLowerCase()`) to prevent invite mismatches.
- **[Inviting Unregistered Users]** → Mitigation: Pending invitations are stored by target email address. When a user logs in for the first time with that Google account, the app queries `team_invitations` by their authenticated email and surfaces the pending invites immediately.
- **[Zero-Credential Local Development]** → Mitigation: When `VITE_SUPABASE_URL` is omitted, the app defaults to `MockTeamRepository`, enabling all features locally without external accounts or network connectivity.

## Migration Plan

1. Create Supabase database tables and RLS security policies.
2. Add optional environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in `.env.example`.
3. Support zero-configuration fallback so existing test suites and development commands continue to pass out-of-the-box.
