# Capability Specification: NestJS Backend & Prisma Integration

## Requirement 1: Dedicated Backend Architecture & Zero-Config Setup
The system SHALL provide a dedicated NestJS backend application in the `server/` directory.
- The backend MUST compile with TypeScript and run on port 3001.
- In development mode, the backend MUST use Prisma ORM with a local file-based SQLite database (`server/prisma/dev.db`) requiring no external database service or cloud account.
- The root `package.json` MUST provide unified scripts: `npm run dev:server` to run NestJS alone, and `npm run dev:all` to run Vite and NestJS concurrently.

### Scenario 1.1: Local Developer Clone & Boot
- **Given** a developer has cloned the repository with no external cloud credentials
- **When** the developer runs `npm run dev:all`
- **Then** the Vite frontend starts on port 5173, the NestJS backend starts on port 3001, the SQLite database is initialized, and requests to `/api/*` succeed without error.

---

## Requirement 2: Firebase Token Authentication
The NestJS backend SHALL verify Firebase ID tokens passed in the `Authorization: Bearer <token>` HTTP header.
- The `AuthGuard` MUST decode the token to identify the caller (`uid`, `email`, `name`).
- In local development, the `AuthGuard` MUST verify tokens against the local Firebase Auth Emulator running at `127.0.0.1:9099`.
- In production, the `AuthGuard` MUST verify tokens against live Firebase Authentication.
- Unauthenticated requests to protected endpoints MUST return HTTP 401 Unauthorized.

### Scenario 2.1: Protected Endpoint Access
- **Given** an unauthenticated client request to `GET /api/teams`
- **When** the request does not provide a valid Bearer token
- **Then** the server responds with HTTP 401 Unauthorized.

---

## Requirement 3: Realtime Server-Sent Events (SSE)
The NestJS backend SHALL provide an SSE stream at `GET /api/events/stream` to broadcast team, invitation, and task lifecycle events.
- When a Team Lead invites a member, the server MUST broadcast an `invitation.created` event containing the invite payload.
- When an invitee accepts an invitation, the server MUST broadcast an `invitation.accepted` event and a `team.member_joined` event.
- Connected frontend clients MUST receive the event and update relevant UI components (Notification Bell, Team Member Roster) without requiring page reloads.

### Scenario 3.1: Live Notification Delivery
- **Given** Account A (Team Lead) and Account B (Invitee) have active sessions connected to the SSE stream
- **When** Account A invites Account B by email
- **Then** Account B's client receives the SSE event within 1000ms and lights up the notification bell with the pending invite.

---

## Requirement 4: Role-Based Team Permissions
The NestJS backend SHALL enforce role-based permissions on shared project resources:
- Only the Team Lead SHALL be permitted to invite members, create milestones, modify milestone status, or create shared tasks.
- Non-lead members attempting to perform Lead actions MUST receive HTTP 403 Forbidden.
- Only the assigned team member or the Team Lead SHALL be permitted to update task progress or append progress checkpoints.
- Other team members attempting to update progress MUST receive HTTP 403 Forbidden.

### Scenario 4.1: Member Prevented from Creating Milestone
- **Given** a user who is a regular member (not Lead) of a team
- **When** the user sends a `POST /api/teams/:id/milestones` request
- **Then** the server rejects the request with HTTP 403 Forbidden.

---

## Requirement 5: Dual-Mode Frontend Fallback
The frontend `TeamRepository` factory SHALL gracefully integrate the NestJS backend:
- When the NestJS API is reachable (or `VITE_API_URL` is set), `teamRepository.ts` MUST return an instance of `NestJsTeamRepository`.
- If the NestJS backend is unreachable or the application is loaded in static preview mode (`/preview`), the application MUST seamlessly fall back to `MockTeamRepository` without crashing or blocking the user interface.
