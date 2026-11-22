# Proposal

## Why

Navigating to an unknown or non-existent route within the workspace or at the application root currently renders an empty white content area or a blank void while retaining the shell header and sidebar. Presenting an empty canvas breaks user orientation, and traditional cold "404 Not Found" pages disrupt ViDo's calm, distraction-free aesthetic. Users need a delightful, reassuring, full-page fallback featuring an animated character searching for missing tasks, with clear, context-aware recovery buttons.

## What Changes

- Add a standalone, full-screen fallback page for all unmapped and unknown endpoints across the application (`/*`, `/workspace/*`, `/preview/*`).
- Omit the workspace top bar and sidebar completely when on an unmapped endpoint to prevent confusing empty-shell states.
- Present a lightweight animated vector character searching for lost tasks with floating empty task card outlines and question marks.
- Display calm, positive copy (*"You've wandered off the scheduled horizon"*) without referencing technical "404" errors.
- Conditionally render the primary recovery action:
  - If the user is authenticated (or in demo preview mode), display a **"Back to Workspace"** button directing back to the user's dashboard.
  - If the user is unauthenticated (guest visitor), hide the workspace button and show only **"Return to Home"** directing to the landing page.

## Capabilities

### Modified Capabilities
- `workspace-shell`: Adds requirements for unmapped route fallback handling, standalone full-screen presentation without sidebar/topbar chrome, animated searching illustration, and authentication-gated recovery navigation.

## Impact

- **Frontend routing**: `src/App.tsx` and `src/features/workspace/WorkspaceLayout.tsx` update catch-all route handlers.
- **Components**: Creates `src/features/workspace/views/NotFoundView.tsx` (or standalone view component) and colocated animated character SVG element.
- **Dependencies**: Pure CSS/Tailwind animations and React state — zero new external dependencies.
- **Tests**: Adds unit and integration tests verifying route fallback, animation rendering, and auth-gated button visibility.
