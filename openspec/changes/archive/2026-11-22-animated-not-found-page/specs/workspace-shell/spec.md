# Spec Delta

## ADDED Requirements

### Requirement: Standalone unmapped route fallback
The system SHALL provide a dedicated full-screen fallback view for any unmapped route at the application root, within live workspace subpaths, or within demo preview subpaths.

#### Scenario: Navigating to an unmapped workspace subpath
- **WHEN** the user navigates to an undefined URL beneath `/workspace/` or `/preview/`
- **THEN** the system renders the standalone fallback view without mounting the workspace sidebar or top bar chrome.

#### Scenario: Navigating to an unmapped root path
- **WHEN** the user navigates to an undefined URL at the root of the application
- **THEN** the system renders the standalone fallback view.

### Requirement: Animated task-searching presentation
The standalone fallback view SHALL render an animated vector character searching for missing tasks alongside calm, non-technical recovery messaging.

#### Scenario: Displaying the unmapped route illustration and message
- **WHEN** the standalone fallback view is displayed
- **THEN** the system renders an animated SVG character searching with an empty task clipboard, floating empty task items, and the text "You've wandered off the scheduled horizon" without referencing technical "404" errors.

### Requirement: Authentication-gated fallback navigation
The standalone fallback view SHALL conditionally display workspace recovery actions based on user authentication status.

#### Scenario: Authenticated user visits unmapped path
- **WHEN** an authenticated user or active demo preview session views the standalone fallback view
- **THEN** the system displays a "Back to Workspace" primary button that navigates to the active workspace dashboard, alongside a "Return to Home" button.

#### Scenario: Unauthenticated visitor visits unmapped path
- **WHEN** an unauthenticated visitor views the standalone fallback view
- **THEN** the system hides the "Back to Workspace" button and displays only the "Return to Home" button navigating to the landing page.
