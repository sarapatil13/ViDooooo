# Spec Delta: workspace-shell

## MODIFIED Requirements

### Requirement: Desktop sidebar navigation
The workspace shell SHALL provide a persistent left navigation sidebar containing links to personal views (Home, Today, Upcoming, Needs Attention, Completed, Archived) and an integrated section for Teams & Shared Projects with team navigation.

#### Scenario: Navigating between workspace views
- **WHEN** the user selects any personal or team navigation item in the sidebar
- **THEN** the shell updates the active route and renders the corresponding view content with active navigation styling.

#### Scenario: Accessing a team space from sidebar
- **WHEN** the user clicks on an accepted team name under the Teams section
- **THEN** the shell routes to that team's shared workspace view and highlights the active team navigation link.

### Requirement: Top bar controls and user placeholder
The workspace shell SHALL render a top utility bar containing search and filter controls, an interactive team invitation notification bell, and user profile information.

#### Scenario: Interacting with top bar controls
- **WHEN** the user focuses or enters text into the search or filter placeholders
- **THEN** the system maintains visible focus indicators and signals preview-only status without mutating task data.

#### Scenario: Interacting with notification bell
- **WHEN** the user clicks the top-bar notification bell
- **THEN** the system toggles an accessible notification menu displaying pending team invitations with Accept and Reject actions.
