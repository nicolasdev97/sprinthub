# SprintHub – Software Requirements Specification (SRS)

> Software requirements specification defining the functional and non-functional requirements for the SprintHub MVP.

---

| Property         | Value                                     |
| ---------------- | ----------------------------------------- |
| **Document**     | Software Requirements Specification (SRS) |
| **Project**      | SprintHub                                 |
| **Version**      | 1.1                                       |
| **Status**       | Approved                                  |
| **Owner**        | Nicolás Palacio                           |
| **Last Updated** | September 2026                            |

---

# Table of Contents

1. Introduction
2. System Overview
3. Actors
4. Functional Requirements
5. Non-Functional Requirements
6. Business Rules
7. Data Requirements
8. External Interfaces
9. Technical Constraints
10. Assumptions
11. Acceptance Criteria
12. Traceability Matrix

---

# 1. Introduction

## Purpose

This Software Requirements Specification (SRS) defines the functional and non-functional requirements for SprintHub, a SaaS project management and team collaboration platform.

The purpose of this document is to provide a clear and complete specification for the implementation of SprintHub while serving as the primary reference for development, testing, and future maintenance.

---

## Scope

SprintHub is a web-based application that enables individuals and teams to organize projects, manage tasks, collaborate within workspaces, and monitor project progress.

The MVP focuses on delivering the core functionality required for project management while following production-ready software engineering practices.

---

## Intended Audience

This document is intended for:

- Software Engineers
- Frontend Developers
- Backend Developers
- QA Engineers
- Technical Reviewers
- Recruiters evaluating the project
- Future maintainers

---

# 2. System Overview

SprintHub is built around the concept of **Workspaces**.

Each workspace contains:

- Members
- Projects
- Tasks
- Dashboards
- Notifications

Users may belong to one or more workspaces and interact with projects according to their assigned role.

The application follows a modular architecture that separates business capabilities into well-defined domains, allowing the platform to evolve while maintaining a clear separation of responsibilities.

---

# 3. Actors

SprintHub defines the following system actors.

---

## Guest

A visitor who has not authenticated.

### Permissions

- Register
- Login

---

## Member

An authenticated user with access to one or more workspaces.

### Permissions

- Access assigned workspaces
- Create tasks
- Update tasks
- View dashboard

---

## Admin

Workspace administrator.

### Permissions

- Manage projects
- Manage members
- Assign tasks

---

## Owner

Workspace owner.

### Permissions

- Full workspace management
- Delete workspace
- Manage administrators

---

# 4. Functional Requirements

The following functional requirements define the core capabilities of the SprintHub MVP.

---

## Authentication Module

### RF-001 – User Registration

| Property     | Value |
| ------------ | ----- |
| **Priority** | High  |
| **Actor**    | Guest |

#### Description

The system shall allow a guest user to create a new account using their first name, last name, email address, and password.

#### Preconditions

- User is not authenticated.

#### Main Flow

1. User opens the registration page.
2. User enters the required information.
3. The system validates the input.
4. The system verifies email uniqueness.
5. The password is securely hashed.
6. The user account is created.
7. A success response is returned.

#### Postconditions

- A new user record exists in the database.

#### Acceptance Criteria

- Email must be unique.
- Password must contain at least 8 characters.
- Password must be securely hashed.
- User account is successfully created.

---

### RF-002 – User Login

| Property     | Value |
| ------------ | ----- |
| **Priority** | High  |
| **Actor**    | Guest |

#### Description

The system shall authenticate users using their email address and password.

#### Preconditions

- The user account already exists.

#### Main Flow

1. User submits credentials.
2. Credentials are validated.
3. An Access Token is generated.
4. A Refresh Token is generated.
5. Authentication cookies are created.
6. The user session begins.

#### Postconditions

- User is authenticated.

#### Acceptance Criteria

- Invalid credentials return **HTTP 401 Unauthorized**.
- Valid credentials create a new authenticated session.
- Access Token expiration is properly configured.
- Refresh Token is securely stored.

---

### RF-003 – User Logout

| Property     | Value  |
| ------------ | ------ |
| **Priority** | High   |
| **Actor**    | Member |

#### Description

The system shall terminate the active user session.

#### Acceptance Criteria

- Refresh Token is invalidated.
- Authentication cookies are removed.
- User session is terminated successfully.

---

## Workspace Module

### RF-004 – Create Workspace

| Property     | Value  |
| ------------ | ------ |
| **Priority** | High   |
| **Actor**    | Member |

#### Description

Authenticated users shall be able to create a workspace.

Each workspace includes:

- Name
- Description

#### Acceptance Criteria

- Workspace name is required.
- Creator automatically becomes the Workspace Owner.
- Workspace is successfully persisted.

---

### RF-005 – Update Workspace

| Property     | Value |
| ------------ | ----- |
| **Priority** | High  |
| **Actor**    | Owner |

#### Description

Workspace owners may update workspace information, including:

- Name
- Description

Workspace description is optional.

---

### RF-006 – Delete Workspace

| Property     | Value |
| ------------ | ----- |
| **Priority** | High  |
| **Actor**    | Owner |

#### Description

Only workspace owners may permanently delete a workspace.

---

### RF-007 – Invite Member

| Property     | Value         |
| ------------ | ------------- |
| **Priority** | High          |
| **Actor**    | Owner / Admin |

#### Description

Workspace owners and administrators shall be able to invite users via email.

---

### RF-008 – Manage Roles

| Property     | Value |
| ------------ | ----- |
| **Priority** | High  |
| **Actor**    | Owner |

#### Description

Workspace owners may change member roles.

Supported roles include:

- OWNER
- ADMIN
- MEMBER

---

### RF-009 – Search and Sort Workspaces

| Property     | Value  |
| ------------ | ------ |
| **Priority** | Medium |
| **Actor**    | Member |

#### Description

Users shall be able to search and sort workspaces they have access to.

Search shall match only the workspace `name`.

Search shall perform a case-insensitive partial match (`contains`) against the workspace `name`.

Workspace listing shall support:

- Search by `name`.
- Sorting by `name` or `createdAt`.
- Sort order: `asc` or `desc`.

Workspace filtering is not supported.

---

## Project Module

### RF-010 – Create Project

| Property     | Value         |
| ------------ | ------------- |
| **Priority** | High          |
| **Actor**    | Owner / Admin |

#### Description

Authorized users shall be able to create projects within a workspace.

Each project includes:

- Name
- Description
- Status
- Archived status

---

### RF-011 – Update Project

| Property     | Value         |
| ------------ | ------------- |
| **Priority** | High          |
| **Actor**    | Owner / Admin |

#### Description

Authorized users may update project information, including:

- Name
- Description
- Status

Project description is optional.

---

### RF-012 – Archive Project

| Property     | Value         |
| ------------ | ------------- |
| **Priority** | Medium        |
| **Actor**    | Owner / Admin |

#### Description

Projects may be archived instead of being permanently deleted.

---

### RF-013 – Unarchive Project

| Property     | Value         |
| ------------ | ------------- |
| **Priority** | Medium        |
| **Actor**    | Owner / Admin |

#### Description

Authorized users shall be able to unarchive a previously archived project.

When a project is unarchived, its `archived` status shall be set to `false`.

---

### RF-014 – Delete Project

| Property     | Value         |
| ------------ | ------------- |
| **Priority** | High          |
| **Actor**    | Owner / Admin |

#### Description

Authorized users may permanently delete projects.

---

### RF-015 – Search and Filter Projects

| Property     | Value  |
| ------------ | ------ |
| **Priority** | Medium |
| **Actor**    | Member |

#### Description

Users shall be able to search, filter, and sort projects within workspaces they have access to.

Search shall match only the project `name`.

Search shall perform a case-insensitive partial match (`contains`) against the project `name`.

Project listing shall support:

- Search by `name`.
- Filter by `status`.
- Filter by `archived` status.
- Sorting by `name` or `createdAt`.
- Sort order: `asc` or `desc`.

Supported project statuses are:

- PLANNING
- ACTIVE
- COMPLETED

---

## Task Module

### RF-016 – Create Task

| Property     | Value  |
| ------------ | ------ |
| **Priority** | High   |
| **Actor**    | Member |

#### Description

Users shall be able to create tasks.

Each task includes:

- Title
- Description (optional)
- Status
- Priority
- Due Date
- Creator (`createdById`)
- Optional Assignee (`assigneeId`)

The `assigneeId` field is optional and may reference a workspace member.

---

### RF-017 – Update Task

| Property     | Value  |
| ------------ | ------ |
| **Priority** | High   |
| **Actor**    | Member |

#### Description

Users may update the following task information:

- Title
- Description
- Due Date

---

### RF-018 – Delete Task

| Property     | Value         |
| ------------ | ------------- |
| **Priority** | High          |
| **Actor**    | Owner / Admin |

#### Description

Authorized users may permanently delete tasks.

---

### RF-019 – Assign Task

| Property     | Value         |
| ------------ | ------------- |
| **Priority** | High          |
| **Actor**    | Owner / Admin |

#### Description

Tasks may be assigned to workspace members.

---

### RF-020 – Unassign Task

| Property     | Value         |
| ------------ | ------------- |
| **Priority** | Medium        |
| **Actor**    | Owner / Admin |

#### Description

Authorized users shall be able to remove the user assigned to a task.

After unassignment, the task shall have no assigned user.

The task can be unassigned by setting `assigneeId` to `null`.

---

### RF-021 – Update Task Status

| Property     | Value  |
| ------------ | ------ |
| **Priority** | High   |
| **Actor**    | Member |

#### Description

Users may update the task status.

When a task changes to `DONE`, the system shall set `completedAt`.

When a task changes from `DONE` to another status, the system shall reset `completedAt` to `null`.

Supported statuses:

- Backlog
- To Do
- In Progress
- Review
- Done

---

### RF-022 – Update Task Priority

| Property     | Value  |
| ------------ | ------ |
| **Priority** | Medium |
| **Actor**    | Member |

#### Description

Users may update the task priority through the dedicated task priority operation.

The `priority` field is not part of the general task update operation.

Supported priorities:

- Low
- Medium
- High
- Critical

---

### RF-023 – Search and Filter Tasks

| Property     | Value  |
| ------------ | ------ |
| **Priority** | Medium |
| **Actor**    | Member |

#### Description

Users shall be able to search, filter, and sort tasks within projects they have access to.

Search shall match only the task `title`.

Search shall perform a case-insensitive partial match (`contains`) against the task `title`.

Task listing shall support:

- Search by `title`.
- Filter by `status`.
- Filter by `priority`.
- Filter by `assigneeId`.
- Filter by `dueDate`.
- Sorting by `createdAt`, `dueDate`, or `priority`.
- Sort order: `asc` or `desc`.

Supported task statuses are:

- BACKLOG
- TODO
- IN_PROGRESS
- REVIEW
- DONE

Supported task priorities are:

- LOW
- MEDIUM
- HIGH
- CRITICAL

---

## Dashboard Module

### RF-024 – Dashboard Metrics

| Property     | Value  |
| ------------ | ------ |
| **Priority** | High   |
| **Actor**    | Member |

#### Description

The dashboard shall display:

- Active Projects
- Pending Tasks
- Completed Tasks
- Overdue Tasks

---

## Notification Module

### RF-025 – Notifications

| Property     | Value  |
| ------------ | ------ |
| **Priority** | Medium |
| **Actor**    | System |

#### Description

The system shall generate in-application notifications when:

- A task is assigned.
- A workspace invitation is sent.
- A task status changes.

> **Note**
>
> Email notifications, push notifications, and real-time notifications are outside the scope of the MVP and are planned for future releases.

---

# 5. Non-Functional Requirements

The following non-functional requirements define the quality attributes that SprintHub must satisfy.

---

## RNF-001 – Performance

API response time should remain below **300 ms** under normal operating conditions.

---

## RNF-002 – Availability

The application should achieve an availability target of at least **99%**.

---

## RNF-003 – Security

The system shall implement:

- JWT Authentication
- Refresh Token Authentication
- Password Hashing
- HttpOnly Cookies
- Helmet
- CORS
- Rate Limiting
- Input Validation

---

## RNF-004 – Maintainability

The application shall follow a modular architecture with clear separation of concerns.

The codebase should remain:

- Modular
- Readable
- Maintainable
- Extensible

---

## RNF-005 – Scalability

The architecture shall support future business modules and infrastructure improvements without requiring major architectural refactoring.

Future scalability enhancements may include:

- Distributed caching
- Background job processing
- Queue-based notifications
- Horizontal scaling

> **Note**
>
> These infrastructure capabilities are not part of the MVP implementation. The architecture has been designed to support their integration in future versions.

---

## RNF-006 – Reliability

Unexpected errors shall be handled centrally using a Global Error Handler.

The application should provide:

- Consistent error responses
- Proper logging
- Predictable API behavior

---

## RNF-007 – Testability

Critical business logic shall be covered by automated tests.

Target coverage:

- **70% or higher**

---

# 6. Business Rules

The following business rules define the constraints that govern SprintHub's behavior.

---

### BR-001 – Unique User Email

A user email address must be unique.

---

### BR-002 – Unique Workspace Name

Workspace names must be unique.

---

### BR-003 – Unique Project Name

Project names must be unique within their workspace.

---

### BR-004 – Unique Task Title

Task titles must be unique within their project.

---

### BR-005 – Workspace Ownership

Each workspace must have exactly **one Owner**.

The workspace owner is explicitly assigned when the workspace is created.

The `OWNER` role must remain consistent with the workspace ownership relationship.

---

### BR-006 – Workspace Deletion

Only the Workspace Owner can permanently delete a workspace.

Deleting a workspace also deletes all projects belonging to that workspace.

---

### BR-007 – Project Deletion

Authorized users may permanently delete projects according to workspace permissions.

Deleting a project also deletes all tasks belonging to that project.

---

### BR-008 – Workspace Access

Only workspace members may access projects belonging to that workspace.

---

### BR-009 – Archived Projects

Archived projects cannot receive new tasks.

Archived projects may be unarchived by authorized users.

---

### BR-010 – Task Ownership

Every task must belong to exactly one project.

---

### BR-011 – Task Assignment

A task may be assigned to a workspace member.

A task may also remain unassigned.

When an assigned user is removed from the system, the task remains and its assignment is cleared.

---

### BR-012 – Task Completion State

When a task changes from `DONE` to another status, its `completedAt` value must be reset to `null`.

The `completedAt` field shall only contain a completion timestamp when the task is in the `DONE` status.

---

# 7. Data Requirements

SprintHub manages the following primary entities:

- User
- Workspace
- WorkspaceMember
- Project
- Task
- Notification
- RefreshToken

The data model includes the following relevant entity attributes and constraints:

### User

- `email` must be unique.
- `createdAt` stores the account creation timestamp.
- `updatedAt` stores the last account update timestamp.

### Workspace

- `name` is required and must be unique.
- `description` is required.
- `createdAt` stores the workspace creation timestamp.
- `updatedAt` stores the last workspace update timestamp.
- Each workspace has exactly one owner.

### WorkspaceMember

- Each membership belongs to exactly one workspace and one user.
- `role` defaults to `MEMBER` unless another role is explicitly assigned.
- `joinedAt` stores the date and time when the user joined the workspace.
- Each user may have only one membership record per workspace.
- The combination of `workspaceId` and `userId` must be unique.

### Project

- `name` is required and must be unique within its workspace.
- `description` is required.
- `status` represents the current project status.
- `archived` defaults to `false`.
- `createdAt` stores the project creation timestamp.
- `updatedAt` stores the last project update timestamp.
- Each project belongs to exactly one workspace.

### Task

- `projectId` identifies the project the task belongs to.
- `createdById` identifies the user who created the task.
- `assigneeId` is optional.
- `title` is required and must be unique within its project.
- `description` is optional.
- `status` represents the current task status.
- `priority` represents the task priority.
- `dueDate` is optional.
- `completedAt` is optional and stores the completion timestamp when the task is in the `DONE` status.
- `createdAt` stores the task creation timestamp.
- `updatedAt` stores the last task update timestamp.
- Each task belongs to exactly one project.

### Notification

- Each notification belongs to exactly one user.
- `isRead` defaults to `false`.
- `createdAt` stores the notification creation timestamp.

### RefreshToken

- Each refresh token belongs to exactly one user.
- `tokenHash` stores the hashed refresh token.
- `expiresAt` stores the token expiration timestamp.
- `createdAt` stores the token creation timestamp.

---

### Referential Integrity

The database enforces the following deletion behavior:

- Deleting a workspace deletes its workspace memberships and projects.
- Deleting a project deletes its tasks.
- Deleting a user deletes their workspace memberships, notifications, and refresh tokens.
- If a user assigned to a task is deleted, the task remains and its `assigneeId` is set to `null`.

---

### Database Indexes

Indexes are used on frequently queried foreign key fields to improve query performance.

The database includes indexes for:

- `Workspace.ownerId`
- `WorkspaceMember.userId`
- `Project.workspaceId`
- `Task.projectId`
- `Notification.userId`
- `RefreshToken.userId`

The complete index definition is documented in the **Database Design Specification (DDS)**.

---

The complete database model, relationships, constraints, indexes, and entity definitions are documented in the **Database Design Specification (DDS)**.

---

# 8. External Interfaces

SprintHub communicates with external systems through standardized interfaces.

---

## Frontend

- REST API
- JSON
- HTTPS

---

## Database

- PostgreSQL
- Prisma ORM

---

## Authentication

- JWT
- Refresh Tokens

---

## Future Infrastructure

Future versions of SprintHub may introduce additional infrastructure services, including:

- Distributed caching
- Background job processing

These capabilities are intentionally excluded from the MVP and are reserved for future scalability improvements.

---

# 9. Technical Constraints

The following technical constraints apply to the SprintHub MVP.

---

## Technology Stack

The implementation shall use the technologies defined in the project architecture.

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod

---

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- JWT
- bcrypt

---

### Database

- PostgreSQL

---

### Infrastructure

The MVP infrastructure includes:

- Docker
- Docker Compose
- GitHub Actions

Future infrastructure improvements may include distributed caching, background job processing, and other scalability enhancements. These components are intentionally excluded from the MVP implementation.

---

## Browser Support

SprintHub should support the latest stable versions of:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Safari

---

## Responsive Design

The application shall support:

- Desktop devices
- Tablets
- Mobile devices

---

# 10. Assumptions

The following assumptions were considered during the definition of the system requirements.

- Users have internet connectivity.
- Users access the application using modern web browsers.
- Email addresses are unique.
- PostgreSQL is available.
- JWT is used for authentication.
- The application is deployed over HTTPS in production.

---

# 11. Acceptance Criteria

SprintHub is considered ready for release when the following conditions are satisfied.

---

## Functional Acceptance

- All functional requirements have been implemented.
- All business rules are enforced.
- User flows operate correctly.
- Acceptance criteria have been satisfied.

---

## Technical Acceptance

- Architecture follows the approved design.
- Database schema matches the DDS.
- API implementation matches the ADS.
- Coding standards are followed.
- Automated tests pass successfully.

---

## Quality Acceptance

- No critical defects remain.
- Performance requirements are met.
- Security requirements are satisfied.
- Documentation has been completed and reviewed.

---

# 12. Traceability Matrix

The following matrix provides high-level traceability between the product requirements and the software requirements.

| PRD Requirement      | SRS Requirement |
| -------------------- | --------------- |
| Authentication       | RF-001 – RF-003 |
| Workspace Management | RF-004 – RF-009 |
| Project Management   | RF-010 – RF-015 |
| Task Management      | RF-016 – RF-023 |
| Dashboard            | RF-024          |
| Notifications        | RF-025          |

---

## Document Relationships

The SRS is supported by the following technical documentation:

| Document                             | Purpose                                                     |
| ------------------------------------ | ----------------------------------------------------------- |
| Blueprint                            | Defines the product vision and overall technical direction. |
| Product Requirements Document (PRD)  | Defines business objectives and product scope.              |
| Architecture Design Document (ADD)   | Defines the software architecture.                          |
| Database Design Specification (DDS)  | Defines the database schema and data model.                 |
| API Design Specification (ADS)       | Defines the REST API contract.                              |
| Architecture Decision Records (ADRs) | Documents significant architectural decisions.              |
| Developer Guide                      | Describes development standards and project setup.          |

---

# Conclusion

The Software Requirements Specification defines the complete set of functional and non-functional requirements for SprintHub.

It serves as the contractual reference for implementation by describing the expected system behavior, quality attributes, business rules, technical constraints, and acceptance criteria. Together with the supporting architecture and design documents, this specification ensures that development remains aligned with the product vision while maintaining consistency, traceability, and long-term maintainability.

---
