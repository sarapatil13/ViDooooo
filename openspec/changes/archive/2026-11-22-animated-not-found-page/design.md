# Design

## Context

Navigating to unmapped paths currently renders `null` inside `WorkspaceLayout`'s `<main>` container because React Router has no catch-all route. This leaves the sidebar and top bar mounted over an empty white area. See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- Provide a clean, standalone full-screen fallback page for all unmapped application and workspace routes.
- Omit the workspace navigation sidebar and top bar completely on unmapped endpoints.
- Render a lightweight, responsive vector animation of a character searching for lost tasks with floating empty task outlines.
- Conditionally render recovery navigation: "Back to Workspace" for authenticated or preview sessions, and "Return to Home" for unauthenticated visitors.

**Non-Goals:**
- Introducing external heavy animation runtimes (Lottie, Framer Motion, GIF assets).
- Changing valid workspace routes or modifying existing navigation behaviors.

## Decisions

### 1. Pure SVG + Tailwind Keyframe Animations
- **Rationale**: Keeps the application lightweight and responsive with zero external bundle bloat. SVG elements can leverage ViDo's CSS color variables (`var(--accent)`, `var(--ink)`, `var(--surface)`, `var(--line)`) to look crisp across all pixel densities and adapt to system palettes.
- **Alternatives considered**: Lottie animations or static images. Lottie adds extra bundle weight; static images lack the delightful searching motion requested by the user.

### 2. Standalone Rendering Strategy in `WorkspaceLayout` and `App`
- **Rationale**: 
  - In `src/App.tsx`, add a root-level `<Route path="*" element={<NotFoundView />} />` for undefined top-level paths.
  - In `src/features/workspace/WorkspaceLayout.tsx`, when an unmapped sub-route is encountered under `/workspace/*` or `/preview/*`, bypass the workspace layout shell (sidebar, top bar, and main container) and render `<NotFoundView isPreview={isPreview} />` directly as a full-screen view.
- **Alternatives considered**: Rendering the not-found view inside the workspace `<main>` container. Rejected because the user explicitly specified that the top bar and sidebar should not be visible when an endpoint does not exist.

### 3. Authentication-Aware Button Rendering
- **Rationale**: `NotFoundView` consumes `useAuth()`. If `user` is present or `isPreview` is active, the primary button is "Back to Workspace" (linking to `/workspace` or `/preview`), accompanied by "Return to Home". If `user` is null and not in preview, "Back to Workspace" is omitted, rendering only "Return to Home".
- **Alternatives considered**: Unconditionally displaying "Back to Workspace", which would trigger a redirect back to `/` or an error for unauthenticated visitors.

## Risks / Trade-offs

- **[Risk] Auth loading state delay**: On initial deep link to an invalid path, `useAuth().loading` might be true for a few milliseconds.
  - **Mitigation**: While `loading` is true, display a clean neutral state with "Return to Home", preventing any unauthorized button flashes.
- **[Risk] Path collision with dynamic team routes**: Team routes use `team/:teamId/*`.
  - **Mitigation**: The catch-all `<Route path="*" />` in `WorkspaceLayout.tsx` is placed at the very end of the route switch, ensuring all team and utility routes match first.
