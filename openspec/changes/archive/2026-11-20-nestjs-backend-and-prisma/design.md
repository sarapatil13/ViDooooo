# Design: NestJS Backend with Prisma ORM & SSE Realtime

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       ViDo Frontend                         │
│            (React + Vite + Tailwind v4 :5173)               │
│                                                             │
│   src/features/teams/                                       │
│   ├── teamRepository.ts (Factory)                           │
│   ├── NestJsTeamRepository.ts (HTTP Fetch + EventSource)    │
│   └── MockTeamRepository.ts (Offline Fallback)              │
└───────────────┬──────────────────────────────▲──────────────┘
                │ HTTP Requests                │ Server-Sent Events (SSE)
                │ (/api/*)                     │ (/api/events/stream)
                ▼                              │
┌──────────────────────────────────────────────┴──────────────┐
│                    NestJS Application                       │
│                     (server/ :3001)                         │
│                                                             │
│  ├── Main / AppModule                                       │
│  ├── AuthGuard (Firebase ID token decoder via firebase-admin)│
│  ├── TeamsModule & Controller                               │
│  ├── InvitationsModule & Controller                         │
│  ├── MilestonesModule & Controller                          │
│  ├── TasksModule & Controller                               │
│  ├── EventsModule & Controller (Observable SSE subject)     │
│  └── PrismaService (PrismaClient lifecycle)                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Prisma Data Storage                      │
│                                                             │
│   • Local Dev:   SQLite file (server/prisma/dev.db)         │
│   • Production:  PostgreSQL (DATABASE_URL connection)       │
└─────────────────────────────────────────────────────────────┘
```

## 2. Prisma Database Schema (`server/prisma/schema.prisma`)

```prisma
datasource db {
  provider = "sqlite" // production switches to "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Team {
  id          String           @id @default(uuid())
  name        String
  description String
  leadId      String
  leadEmail   String
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  members     TeamMember[]
  invitations TeamInvitation[]
  milestones  TeamMilestone[]
  tasks       TeamTask[]
}

model TeamMember {
  id        String   @id @default(uuid())
  teamId    String
  team      Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  userId    String
  email     String
  name      String
  role      String   // "lead" | "member"
  joinedAt  DateTime @default(now())

  @@unique([teamId, userId])
}

model TeamInvitation {
  id           String   @id @default(uuid())
  teamId       String
  team         Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  teamName     String
  inviterId    String
  inviterName  String
  inviterEmail String
  inviteeEmail String
  status       String   @default("pending") // "pending" | "accepted" | "rejected"
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model TeamMilestone {
  id         String     @id @default(uuid())
  teamId     String
  team       Team       @relation(fields: [teamId], references: [id], onDelete: Cascade)
  title      String
  targetDate String
  status     String     @default("upcoming") // "completed" | "active" | "upcoming"
  orderIndex Int
  createdAt  DateTime   @default(now())
  tasks      TeamTask[]
}

model TeamTask {
  id          String            @id @default(uuid())
  teamId      String
  team        Team              @relation(fields: [teamId], references: [id], onDelete: Cascade)
  milestoneId String?
  milestone   TeamMilestone?    @relation(fields: [milestoneId], references: [id], onDelete: SetNull)
  title       String
  description String
  deadline    String
  priority    String            // "low" | "medium" | "high" | "urgent"
  status      String            @default("active") // "active" | "completed"
  progress    Int               @default(0) // 0 - 100
  assigneeId  String
  assigneeName String
  assigneeEmail String
  leadId      String
  createdAt   DateTime          @default(now())
  completedAt DateTime?
  checkpoints TaskCheckpoint[]
}

model TaskCheckpoint {
  id         String   @id @default(uuid())
  taskId     String
  task       TeamTask @relation(fields: [taskId], references: [id], onDelete: Cascade)
  authorId   String
  authorName String
  timestamp  DateTime @default(now())
  progress   Int
  note       String
}
```

## 3. Authentication & Security Guard

The NestJS server exposes endpoints protected by an `AuthGuard`:
- Client passes `Authorization: Bearer <idToken>`.
- Guard uses `firebase-admin.auth().verifyIdToken(token)`.
- When `FIREBASE_AUTH_EMULATOR_HOST` is present (default in local dev: `127.0.0.1:9099`), `firebase-admin` automatically routes to the local emulator with no live credentials needed.
- If no token or invalid token is supplied, returns HTTP 401 Unauthorized.
- Extracts `req.user = { uid: string, email: string, name: string }`.

## 4. API Endpoints

| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/teams` | Get all teams where current user is lead or member | Authenticated User |
| `GET` | `/api/teams/:id` | Get details of a single team workspace | Team Member |
| `POST` | `/api/teams` | Create a new team workspace (caller becomes lead) | Authenticated User |
| `GET` | `/api/invitations/pending` | Get all pending invites for current user's email | Authenticated User |
| `POST` | `/api/teams/:id/invitations` | Invite a member by email | Team Lead |
| `POST` | `/api/invitations/:id/respond` | Accept or reject a pending invitation | Invited User |
| `GET` | `/api/teams/:id/milestones` | Get all milestones for a team | Team Member |
| `POST` | `/api/teams/:id/milestones` | Create a milestone | Team Lead |
| `PATCH`| `/api/milestones/:id/status` | Update milestone status (`active`/`completed`) | Team Lead |
| `GET` | `/api/teams/:id/tasks` | Get all tasks for a team | Team Member |
| `POST` | `/api/teams/:id/tasks` | Create a team task assigned to a member | Team Lead |
| `PATCH`| `/api/tasks/:id/progress` | Update task progress (0-100) & add checkpoint | Assignee or Lead |
| `GET` | `/api/events/stream` | Server-Sent Events stream for realtime sync | Authenticated User |

## 5. Realtime Server-Sent Events (SSE)

The `EventsService` maintains an RxJS `Subject<MessageEvent>`:
- When a team, invitation, milestone, or task is created or updated, `eventsService.broadcast({ type, payload })` is invoked.
- The `EventsController` emits an `Observable<MessageEvent>` on `/api/events/stream`.
- In the frontend, `NestJsTeamRepository` connects using browser `new EventSource('/api/events/stream')` and automatically notifies UI subscribers (such as `NotificationBell` and `TeamSpaceView`).
