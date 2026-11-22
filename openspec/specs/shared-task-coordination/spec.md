# shared-task-coordination Specification

## Purpose

Provides collaborative task management within team spaces, supporting milestone grouping, member assignments, and lead-driven permissions where assignees manage their own deliverables.

## Requirements

### Requirement: Team Task Creation and Milestone Association
The system SHALL allow Team Leads to create shared tasks within a team space and associate each task with an active project milestone phase.

#### Scenario: Creating a milestone task
- **WHEN** the Team Lead creates a task in a team space, specifying title, deadline, priority, and milestone phase
- **THEN** the system saves the task under that team and groups it visually under the chosen milestone.

#### Scenario: Creating an unassigned task
- **WHEN** the Team Lead creates a team task without selecting an assignee
- **THEN** the system marks the task as Unassigned and displays it in the team backlog as open for assignment.

### Requirement: Task Member Assignment
The system SHALL allow Team Leads to assign team tasks to accepted team members or reassign tasks between members.

#### Scenario: Assigning a task to a member
- **WHEN** the Team Lead selects a team member from the assignee selector
- **THEN** the system updates the task's assignee and reflects the member's avatar and initials on the task row.

#### Scenario: Reassigning a task
- **WHEN** the Team Lead updates the assignee of an existing task to another member
- **THEN** the system updates ownership and re-indexes the task in both members' filtered views.

### Requirement: Lead-Driven Permissions and Member Deliverables
The system SHALL enforce lead-driven permissions where Team Leads control task structures and assignees manage progress and checkpoints on their own assigned tasks.

#### Scenario: Assigned member updating progress
- **WHEN** an authenticated team member updates progress percentage (0–100%) or adds a checkpoint to a task assigned to them
- **THEN** the system records the update, timestamps the checkpoint with the member's profile, and saves the task state.

#### Scenario: Non-assigned member attempting task mutation
- **WHEN** an authenticated team member views a task assigned to another member
- **THEN** the system displays the task in read-only mode, disabling editing and completion controls.

#### Scenario: Team Lead full administration
- **WHEN** the Team Lead edits, archives, or reassigns any task within their team space
- **THEN** the system permits the mutation regardless of current assignment.

### Requirement: Team Task Views and Filtering
The system SHALL provide filtered team backlog views allowing members to toggle between all team tasks, tasks assigned to them, and tasks organized by milestone.

#### Scenario: Filtering by Assigned to Me
- **WHEN** a user activates the "Assigned to Me" filter inside a team space
- **THEN** the system renders only tasks where the active user's ID matches the assignee ID.

#### Scenario: Filtering by Milestone phase
- **WHEN** a user selects a specific milestone from the roadmap header
- **THEN** the system isolates and displays only tasks linked to that milestone phase.
