<div align="center">

# ViDo

### See the work. Share the progress. Deliver together.

A modern task-management workspace built for focused individuals and transparent teams.

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS_11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma_6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase_Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

[Vision](./Idea.md) · [Living Concept](./concept.html) · [Folder Structure](./FOLDER_STRUCTURE.md) · [Agent Guidelines](./AGENTS.md) · [Contributing](./CONTRIBUTING.md) · [Testing Setup](#-firebase-testing-setup) · [Tech Stack](#-tech-stack) · [Quick Start](#-quick-start-for-developers)

</div>

---

## 📌 Table of Contents

- [📖 Overview & Philosophy](#-overview--philosophy)
  - [Why ViDo?](#why-vido)
  - [The Experience](#the-experience)
- [🗺️ Application Routes](#️-application-routes)
- [✨ Core Features](#-core-features)
- [⚡ Quick Start for Developers](#-quick-start-for-developers)
  - [Prerequisites](#prerequisites)
  - [Installation & Running Locally](#installation--running-locally)
- [🔐 Firebase Testing Setup](#-firebase-testing-setup)
  - [Local Auth Emulator](#local-auth-emulator)
  - [Interactive Sign-In Flow](#interactive-sign-in-flow)
- [🧪 Verification & Scripts](#-verification--scripts)
- [🗂️ Architecture & Code Organization](#️-architecture--code-organization)
- [🎨 Design System & Theme Tokens](#-design-system--theme-tokens)
- [🛠️ Tech Stack](#️-tech-stack)
- [🤝 Contributing Guidelines](#-contributing-guidelines)
- [💡 Core Principles](#-core-principles)

---

## 📖 Overview & Philosophy

### Why ViDo?

A simple checkbox tells you that something is done. It does not tell you **how the work is going**.

ViDo gives every responsibility a precise deadline, measurable progress percentage, a clear owner, and a chronological checkpoint history. Individuals stay focused in a calm, distraction-free environment while teams coordinate from a shared source of truth—without turning every status check into another meeting.

> **ViDo turns “What is the status?” into a question the workspace already answers.**

### The Experience

<table>
<tr>
<td width="50%" valign="top">

### 👤 Personal Responsibilities

A focused space for personal and household planning.

- Organize individual responsibilities
- Set exact dates and deadline times
- Track progress incrementally from 0% to 100%
- Maintain a chronological checkpoint update history
- Automatically separate active, overdue, and completed work

</td>
<td width="50%" valign="top">

### 👥 Shared Coordination

A transparent space for collaborative execution.

- Organize focused workspaces
- Clear assignment and ownership
- Follow progress and checkpoint updates
- Flag late deliveries automatically
- Coordinated history without redundant meetings

</td>
</tr>
</table>

---

## 🗺️ Application Routes

ViDo offers a fully interactive client-side routing structure:

| Route | View Name | Description |
|---|---|---|
| `/` | **Public Landing Page** | Universal value proposition, feature preview, design principles, and Google sign-in modal. |
| `/workspace` | **Personal Workspace** | Authenticated task-management dashboard with user-scoped persistence, profile badge, and sign-out. |
| `/preview` | **Interactive Product Demo** | Full guest demo using deterministic sample data (`Demo User`) with a persistent top navigation banner. |
| `/preview/today` | **Today's Agenda** | Tasks scheduled specifically for the benchmark date. |
| `/preview/upcoming` | **Upcoming Schedule** | Tasks scheduled for future dates. |
| `/preview/needs-attention` | **Needs Attention** | Overdue or urgent tasks requiring immediate action. |
| `/preview/completed` | **Completed Backlog** | Historical log of successfully delivered responsibilities. |
| `/preview/archived` | **Archived Tasks** | Shelved responsibilities preserved with full checkpoint audit logs. |
| `/preview/team/:teamId` | **Team Workspace Demo** | Shared team space preview with phased milestones, member roster, and collaborative task backlog. |
| `/workspace/team/:teamId` | **Team Workspace** | Authenticated shared team workspace with lead permissions, member assignments, and progress tracking. |
| `/style-lab` | **Design System Lab** | Interactive sandbox for testing accent palettes (`Cobalt Blue`, `Deep Indigo`, `Forest Green`). |

---

## ✨ Core Features

### 🔐 Authentication & Session Management
- **Google OAuth Integration**: Fast, popup-based single sign-on powered by Firebase Authentication.
- **Local Testing via Auth Emulator**: Automated local emulator detection and startup on port `9099` with zero cloud credentials required.
- **User-Scoped Task Storage**: Each authenticated user gets an isolated workspace backlog stored in browser local storage keyed to their unique User ID (`vido_tasks_<uid>`).
- **Zero-Barrier Public Demo**: Guest users can inspect the complete interface via `/preview/*` without needing an account.

### 👥 Team Workspaces & Shared Coordination
- **Unified Sidebar Navigation**: Personal views (*Dashboard*, *Tasks*) alongside active collaborative spaces under `TEAMS & SHARED PROJECTS`.
- **Email-Based Invitations**: Team Leads invite collaborators by Google email address with duplicate checking and case-insensitive matching.
- **In-App Notification Center**: Top utility bar notification bell (`🔔`) alerts invited users in real-time, providing one-click **Accept** and **Reject** actions.
- **Phased Milestone Roadmap**: Common project goals broken down into sequential delivery phases with target dates and status badges (`Completed`, `Active Phase`, `Upcoming`).
- **Lead-Driven Permissions**: Team Leads administer team settings, milestones, and task assignments. Assignees maintain ownership over their progress (0–100%) and checkpoint logs. Tasks are read-only for non-assigned teammates.

### ✅ Task Lifecycle & Checkpoints
- **Incremental Progress Tracking**: Measure progress continuously (0% to 100%) rather than relying on binary done/not-done toggles.
- **Timestamped Checkpoints**: Preserve a living audit trail of status updates, blockers, and decisions for every responsibility.
- **Automated Deadline Auditing**: Automatic detection for on-track, overdue, and late deliveries based on real-time date calculations.

### 🎯 Calm, Section-Limited Views
- **Today's Agenda**: High-priority tasks scheduled for the active day.
- **Needs Attention**: Overdue items or high-priority blockers surfaced prominently.
- **Upcoming Schedule**: Future commitments organized by target date.
- **Delivered & Archived**: Archived responsibilities preserved with complete historical integrity.

### 🎨 Living Design System
- **Desktop-First & Contrast Compliant**: Built with crisp borders, generous whitespace, and WCAG AA contrast.
- **CSS Custom Properties**: Dynamic theme token architecture supporting multiple palette accents (`Cobalt Blue`, `Deep Indigo`, `Forest Green`).

---

## ⚡ Quick Start for Developers

Get ViDo up and running on your local machine in under two minutes.

### Prerequisites

- **Node.js 18+** (Node 20+ LTS recommended)
- **npm** (comes with Node) or **pnpm**
- *(Optional for Auth Emulator)*: **Java JRE 11+** installed (`java -version`) for running the Firebase Emulator Suite locally

### Installation & Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vicharanashala/ViDo.git
   cd ViDo
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   - **Full Stack (Frontend + NestJS Backend API)**:
     ```bash
     npm run dev:all
     ```
     *(Runs Vite on `http://localhost:5173` and NestJS on `http://localhost:3001` with SQLite `dev.db`)*

   - **Frontend Only (Offline Mock / Zero Prerequisite)**:
     ```bash
     npm run dev
     ```
     *(Runs Vite with MockTeamRepository and dev server bridge)*

4. **Open your browser:**
   Navigate to [http://localhost:5173](http://localhost:5173).

> [!TIP]
> When you run `npm run dev` or `npm run dev:all`, Vite will automatically check if the Firebase Auth Emulator is running on port `9099`. If not, it will check for Java and launch the emulator in the background automatically!

---

## 🔐 Firebase Testing Setup

ViDo is configured for **zero-friction local testing**. You do not need a Google Cloud account, a credit card, or live Firebase API keys to develop and test full authentication.

### Local Auth Emulator

- **Automatic Startup**: Running `npm run dev` automatically starts the Auth Emulator on `localhost:9099` with the demo project `demo-vido`.
- **Manual Launch** (dedicated terminal):
  ```bash
  npm run emulators
  ```
  *(Equivalent to: `firebase emulators:start --only auth`)*

### Interactive Sign-In Flow

1. Navigate to the landing page at `http://localhost:5173`.
2. Click **Sign In to Dashboard** or **Continue with Google**.
3. In the Firebase Auth Emulator popup:
   - Choose any mock persona or enter a custom email/name.
4. The application completes authentication and transitions into `/workspace`.
5. Newly created tasks are automatically saved under your mock user's session key.
6. Click **Sign Out** to terminate the session and return to the public landing page.

---

## 👥 Collaborative Team Spaces & Multi-Backend Architecture

ViDo supports three distinct backend architectures designed for zero-friction local testing as well as production scalability:

### 1. Dedicated NestJS Backend with Prisma ORM & SSE (Recommended Local API)
For full-stack developers who want a dedicated TypeScript API without any cloud dependency:
- **Zero Cloud Setup**: Uses Prisma ORM with a local SQLite database (`server/prisma/dev.db`).
- **Concurrent Startup**: Run `npm run dev:all` to launch the Vite frontend (:5173) and NestJS backend (:3001) together.
- **Real-Time Push**: Server-Sent Events (SSE) broadcast team invitations and task updates in real-time across tabs and windows.
- **Firebase AuthGuard**: Verifies Firebase ID tokens from both the local Firebase Emulator (`127.0.0.1:9099`) and live Firebase.
- **Production Switching**: Seamlessly switches from SQLite to PostgreSQL by configuring `DATABASE_URL` in production.

### 2. Offline Mock Repository & Vite Sync Bridge (Default Frontend-Only)
When you clone the repository and run `npm run dev`:
- **Zero Configuration**: Uses `MockTeamRepository` with the Vite dev server SSE sync bridge.
- **Preloaded Personas & Data**: Test immediately with preconfigured teams (*Alpha Launch*), phased milestones, and simulated invitations.

### 3. Optional Production Supabase Integration
For teams preferring a managed PostgreSQL BaaS:
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`.
3. Restart Vite (`npm run dev`). ViDo's `getTeamRepository()` auto-detects credentials and connects to Supabase PostgreSQL and Realtime channels.

---

## 🧪 Verification & Scripts

ViDo enforces high engineering standards. All pull requests and commits should pass all core verification checks.

| Command | Description |
|---|---|
| `npm run dev:all` | Starts Vite frontend (:5173) and NestJS backend (:3001) concurrently. |
| `npm run dev` | Starts the Vite dev server with automated Firebase Emulator orchestration. |
| `npm run dev:server` | Starts the NestJS backend with live reload (`ts-node-dev`). |
| `npm run build:server`| Compiles the NestJS backend into `server/dist/`. |
| `npm test` | Runs the full Vitest suite (80+ unit & integration tests across 20+ test suites). |
| `npm run test:watch` | Runs Vitest in interactive watch mode for active TDD development. |
| `npm run typecheck` | Validates TypeScript types across the entire frontend (`tsc -b --noEmit`). |
| `npm run build` | Compiles an optimized, minified production build into `dist/`. |
| `npm run preview` | Locally previews the compiled production build from `dist/`. |
| `npm run emulators` | Starts the standalone Firebase Auth Emulator on port 9099. |

### Mandatory Pre-Commit Check

```bash
# Run all three verification checks in one line
npm run typecheck && npm test && npm run build
```

---

## 🗂️ Architecture & Code Organization

ViDo follows a **feature-driven, modular frontend architecture**. Code is grouped by user-facing domain responsibilities rather than arbitrary technical types.

> For the complete, authoritative directory tree, placement rules, and anti-patterns, see **[FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md)**.

### Key Architectural Boundaries

- **UI Primitives (`src/components/ui/`)**: Reusable, accessible, domain-agnostic components (`Button`, `Card`, `Badge`, `Input`, `NoticeModal`). They **never** import domain models (`Task`, `Checkpoint`, `User`).
- **Feature Slices (`src/features/`)**: Self-contained vertical slices (`landing/`, `workspace/`, `style-lab/`, `auth/`) owning their views, subroutes, and feature-specific logic.
- **Data & Pure Logic (`src/data/`)**: TypeScript interfaces, deterministic sample fixtures, and pure filtering/calculation functions.
- **Colocated Tests**: Every component and utility has its tests colocated directly alongside its source file (e.g., `TaskRow.tsx` → `TaskRow.test.tsx`).
- **Clean Root & Source Invariants**: The repository root is strictly reserved for configuration and documentation. Only `App.tsx`, `main.tsx`, `index.css`, and `vite-env.d.ts` reside directly in `src/`.

---

## 🎨 Design System & Theme Tokens

ViDo uses Tailwind CSS v4 with semantic CSS Custom Properties (`var(--token)`), ensuring consistent theming without hardcoded hex values:

| Token | CSS Variable | Purpose |
|---|---|---|
| **Canvas** | `var(--canvas)` | Main application and view background. |
| **Surface** | `var(--surface)` | Card, panel, and modal containers. |
| **Ink** | `var(--ink)` | High-contrast primary headings and text. |
| **Muted** | `var(--muted)` | Secondary labels, timestamps, and metadata. |
| **Faint** | `var(--faint)` | Placeholder text and disabled states. |
| **Line** | `var(--line)` | Subtle borders, card strokes, and table dividers. |
| **Accent** | `var(--accent)` | Primary brand color and active interactive states. |
| **Accent Soft** | `var(--accent-soft)` | Subdued pill backgrounds and badge tints. |

> Explore the accent palettes interactively at `/style-lab`.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) | Declarative, component-based user interface. |
| **Backend Framework** | [NestJS 11](https://nestjs.com/) | Dedicated enterprise TypeScript backend service (`server/`). |
| **ORM & Database** | [Prisma 6](https://www.prisma.io/) + [SQLite](https://www.sqlite.org/) | File-based local database (`dev.db`) with PostgreSQL production compatibility. |
| **Real-Time Push** | Server-Sent Events (SSE) | Push delivery for team invites and notification alerts (`/api/events/stream`). |
| **Authentication** | [Firebase 13 (Auth)](https://firebase.google.com/) | Google OAuth integration with local emulator support. |
| **Bundler & Tooling** | [Vite 6](https://vite.dev/) | Fast HMR dev server and optimized ESM builds. |
| **Language** | [TypeScript 5.7](https://www.typescriptlang.org/) | Strict compile-time safety and self-documenting models. |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern utility-first styling with native CSS variables. |
| **Routing** | [React Router 7](https://reactrouter.com/) | Declarative client-side routing with nested layouts. |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, accessible iconography. |
| **Testing** | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) | Rapid DOM tests running in Happy DOM. |

---

## 🤝 Contributing Guidelines

We welcome community contributions! Please review our dedicated **[CONTRIBUTING.md](./CONTRIBUTING.md)** for our full contribution workflow, code conventions, and pull request checklist.

### Contribution Overview:

1. **Before You Code**:
   - **Bug fixes**: Search [Existing Issues](https://github.com/vicharanashala/ViDo/issues) to avoid duplicate or conflicting efforts. Open a new issue if none exists.
   - **UI redesigns & features**: Open a [GitHub Discussion](https://github.com/vicharanashala/ViDo/discussions) under the Ideas/UI category first to align with maintainers before writing code.
2. **Fork & Branch**: Fork the repository, clone it locally, and create a topic branch (`git checkout -b feature/your-feature-name` or `fix/issue-number-description`).
3. **Run Verifications**: Ensure all three checks pass before pushing:
   ```bash
   npm run typecheck && npm test && npm run build
   ```
4. **Submit Your PR**:
   - For bug fixes: Link the issue in your PR description (`Fixes #<number>`).
   - For UI changes & features: Include the **Discussion link**, **before/after screenshots**, and the **route/endpoint** changed.

---

## 💡 Core Principles

```text
Clarity over complexity          History over guesswork
Privacy by default               Collaboration without noise
Trustworthy foundations          AI that drives useful action
```

---

<div align="center">

**ViDo** · Progress made visible  
Built with precision for focused execution.

</div>
