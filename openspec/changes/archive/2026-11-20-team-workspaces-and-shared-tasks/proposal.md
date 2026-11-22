# Proposal: team-workspaces-and-shared-tasks

## Why

ViDo currently provides an isolated personal workspace where tasks are scoped strictly to individual user IDs. To fulfill the product vision of shared coordination, teams need a dedicated collaborative space to align on common goals, organize work into phased milestones, invite collaborators by email, and assign tasks with clear ownership—all while preserving a calm, distraction-free environment.

## What Changes

- **Unified Sidebar Team Spaces**: Introduces a dedicated `👥 TEAMS & SHARED PROJECTS` section in the persistent sidebar below personal views, enabling seamless switching without modal context switching.
- **Team Creation & Role Management**: Authenticated users can create team spaces, becoming the **Team Lead**. Team Leads manage project settings, milestones, and member rosters.
- **Email Invitations & Notification Center**: Team Leads can invite members via Google email address. A top-bar notification bell (`🔔`) displays pending team invitations with instant **Accept** and **Reject** actions.
- **Phased Project Milestones**: Team Leads can organize projects into structured phases (e.g., *Phase 1: Planning*, *Phase 2: Core Build*, *Phase 3: Launch*).
- **Shared Tasks with User Assignment**: Team Leads can create tasks tagged to specific milestones and assign them to accepted team members or leave them unassigned.
- **Lead-Driven Permission Model**:
  - Team Leads can create, edit, reassign, and delete any task or milestone.
  - Team Members have full visibility into all team tasks and milestones, but can update progress (0–100%) and mark completion **only** on tasks assigned to them.
- **Hybrid Storage with Zero-Friction Local Testing**:
  - **Local Development / Offline Testing**: When cloned without cloud credentials, ViDo automatically uses a client-side mock team store (supporting simulated multi-persona invitations and team switching) so developers and testers can test the complete team lifecycle locally with zero external setup.
  - **Production Backend**: When configured with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, ViDo connects to Supabase PostgreSQL and Supabase Realtime for cross-device synchronization and instant notification delivery.

## Capabilities

### New Capabilities
- `team-workspaces`: Creating team spaces, managing team members, defining phased project milestones, and email-based invitations with in-app notification alerts (Accept/Reject).
- `shared-task-coordination`: Collaborative task management within team spaces, milestone association, user assignment, and lead-driven permissions where assignees update their own deliverables.

### Modified Capabilities
- `workspace-shell`: Updates the workspace shell layout to include the notification bell in the top utility bar and host the team spaces section in the persistent sidebar.

## Impact

- **Frontend Architecture**:
  - New feature slice: `src/features/teams/` for team views, milestone trackers, member modals, and invitation notifications.
  - Updates to `WorkspaceSidebar.tsx` and `WorkspaceTopBar.tsx`.
- **Data & Storage Layer**:
  - Dual-mode team repository (`src/features/teams/teamRepository.ts`) providing an in-memory/localStorage mock adapter for zero-credential local testing, and a Supabase client adapter for production.
- **Dependencies**:
  - Optional production dependency on `@supabase/supabase-js`.
- **Security & Rules**:
  - Supabase PostgreSQL schema with Row-Level Security (RLS) policies enforcing lead-driven rules in production.
