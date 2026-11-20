# Tasks

## 1. Team Repository & Dual-Mode Data Layer

- [x] 1.1 Define team domain types and `TeamRepository` interface in `src/features/teams/types.ts` and `src/features/teams/teamRepository.ts`. Verify typecheck passes with `npm run typecheck`.
- [x] 1.2 Implement `MockTeamRepository` supporting offline team CRUD, email invitations, milestone definitions, and local task assignment. Verify unit tests pass in `src/features/teams/MockTeamRepository.test.ts`.
- [x] 1.3 Implement `SupabaseTeamRepository` client connecting to Supabase PostgreSQL and Realtime, with automatic fallback to `MockTeamRepository` when credentials are absent. Verify unit tests pass in `src/features/teams/teamRepository.test.ts`.

## 2. Team Invitations & Notification Bell

- [x] 2.1 Implement `NotificationBell` component with active badge indicator and invitation dropdown menu in `src/features/teams/NotificationBell.tsx`. Verify unit tests pass in `src/features/teams/NotificationBell.test.tsx`.
- [x] 2.2 Wire `NotificationBell` into `WorkspaceTopBar.tsx` and integrate real-time invitation subscription for the authenticated user's email. Verify integration tests pass in `src/features/workspace/WorkspaceTopBar.test.tsx`.
- [x] 2.3 Implement Invite Member modal with email validation and duplicate checking in `src/features/teams/InviteMemberModal.tsx`. Verify unit tests pass in `src/features/teams/InviteMemberModal.test.tsx`.

## 3. Unified Sidebar & Team Navigation

- [x] 3.1 Update `WorkspaceSidebar.tsx` to render the `👥 TEAMS & SHARED PROJECTS` section below personal views, with an active team list and "+ Create Team" trigger. Verify sidebar tests pass in `src/features/workspace/WorkspaceSidebar.test.tsx`.
- [x] 3.2 Implement `CreateTeamModal` dialog allowing users to create a team and automatically become Team Lead. Verify unit tests pass in `src/features/teams/CreateTeamModal.test.tsx`.
- [x] 3.3 Register dynamic team workspace routes (`/workspace/team/:teamId/*` and `/preview/team/:teamId/*`) in `WorkspaceLayout.tsx`. Verify routing tests pass in `src/features/workspace/WorkspaceViewsAndModals.test.tsx`.

## 4. Phased Milestones & Team Space Dashboard

- [x] 4.1 Implement `TeamHeader` and `MilestoneRoadmap` components displaying common project goal, phase status badges, and Lead milestone creation in `src/features/teams/MilestoneRoadmap.tsx`. Verify tests pass in `src/features/teams/MilestoneRoadmap.test.tsx`.
- [x] 4.2 Implement `TeamSpaceView` rendering the team roadmap, member avatars, and task backlog in `src/features/teams/TeamSpaceView.tsx`. Verify view tests pass in `src/features/teams/TeamSpaceView.test.tsx`.

## 5. Shared Task Creation & Lead-Driven Permissions

- [x] 5.1 Implement `TeamTaskCreateModal` with milestone selector and member assignee dropdown, restricted to Team Lead. Verify unit tests pass in `src/features/teams/TeamTaskCreateModal.test.tsx`.
- [x] 5.2 Implement `TeamTaskRow` showing assignee avatar/initials, milestone badge, and progress controls. Enforce that only the assigned member or lead can update progress and checkpoints. Verify unit tests pass in `src/features/teams/TeamTaskRow.test.tsx`.
- [x] 5.3 Implement team filter controls ("All Tasks", "Assigned to Me", and milestone filter) in `TeamSpaceView`. Verify filtering unit tests pass.

## 6. End-to-End Verification & Documentation

- [x] 6.1 Add end-to-end integration test exercising the full team lifecycle (create team, invite by email, accept invitation, create milestone, assign task, update progress) in `src/features/teams/TeamLifecycle.test.tsx`. Verify all tests pass with `npm test`.
- [x] 6.2 Update `README.md` and `FOLDER_STRUCTURE.md` documenting team spaces, offline testing, and optional Supabase environment variables. Verify documentation accurately links to specs.
- [x] 6.3 Run full pre-commit verification suite (`npm run typecheck && npm test && npm run build`) and confirm 0 errors.
