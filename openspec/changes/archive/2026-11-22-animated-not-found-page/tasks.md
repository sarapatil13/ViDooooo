# Tasks

## 1. Component Development

- [x] 1.1 Create `src/features/workspace/views/NotFoundView.tsx` with animated searching vector character and floating task elements, styled with ViDo design tokens and CSS variables. Verify visually and through DOM query checks.
- [x] 1.2 Implement authentication-aware recovery action buttons in `NotFoundView` using `useAuth()`. Verify that "Back to Workspace" renders only for logged-in or demo preview users, while unauthenticated users see only "Return to Home".

## 2. Routing Integration

- [x] 2.1 Update `src/features/workspace/WorkspaceLayout.tsx` to detect unmapped subpaths under `/workspace/*` and `/preview/*` and render `NotFoundView` standalone without mounting the top bar or sidebar. Verify by navigating to an unmapped workspace path.
- [x] 2.2 Add a catch-all `<Route path="*" element={<NotFoundView />} />` to root routes in `src/App.tsx`. Verify by navigating to an unmapped root path.

## 3. Testing and Verification

- [x] 3.1 Create `src/features/workspace/views/NotFoundView.test.tsx` to test message rendering, SVG animation elements, and auth-conditional button display. Verify all tests pass.
- [x] 3.2 Update integration tests in `src/App.test.tsx` and `src/features/workspace/WorkspaceViewsAndModals.test.tsx` to ensure unmapped routes render the standalone fallback view without sidebar and top bar chrome. Verify tests pass.
- [x] 3.3 Run full project verification (`npm run typecheck`, `npm test`, `npm run build:server`, `npm run build`) and ensure zero errors or warnings.
