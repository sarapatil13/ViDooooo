# Proposal: NestJS Backend with Prisma ORM & SSE Realtime

## 1. Problem Statement & Motivation
Currently, ViDo supports two team data persistence modes:
1. `SupabaseTeamRepository`: Requires an external Supabase account, project provisioning, PostgreSQL credentials, and network connectivity.
2. `MockTeamRepository`: An offline in-memory/localStorage solution with a Vite dev server sync bridge.

The team needs a **first-class, dedicated, self-hosted backend** that provides:
- Complete architectural ownership and enterprise modularity (controllers, services, guards, DTO validation).
- **Zero-configuration local development**: Any developer or tester who clones the repository can run the frontend and backend locally with zero cloud accounts or Docker prerequisites.
- **Relational type safety**: Defined schemas, migrations, and relational integrity via Prisma ORM using local SQLite (`dev.db`), with immediate compatibility for production PostgreSQL (Neon, Supabase DB, AWS RDS, Render).
- **Realtime push notifications**: Server-Sent Events (SSE) to power the notification bell (`🔔`) and team task synchronization across all open browser tabs and incognito sessions.
- **Unified identity**: Verifying Firebase Authentication tokens from both the local Firebase Auth Emulator (`localhost:9099`) and production Firebase.

## 2. Proposed Changes
1. **Dedicated Backend Workspace (`server/`)**:
   - Create a NestJS application in `server/` with TypeScript, NestJS core, Prisma ORM, and `firebase-admin`.
2. **Prisma ORM with SQLite (Local) & PostgreSQL (Prod)**:
   - Define data models (`Team`, `TeamMember`, `TeamInvitation`, `TeamMilestone`, `TeamTask`, `Checkpoint`) in `server/prisma/schema.prisma`.
   - Use SQLite (`file:./dev.db`) for local development so cloning and running requires zero setup.
3. **Firebase Auth Integration**:
   - Implement `AuthGuard` in NestJS that decodes Firebase ID tokens passed in `Authorization: Bearer <token>`, supporting local emulator (`FIREBASE_AUTH_EMULATOR_HOST=localhost:9099`) and live Firebase.
4. **Core Domain Modules**:
   - `TeamsModule`: Create team, fetch user teams, get team details, manage members.
   - `InvitationsModule`: Send invitation by email, get pending invitations for user, accept/reject invitation with role assignment.
   - `MilestonesModule`: Create sequential phases (Lead only), update milestone statuses.
   - `TasksModule`: Create shared team tasks (Lead only), update progress and append progress checkpoints (Lead or Assignee only).
   - `EventsModule`: Server-Sent Events endpoint (`/api/events/stream`) broadcasting changes in realtime to connected clients.
5. **Frontend Client Integration**:
   - Create `NestJsTeamRepository` in `src/features/teams/NestJsTeamRepository.ts` implementing the `TeamRepository` interface.
   - Configure Vite proxy in `vite.config.ts` to route `/api/*` to NestJS running on `http://localhost:3001`.
   - Update repository factory in `src/features/teams/teamRepository.ts` to automatically prioritize NestJS API when active, while keeping `MockTeamRepository` as an offline fallback.
6. **Concurrent Developer Scripts**:
   - Add `dev:server`, `dev:all`, and `build:server` scripts in the root `package.json` so `npm run dev:all` starts both Vite and NestJS concurrently.

## 3. Non-Goals & Boundaries
- We are **not** removing Firebase Auth or replacing the existing client auth context. Firebase remains the identity provider.
- We are **not** breaking existing `MockTeamRepository` tests or interactive preview mode (`/preview`).
- We are **not** restructuring the frontend into a nested monorepo; the frontend remains at the root and `src/` to prevent path breakages and maintain strict `FOLDER_STRUCTURE.md` adherence.
