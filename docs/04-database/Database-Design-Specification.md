# SprintHub – Database Design Specification (DDS)

> Database design specification defining the relational data model, entities, relationships, constraints, and persistence strategy for SprintHub.

---

| Property         | Value                               |
| ---------------- | ----------------------------------- |
| **Document**     | Database Design Specification (DDS) |
| **Project**      | SprintHub                           |
| **Version**      | 1.1                                 |
| **Status**       | Approved                            |
| **Owner**        | Nicolás Palacio                     |
| **Last Updated** | September 2026                      |

---

# Table of Contents

1. Introduction
2. Database Overview
3. Design Principles
4. Entity Relationship Diagram
5. Entity Specifications
6. Relationships
7. Constraints
8. Indexing Strategy
9. Cascade Rules
10. Data Integrity
11. Migration Strategy
12. Security Considerations
13. Performance Considerations
14. Future Evolution
15. Conclusion

---

# 1. Introduction

## Purpose

This Database Design Specification (DDS) defines the relational database architecture for SprintHub.

It describes the entities, relationships, constraints, indexes, and persistence rules that support the application's business requirements while ensuring consistency, maintainability, and scalability.

This document complements the Blueprint, PRD, SRS, ADD, and ADS by providing the authoritative specification for the application's data model.

---

## Scope

This document covers:

- Database architecture
- Entity definitions
- Relationships
- Constraints
- Indexes
- Cascade behaviors
- Migration strategy
- Data integrity
- Database security

Implementation details beyond the database layer are intentionally excluded.

---

## Intended Audience

This document is intended for:

- Backend Developers
- Software Architects
- Database Engineers
- QA Engineers
- Technical Reviewers
- Future maintainers

---

# 2. Database Overview

SprintHub uses **PostgreSQL** as its primary relational database together with **Prisma ORM** for data access and schema management.

The database has been designed to provide:

- Strong consistency
- Referential integrity
- Type safety
- Efficient querying
- Long-term maintainability

The data model follows a normalized relational design that minimizes redundancy while preserving query performance.

---

## Database Technology

| Component      | Technology     |
| -------------- | -------------- |
| Database       | PostgreSQL     |
| ORM            | Prisma ORM     |
| Migration Tool | Prisma Migrate |

---

## Design Goals

The database design prioritizes:

- Data consistency
- Referential integrity
- Scalability
- Maintainability
- Predictable query performance

---

# 3. Design Principles

The SprintHub database follows a set of principles that guide every schema decision.

---

## DP-01 – Normalization

Entities are normalized to reduce redundancy while maintaining efficient access patterns.

---

## DP-02 – Referential Integrity

Relationships are enforced using foreign key constraints to maintain data consistency.

---

## DP-03 – Data Integrity

Business-critical constraints are enforced at the database level whenever appropriate.

Examples include:

- Primary keys
- Foreign keys
- Unique constraints
- Required fields

---

## DP-04 – Type Safety

The schema is managed through Prisma ORM, ensuring strong typing between the application and the database.

---

## DP-05 – Predictable Migrations

All schema changes are managed using version-controlled migrations.

Direct modifications to production databases are not permitted.

---

## DP-06 – Future Scalability

The schema is designed to accommodate future business capabilities without requiring significant structural changes.

Potential future enhancements include:

- Audit history
- Activity timeline
- File attachments
- Comments
- Mentions
- Additional notification types

These capabilities are intentionally excluded from the MVP but have been considered during the database design.

---

# 4. Entity Relationship Diagram

The following diagram illustrates the high-level relationships between the primary entities in SprintHub.

```text
User
 │
 ├───────────────┬───────────────┐
 │               │               │
 ▼               ▼               ▼
WorkspaceMember  Notification  RefreshToken
 │
 ▼
Workspace
 │
 ├──────────────► Project
 │                    │
 │                    ▼
 │                   Task
 │                    │
 └────────────────────┘
                      │
                      ▼
                     User
                 (Assignee)
```

---

## Relationship Summary

| Parent Entity | Child Entity    | Relationship |
| ------------- | --------------- | ------------ |
| User          | WorkspaceMember | One-to-Many  |
| Workspace     | WorkspaceMember | One-to-Many  |
| Workspace     | Project         | One-to-Many  |
| Project       | Task            | One-to-Many  |
| User          | Task            | One-to-Many  |
| User          | Notification    | One-to-Many  |
| User          | RefreshToken    | One-to-Many  |

---

# 5. Entity Specifications

The following entities compose the SprintHub MVP data model.

---

## User

Represents an authenticated application user.

### Attributes

| Field        | Type     | Constraints      |
| ------------ | -------- | ---------------- |
| id           | UUID     | Primary Key      |
| name         | String   | Required         |
| email        | String   | Unique, Required |
| passwordHash | String   | Required         |
| isActive     | Boolean  | Default: false   |
| createdAt    | DateTime | Required         |
| updatedAt    | DateTime | Required         |

---

## Workspace

Represents a collaborative environment where users manage projects.

### Attributes

### Attributes

| Field       | Type     | Constraints      |
| ----------- | -------- | ---------------- |
| id          | UUID     | Primary Key      |
| ownerId     | UUID     | Foreign Key      |
| name        | String   | Unique, Required |
| description | String   | Required         |
| createdAt   | DateTime | Required         |
| updatedAt   | DateTime | Required         |

---

## WorkspaceMember

Associates users with workspaces and defines their role.

### Attributes

| Field       | Type     | Constraints |
| ----------- | -------- | ----------- |
| id          | UUID     | Primary Key |
| workspaceId | UUID     | Foreign Key |
| userId      | UUID     | Foreign Key |
| role        | Enum     | Required    |
| joinedAt    | DateTime | Required    |

### Constraints

- The combination of `workspaceId` and `userId` must be unique.
- A user may have only one membership record per workspace.
- The `role` field defaults to `MEMBER`.
- The `OWNER` role is assigned explicitly when the workspace is created and its corresponding membership is created.

---

## Project

Represents a project within a workspace.

### Attributes

| Field       | Type     | Constraints    |
| ----------- | -------- | -------------- |
| id          | UUID     | Primary Key    |
| workspaceId | UUID     | Foreign Key    |
| name        | String   | Required       |
| description | String   | Required       |
| status      | Enum     | Required       |
| archived    | Boolean  | Default: false |
| createdAt   | DateTime | Required       |
| updatedAt   | DateTime | Required       |

### Constraints

- The combination of `workspaceId` and `name` must be unique.
- Each project belongs to exactly one workspace.
- `status` must be one of:
  - `PLANNING`
  - `ACTIVE`
  - `COMPLETED`
- `archived` defaults to `false`.

---

## Task

Represents an individual work item within a project.

### Attributes

| Field       | Type     | Constraints            |
| ----------- | -------- | ---------------------- |
| id          | UUID     | Primary Key            |
| projectId   | UUID     | Foreign Key            |
| assigneeId  | UUID     | Foreign Key (Nullable) |
| title       | String   | Required               |
| description | String   | Optional               |
| status      | Enum     | Required               |
| priority    | Enum     | Required               |
| dueDate     | DateTime | Optional               |
| completedAt | DateTime | Nullable               |
| createdAt   | DateTime | Required               |
| updatedAt   | DateTime | Required               |

### Constraints

- The combination of `projectId` and `title` must be unique.
- Each task belongs to exactly one project.
- `assigneeId` is optional.
- A task may be assigned only to a user who is a member of the task's workspace.
- `status` must be one of:
  - `BACKLOG`
  - `TODO`
  - `IN_PROGRESS`
  - `REVIEW`
  - `DONE`
- `priority` must be one of:
  - `LOW`
  - `MEDIUM`
  - `HIGH`
  - `CRITICAL`
- `completedAt` is nullable.
- When a task changes from `DONE` to another status, the application layer must reset `completedAt` to `null`.
- The application layer must ensure that `completedAt` is only populated when the task status is `DONE`.

---

## Notification

Represents an in-application notification delivered to a user.

### Attributes

| Field     | Type     | Constraints    |
| --------- | -------- | -------------- |
| id        | UUID     | Primary Key    |
| userId    | UUID     | Foreign Key    |
| type      | Enum     | Required       |
| title     | String   | Required       |
| message   | String   | Required       |
| isRead    | Boolean  | Default: false |
| createdAt | DateTime | Required       |

### Notification Types

The MVP supports the following notification events:

- Workspace invitation.
- Project creation.
- Task assignment.
- Task status change.
- Task priority change.

- Task assignment, status change, and priority change notifications are sent only to the user currently assigned to the task.
- If the task has no assignee, no notification is created for these events.
- Project creation notifications are sent to all members of the workspace.

### Notification Recipients

Notification recipients depend on the event:

- Workspace invitation notifications are sent to the invited user.
- Project creation notifications are sent to all members of the workspace.
- Task assignment notifications are sent only to the user assigned to the task.
- Task status change notifications are sent only to the user assigned to the task.
- Task priority change notifications are sent only to the user assigned to the task.
- No task assignment, status change, or priority change notification is created when the task has no assignee.

---

## RefreshToken

Represents a persisted refresh token associated with a user session.

### Attributes

| Field     | Type     | Constraints |
| --------- | -------- | ----------- |
| id        | UUID     | Primary Key |
| userId    | UUID     | Foreign Key |
| tokenHash | String   | Required    |
| expiresAt | DateTime | Required    |
| createdAt | DateTime | Required    |

### Constraints

- `tokenHash` stores the hashed refresh token.
- Each refresh token belongs to exactly one user.
- Refresh tokens may be removed when the associated user is deleted.

---

# 6. Relationships

SprintHub uses explicit foreign key relationships to preserve referential integrity.

---

## User → WorkspaceMember

- One User may belong to multiple Workspaces.
- A Workspace may contain multiple Users.
- The relationship is implemented through the WorkspaceMember entity.

---

## Workspace → User (Owner)

- Each Workspace has exactly one Owner.
- The Owner is represented by the `ownerId` foreign key.
- The corresponding WorkspaceMember record must have the `OWNER` role.
- The workspace owner is explicitly assigned when the workspace is created.

---

## Workspace → Project

- One Workspace contains many Projects.
- Every Project belongs to exactly one Workspace.

---

## Project → Task

- One Project contains many Tasks.
- Every Task belongs to exactly one Project.

---

## User → Task

- A User may be assigned multiple Tasks.
- Task assignment is optional.
- A Task may have zero or one assigned User.
- If the assigned User is deleted, the Task remains and its `assigneeId` is set to `null`.

---

## User → Notification

- One User may receive many Notifications.
- Every Notification belongs to exactly one User.

---

## User → RefreshToken

- One User may own multiple Refresh Tokens.
- Refresh Tokens support authenticated sessions across devices.

---

# 7. Constraints

The database enforces several constraints to maintain consistency and protect data integrity.

---

## Primary Keys

Each entity uses a UUID as its primary key.

Entities include:

- User
- Workspace
- WorkspaceMember
- Project
- Task
- Notification
- RefreshToken

---

## Foreign Keys

Relationships are enforced through foreign key constraints.

Examples include:

- WorkspaceMember → User
- WorkspaceMember → Workspace
- Project → Workspace
- Task → Project
- Task → User (Assignee)
- Notification → User
- RefreshToken → User

---

## Unique Constraints

The following uniqueness rules are enforced:

| Entity          | Constraint                                    |
| --------------- | --------------------------------------------- |
| User            | `email` must be unique                        |
| Workspace       | `name` must be unique                         |
| WorkspaceMember | `workspaceId` and `userId` combination unique |
| Project         | `workspaceId` and `name` combination unique   |
| Task            | `projectId` and `title` combination unique    |

---

## Required Fields

The following business-critical attributes cannot be null:

### User

- `name`
- `email`
- `passwordHash`

### Workspace

- `name`
- `description`
- `ownerId`

### WorkspaceMember

- `workspaceId`
- `userId`
- `role`
- `joinedAt`

### Project

- `workspaceId`
- `name`
- `description`
- `status`

### Task

- `projectId`
- `title`
- `status`
- `priority`

### Notification

- `userId`
- `type`
- `title`
- `message`

### RefreshToken

- `userId`
- `tokenHash`
- `expiresAt`

---

## Default Values

The database defines the following default values:

- `WorkspaceMember.role` defaults to `MEMBER`.
- `Notification.isRead` defaults to `false`.
- `User.isActive` defaults to `false`.
- `Project.archived` defaults to `false`.
- UUID primary keys are generated automatically.
- `createdAt` timestamps are generated automatically.
- `updatedAt` timestamps are automatically updated when records change.

The `OWNER` role is assigned explicitly when a workspace is created and is not provided by the `WorkspaceMember.role` default.

---

# 8. Indexing Strategy

Indexes are used to improve query performance while maintaining efficient write operations.

---

## Primary Indexes

Every primary key is automatically indexed.

---

## Unique Indexes

The database uses unique constraints to enforce entity-level uniqueness.

Unique indexes include:

- `User.email`
- `Workspace.name`
- `WorkspaceMember(workspaceId, userId)`
- `Project(workspaceId, name)`
- `Task(projectId, title)`

---

## Foreign Key Indexes

Indexes are created for frequently queried foreign key fields.

The database includes indexes for:

- `Workspace.ownerId`
- `WorkspaceMember.userId`
- `Project.workspaceId`
- `Task.projectId`
- `Notification.userId`
- `RefreshToken.userId`

These indexes improve the performance of relationship lookups and frequently executed queries.

---

## Query Optimization

The indexing strategy prioritizes:

- Workspace lookups
- Project retrieval
- Task filtering
- User authentication
- Notification retrieval

Additional indexes may be introduced in future versions based on query analysis and production usage.

---

# 9. Cascade Rules

SprintHub uses explicit referential actions to preserve data integrity while preventing unintended deletion of independent records.

---

## Workspace Deletion

When a workspace is deleted:

- Its WorkspaceMember records are deleted.
- Its Projects are deleted.
- Tasks belonging to those Projects are deleted through the Project → Task cascade.

---

## Project Deletion

When a project is deleted:

- All Tasks belonging to the project are deleted.

---

## User Deletion

When a user is deleted:

- Their WorkspaceMember records are deleted.
- Their Notifications are deleted.
- Their RefreshTokens are deleted.
- Tasks assigned to the user are preserved.
- The `assigneeId` of assigned tasks is set to `null`.

---

## Task Assignment Removal

Removing the relationship between a Task and its assignee does not delete the Task or the User.

The Task remains with:

```text
assigneeId = null
```

---

## Refresh Token Cleanup

Expired RefreshTokens may be removed without affecting the associated User account.

---

# 10. Data Integrity

SprintHub relies on multiple mechanisms to preserve data integrity.

---

## Referential Integrity

Foreign key constraints ensure that every relationship references an existing parent entity.

---

## Entity Consistency

Every entity must remain internally consistent throughout its lifecycle.

Examples include:

- Every Project belongs to one Workspace.
- Every Task belongs to one Project.
- Every Notification belongs to one User.
- Every RefreshToken belongs to one User.

---

## Task Completion Integrity

The `completedAt` field represents the completion state of a task.

The following rules apply:

- `completedAt` is set when a task reaches the `DONE` status.
- `completedAt` must be `null` when the task is not in the `DONE` status.
- When a task changes from `DONE` to another status, `completedAt` must be reset to `null`.

This rule is enforced by the application layer because it depends on the task status transition.

---

## Transaction Consistency

Operations affecting multiple related entities should execute within database transactions whenever required.

Examples include:

- Workspace creation and owner membership creation.
- Workspace deletion.
- Project deletion.
- Project creation and creation of related notifications.
- Member invitation and notification creation.
- Task assignment and creation of the related notification when the task has an assignee.
- Task status change and creation of the related notification when the task has an assignee.
- Task priority change and creation of the related notification when the task has an assignee.

---

## Validation Responsibility

Data validation is performed at multiple layers:

| Layer       | Responsibility                                        |
| ----------- | ----------------------------------------------------- |
| Application | Business rules and request validation                 |
| Database    | Constraints, relationships, and referential integrity |

Workspace membership rules and task assignment eligibility are enforced by the application layer because they depend on relationships across multiple entities.

---

# 11. Migration Strategy

SprintHub manages all database schema changes using version-controlled migrations.

---

## Migration Tool

Database migrations are implemented using **Prisma Migrate**.

All schema changes must be applied through migration files to ensure consistency across development, testing, and production environments.

---

## Migration Principles

The migration strategy follows these principles:

- Version-controlled schema changes.
- Incremental migrations.
- Reproducible database state.
- No manual production schema modifications.

---

## Migration Workflow

```text
Schema Update
      │
      ▼
Generate Migration
      │
      ▼
Review Migration
      │
      ▼
Apply Migration
      │
      ▼
Verify Database
```

---

## Rollback Strategy

Schema changes should be designed to minimize rollback complexity.

When required, rollback procedures should be executed through version-controlled migrations rather than manual database modifications.

---

# 12. Security Considerations

The database stores sensitive application data and therefore follows strict security practices.

---

## Sensitive Data

Sensitive information includes:

- Password hashes
- Refresh Token hashes
- User credentials

Sensitive values are never stored in plain text.

---

## Access Control

Database access is restricted to the backend application.

Direct client access to the database is not permitted.

---

## Environment Configuration

Sensitive configuration is managed using environment variables.

Examples include:

- Database connection strings.
- Database credentials.

Secrets must never be committed to the source code repository.

---

# 13. Performance Considerations

The database has been designed to provide efficient query performance while maintaining data integrity.

---

## Query Performance

Performance strategies include:

- Primary key indexing.
- Foreign key indexing.
- Unique indexes.
- Efficient relational queries.

---

## Pagination

Large collections should be retrieved using pagination to reduce query cost and improve response times.

Examples include:

- Projects
- Tasks
- Notifications

---

## Future Optimizations

Future database optimizations may include:

- Additional indexes based on query analysis.
- Read replicas.
- Query optimization.
- Partitioning strategies for large datasets.

These optimizations are intentionally deferred until they become necessary based on application growth.

---

# 14. Future Evolution

The SprintHub data model has been designed to support future business capabilities without requiring major structural changes.

Potential future entities and capabilities include:

- Comment
- Attachment
- Activity
- Mention
- Label
- TimeEntry
- Additional notification types

These capabilities are intentionally excluded from the MVP but have been considered during the database design.

---

# 15. Conclusion

The Database Design Specification defines the relational data model that supports SprintHub.

It establishes the entities, relationships, constraints, indexing strategy, migration process, and data integrity rules that guide the implementation of the persistence layer.

Together with the Blueprint, PRD, SRS, ADD, ADS, ADRs, and Developer Guide, this document provides the authoritative reference for the application's database architecture and ensures consistency across development and future evolution.

---
