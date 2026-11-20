# Spec Delta: team-workspaces

## Purpose

Provides collaborative team spaces, phased project milestone tracking, email-based member invitations, and an in-app notification center for accepting or rejecting team membership.

## ADDED Requirements

### Requirement: Team Space Creation and Roster Management
The system SHALL allow authenticated users to create a team workspace, designate the creator as Team Lead, and maintain the list of active team members.

#### Scenario: Creating a new team
- **WHEN** an authenticated user submits the "Create Team" dialog with a team name and optional description
- **THEN** the system creates the team space, assigns the user as Team Lead, and displays the team in the sidebar.

#### Scenario: Removing a member
- **WHEN** the Team Lead removes an active member from the team roster
- **THEN** the system revokes that member's access and removes the team from that user's workspace.

### Requirement: Email-Based Team Invitations
The system SHALL allow Team Leads to invite collaborators by email address, creating pending invitation records that target registered or prospective Google accounts.

#### Scenario: Sending an invitation
- **WHEN** the Team Lead enters an email address and submits the invitation form
- **THEN** the system creates a pending invitation record for that team and target email.

#### Scenario: Duplicate invitation prevention
- **WHEN** the Team Lead enters an email address that is already an active member or has a pending invitation
- **THEN** the system displays a calm notice and prevents creating a duplicate invite.

### Requirement: In-App Team Invitation Notifications
The system SHALL alert invited users with an interactive in-app notification allowing them to accept or reject team membership.

#### Scenario: Pending invite notification display
- **WHEN** an authenticated user has pending invitations matching their authenticated email
- **THEN** the system displays a visible notification indicator on the top-bar notification bell and lists the pending team invitations upon click.

#### Scenario: Accepting an invitation
- **WHEN** an invited user clicks "Accept" on a pending team invitation
- **THEN** the system updates the invitation status to accepted, adds the user to the team roster as a Team Member, and reveals the team in their sidebar.

#### Scenario: Rejecting an invitation
- **WHEN** an invited user clicks "Reject" on a pending team invitation
- **THEN** the system dismisses the invitation, updates its status to rejected, and leaves the user's workspace unchanged.

### Requirement: Phased Project Milestones
The system SHALL allow Team Leads to define sequential project milestones with target delivery dates and track milestone completion status.

#### Scenario: Defining a project milestone
- **WHEN** the Team Lead adds a new milestone phase with a title, target date, and sequence order
- **THEN** the system saves the milestone and renders it within the team's phased roadmap header.

#### Scenario: Updating milestone status
- **WHEN** all tasks associated with a milestone phase are completed or the Lead marks it complete
- **THEN** the system transitions the milestone visual state to completed and updates overall project progress.
