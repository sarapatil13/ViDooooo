# Tasks: NestJS Backend with Prisma ORM & SSE Realtime

## 1. Server Project Initialization & NestJS Setup
- [x] 1.1 Create `server/` directory and configure `server/package.json` with NestJS core packages, `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, and TypeScript dev dependencies.
- [x] 1.2 Configure `server/tsconfig.json` with decorator support and path aliases.
- [x] 1.3 Add root orchestration scripts in `package.json` (`dev:server`, `dev:all`, `build:server`) and configure `concurrently`.

## 2. Prisma ORM Modeling & Local SQLite Storage
- [x] 2.1 Install Prisma CLI and client in `server/`, define schema in `server/prisma/schema.prisma` with SQLite datasource (`file:./dev.db`).
- [x] 2.2 Create `PrismaService` in `server/src/prisma/prisma.service.ts` managing client connection and lifecycle.
- [x] 2.3 Run initial Prisma migration (`prisma db push` or `prisma migrate dev`) creating `Team`, `TeamMember`, `TeamInvitation`, `TeamMilestone`, `TeamTask`, and `TaskCheckpoint` tables.

## 3. Firebase AuthGuard & Identity Verification
- [x] 3.1 Install `firebase-admin` in `server/` and implement `FirebaseAdminService` in `server/src/auth/firebase-admin.service.ts` auto-detecting `FIREBASE_AUTH_EMULATOR_HOST` (default `127.0.0.1:9099`).
- [x] 3.2 Implement `FirebaseAuthGuard` in `server/src/auth/auth.guard.ts` decoding Bearer tokens and attaching `req.user` (`uid`, `email`, `name`).
- [x] 3.3 Add custom `@CurrentUser()` decorator in `server/src/auth/current-user.decorator.ts`.

## 4. Domain Modules Implementation (Teams, Invites, Milestones, Tasks)
- [x] 4.1 Implement `TeamsModule`, `TeamsController`, and `TeamsService` in `server/src/teams/` supporting team creation, member lookup, and permission validation.
- [x] 4.2 Implement `InvitationsModule` in `server/src/invitations/` supporting invite creation, pending invite lookup by email, and accept/reject response with member insertion.
- [x] 4.3 Implement `MilestonesModule` in `server/src/milestones/` supporting phased milestone creation and status updating (Lead only).
- [x] 4.4 Implement `TasksModule` in `server/src/tasks/` supporting milestone-linked task creation (Lead only) and progress/checkpoint logging (Lead or Assignee only).

## 5. Realtime Server-Sent Events (SSE)
- [x] 5.1 Implement `EventsService` and `EventsController` in `server/src/events/` providing `/api/events/stream` with an RxJS `Subject<MessageEvent>`.
- [x] 5.2 Wire event broadcasts into team invitations, task updates, and milestone modifications.

## 6. Frontend Integration & Dual-Mode Adapter
- [x] 6.1 Update `vite.config.ts` proxy configuration to forward `/api` requests to `http://localhost:3001`.
- [x] 6.2 Implement `NestJsTeamRepository` in `src/features/teams/NestJsTeamRepository.ts` implementing `TeamRepository` using `fetch` and browser `EventSource`.
- [x] 6.3 Update `src/features/teams/teamRepository.ts` to connect to `NestJsTeamRepository` when available, retaining `MockTeamRepository` as an offline fallback.

## 7. Verification & Documentation
- [x] 7.1 Verify frontend unit tests, typecheck, and build pass (`npm run typecheck && npm test && npm run build`).
- [x] 7.2 Verify NestJS build and compilation pass (`npm run build:server`).
- [x] 7.3 Update `README.md` and `FOLDER_STRUCTURE.md` documenting the `server/` architecture, zero-setup local dev workflow, and production PostgreSQL configuration.
