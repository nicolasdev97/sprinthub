# SprintHub – API Design Specification (ADS)

> API design specification defining the REST API conventions, communication contract, authentication model, and endpoint design standards for SprintHub.

---

| Property         | Value                          |
| ---------------- | ------------------------------ |
| **Document**     | API Design Specification (ADS) |
| **Project**      | SprintHub                      |
| **Version**      | 1.1                            |
| **Status**       | Approved                       |
| **Owner**        | Nicolás Palacio                |
| **Last Updated** | September 2026                 |

---

# Table of Contents

1. Introduction
2. API Overview
3. API Design Principles
4. Authentication
5. Authorization
6. API Versioning
7. Request Standards
8. Response Standards
9. Error Response Standards
10. HTTP Status Codes
11. API Naming Conventions
12. Authentication API
13. User API
14. Workspace API
15. Project API
16. Task API
17. Notification API
18. Dashboard API
19. Health API
20. Filtering Standards
21. Sorting Standards
22. Search Standards
23. Rate Limiting
24. API Security
25. API Versioning Strategy
26. OpenAPI & Swagger
27. API Best Practices
28. Future API Evolution
29. API Change Management
30. Conclusion

---

# 1. Introduction

## Purpose

This API Design Specification (ADS) defines the design standards, conventions, and communication contract for SprintHub's REST API.

Rather than describing implementation details, this document specifies how the API behaves, how resources are exposed, how requests and responses are structured, and how clients interact with the backend.

This specification serves as the primary reference for frontend developers, backend developers, QA engineers, and API consumers.

---

## Scope

This document defines:

- API design principles
- Resource conventions
- Authentication
- Authorization
- Versioning
- Request format
- Response format
- Error handling
- HTTP status codes
- Endpoint specifications

Implementation details are documented separately in the Architecture Design Document (ADD) and the Developer Guide.

---

## Objectives

SprintHub's API has been designed to achieve the following objectives.

### Consistency

Every endpoint follows the same conventions.

---

### Predictability

Clients should easily understand how every endpoint behaves.

---

### Scalability

The API should evolve without breaking existing clients.

---

### Security

All protected resources require authentication and authorization.

---

### Simplicity

The API should remain intuitive while following REST best practices.

---

# 2. API Overview

SprintHub exposes a RESTful API over HTTPS.

The API serves as the communication layer between the frontend application and backend services.

Every request is stateless, and authentication information is included with every protected request.

---

## Base URLs

| Environment | Base URL                              |
| ----------- | ------------------------------------- |
| Development | `http://localhost:3001/api`           |
| Staging     | `<configured staging API URL>/api`    |
| Production  | `<configured production API URL>/api` |

---

## Supported Formats

| Item               | Value |
| ------------------ | ----- |
| Request Body       | JSON  |
| Response Body      | JSON  |
| Character Encoding | UTF-8 |
| Protocol           | HTTPS |

---

# 3. API Design Principles

SprintHub follows REST architectural principles to provide a predictable and maintainable API.

---

## DP-01 – Resource-Oriented Design

Endpoints represent resources rather than actions.

### Good

```text
GET /api/workspaces/{workspaceId}/projects
```

### Bad

```text
GET /api/getProjects
```

---

## DP-02 – Stateless Communication

The server does not store client session state.

Every request contains all information required to process it.

---

## DP-03 – Predictable URLs

URLs use nouns instead of verbs and reflect resource hierarchy for scoped collections.

Examples:

```text
/api/users/me
/api/workspaces
/api/workspaces/{workspaceId}/projects
/api/projects/{projectId}/tasks
```

---

## DP-04 – Standard HTTP Methods

| Method | Purpose                               |
| ------ | ------------------------------------- |
| GET    | Retrieve resources                    |
| POST   | Create resources                      |
| PATCH  | Partial updates                       |
| PUT    | Complete replacement (used sparingly) |
| DELETE | Remove resources                      |

---

## DP-05 – Consistent Naming

Resources always use:

- Lowercase
- Plural nouns
- Kebab-case when necessary

Examples:

```text
/api/workspaces
/api/workspaces/{workspaceId}/projects
/api/projects/{projectId}/tasks
```

---

## DP-06 – Idempotency

The following HTTP methods are idempotent:

- GET
- PUT
- DELETE

POST requests are not necessarily idempotent.

---

## DP-07 – Consistent Responses

Every endpoint follows the same response structure.

This reduces frontend complexity and provides a predictable integration experience.

---

# 4. Authentication

SprintHub protects private resources using JWT-based authentication together with Refresh Tokens.

---

## Authentication Flow

```text
User
    │
    ▼
POST /api/auth/login
    │
    ▼
Access Token
+
Refresh Token
    │
    ▼
Authenticated Requests
    │
    ▼
Access Token Expires
    │
    ▼
POST /api/auth/refresh
    │
    ▼
New Access Token
```

---

## Access Token

| Property   | Value                     |
| ---------- | ------------------------- |
| Format     | JWT                       |
| Expiration | 15 minutes                |
| Purpose    | Authenticate API requests |

---

## Refresh Token

| Property   | Value                                             |
| ---------- | ------------------------------------------------- |
| Expiration | 7 days                                            |
| Purpose    | Generate new Access Tokens                        |
| Storage    | Persisted as a cryptographic hash in the database |

---

## Protected Endpoints

Protected endpoints require authentication.

Example:

```http
Authorization: Bearer <access_token>
```

Authentication middleware validates:

- JWT signature
- Token expiration
- Claims

---

## Public Endpoints

Examples:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
```

---

# 5. Authorization

SprintHub implements **Role-Based Access Control (RBAC)**.

---

## Supported Roles

- OWNER
- ADMIN
- MEMBER

---

## Authorization Flow

```text
Request
    │
    ▼
Authentication
    │
    ▼
Authorization
    │
    ▼
Business Logic
    │
    ▼
Response
```

Authentication identifies the user.

Authorization determines whether the authenticated user is allowed to perform the requested action.

---

# 6. API Versioning

SprintHub exposes its API under the `/api` base path.

Current API base path:

```text
/api
```

Future API versions may introduce explicit versioning if required by breaking changes.

Versioning ensures backward compatibility while allowing the API to evolve.

---

# 7. Request Standards

Every request follows a consistent structure.

---

## Standard Headers

Typical request:

```http
Content-Type: application/json
Authorization: Bearer <access_token>
```

---

## Request Body

Example:

```json
{
  "title": "Implement login",
  "description": "Implement login for users",
  "dueDate": "2026-06-15"
}
```

---

## Request Validation

All incoming requests are validated before reaching the business layer.

Validation includes:

- Required fields
- String length
- Email format
- UUID format
- Enum validation
- Date validation

Invalid requests never reach business logic.

---

# 8. Response Standards

SprintHub follows standard REST response conventions using native HTTP status codes to indicate operation success. Successful responses return the requested resource or collection directly without wrapping payloads in a `success` or `message` envelope. User-facing feedback messages for successful operations are handled by the frontend presentation layer.

---

## Single Resource Response (`200 OK` / `201 Created`)

Endpoints that retrieve, create, or update a single resource return the JSON representation of the resource directly:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Platform Redesign",
  "description": "Core frontend and backend modernization",
  "status": "ACTIVE",
  "archived": false,
  "workspaceId": "3b241101-e2bb-4255-8caf-4136c566a962",
  "createdAt": "2026-09-20T12:00:00.000Z",
  "updatedAt": "2026-09-20T12:00:00.000Z"
}
```

---

## Collection Response (`200 OK`)

Endpoints that retrieve a list of resources return a JSON array directly. If no records match the query, an empty array is returned:

```json
[]
```

---

## No Content Response (`204 No Content`)

Operations that remove a resource (`DELETE`) or terminate a session (`POST /api/auth/logout`) return `HTTP 204 No Content` with an empty response body.

---

# 9. Error Response Standards

Every API error follows a consistent structure.

---

## Error Response

```json
{
  "success": false,
  "message": "Validation failed"
}
```

---

## Error Categories

- Validation Error
- Authentication Error
- Authorization Error
- Not Found
- Conflict
- Internal Server Error

---

## Error Principles

Errors should:

- Be human readable.
- Never expose sensitive information.
- Be consistent.
- Help clients resolve the issue.

---

# 10. HTTP Status Codes

SprintHub follows standard HTTP semantics.

| Code | Meaning               | Usage                                    |
| ---- | --------------------- | ---------------------------------------- |
| 200  | OK                    | Successful request                       |
| 201  | Created               | Resource created                         |
| 204  | No Content            | Successful request without response body |
| 400  | Bad Request           | Invalid request                          |
| 401  | Unauthorized          | Authentication required                  |
| 403  | Forbidden             | Insufficient permissions                 |
| 404  | Not Found             | Resource does not exist                  |
| 409  | Conflict              | Business rule conflict                   |
| 422  | Unprocessable Entity  | Validation error                         |
| 429  | Too Many Requests     | Rate limit exceeded                      |
| 500  | Internal Server Error | Unexpected server error                  |

---

# 11. API Naming Conventions

SprintHub follows consistent naming conventions across every endpoint.

---

## Resources

Resources use plural nouns.

Examples:

```text
/api/users
/api/workspaces
/api/projects
/api/tasks
/api/notifications
```

---

## Path Parameters

Collection creation and listing are scoped under their parent resource, while single-resource operations use direct resource identifiers.

Examples:

```text
/api/workspaces/{workspaceId}/projects
/api/projects/{projectId}
/api/projects/{projectId}/tasks
/api/tasks/{taskId}
```

---

## Query Parameters

Query parameters use camelCase.

Example:

```text
/api/projects/{projectId}/tasks?search=implement&status=TODO
```

---

## JSON Fields

JSON fields use camelCase.

Example:

```json
{
  "firstName": "Lionel",
  "lastName": "Messi"
}
```

---

# 12. Authentication API

The Authentication API manages user authentication and session lifecycle.

---

## Register

| Method | Endpoint             |
| ------ | -------------------- |
| POST   | `/api/auth/register` |

### Description

Creates a new user account.

---

## Login

| Method | Endpoint          |
| ------ | ----------------- |
| POST   | `/api/auth/login` |

### Description

Authenticates a user and returns an Access Token together with a Refresh Token.

---

## Refresh Token

| Method | Endpoint            |
| ------ | ------------------- |
| POST   | `/api/auth/refresh` |

### Description

Generates a new Access Token using a valid Refresh Token supplied via the `refreshToken` `HttpOnly` cookie.

In the MVP, refresh tokens are reusable across their 7-day lifetime and are not rotated upon each refresh request. The endpoint returns the new access token directly:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Logout

| Method | Endpoint           |
| ------ | ------------------ |
| POST   | `/api/auth/logout` |

### Description

Terminates the current authenticated session by deleting the persisted `RefreshToken` record from the database, clearing the `refreshToken` `HttpOnly` cookie, and returning `204 No Content`.

---

# 13. User API

The User API manages the authenticated user's account.

---

## Endpoints

| Method | Endpoint        | Description               |
| ------ | --------------- | ------------------------- |
| GET    | `/api/users/me` | Retrieve the current user |
| PATCH  | `/api/users/me` | Update the current user   |
| DELETE | `/api/users/me` | Delete the current user   |

### Delete Account

The `DELETE /api/users/me` endpoint allows an authenticated user to permanently delete their own account.

A user can only delete their own account through this endpoint.

#### Request Body

```json
{
  "confirmationName": "Lionel Messi"
}
```

#### Validation & Business Rules

- `confirmationName` is required and must match the authenticated user's full name (`firstName` + `" "` + `lastName`). If it does not match, the API returns `400 Bad Request`.
- A user cannot delete their account while owning one or more workspaces (`400 Bad Request`). Owned workspaces must be deleted first.
- Tasks created by or assigned to the user are preserved within their projects; their corresponding relational foreign keys (`createdById`, `assigneeId`) are set to `null`.
- On success, the endpoint returns `204 No Content`.

---

# 14. Workspace API

The Workspace API manages collaborative workspaces and their members.

---

## Endpoints

| Method | Endpoint                        | Description                        |
| ------ | ------------------------------- | ---------------------------------- |
| GET    | `/api/workspaces`               | Retrieve all accessible workspaces |
| GET    | `/api/workspaces/{workspaceId}` | Retrieve a workspace               |
| POST   | `/api/workspaces`               | Create a workspace                 |
| PATCH  | `/api/workspaces/{workspaceId}` | Update a workspace                 |
| DELETE | `/api/workspaces/{workspaceId}` | Delete a workspace                 |

---

### Create Workspace

| Method | Endpoint          |
| ------ | ----------------- |
| POST   | `/api/workspaces` |

#### Request Body

```json
{
  "name": "Engineering Team",
  "description": "Optional workspace description"
}
```

- `name` is required (1-100 characters, unique platform-wide).
- `description` is optional (nullable, max 500 characters).
- Automatically assigns the authenticated user as `OWNER`.
- Returns `201 Created` with the workspace object.

---

## Member Management

| Method | Endpoint                                           | Description                |
| ------ | -------------------------------------------------- | -------------------------- |
| GET    | `/api/workspaces/{workspaceId}/members`            | Retrieve workspace members |
| POST   | `/api/workspaces/{workspaceId}/members`            | Invite a member            |
| PATCH  | `/api/workspaces/{workspaceId}/members/{memberId}` | Update member role         |
| DELETE | `/api/workspaces/{workspaceId}/members/{memberId}` | Remove a member            |

---

### Invite Member

| Method | Endpoint                                |
| ------ | --------------------------------------- |
| POST   | `/api/workspaces/{workspaceId}/members` |

#### Authorization & Rules

- Accessible to workspace `OWNER` and `ADMIN`.
- The invited user must exist in the system and cannot already be a member of the workspace (`409 Conflict`).
- The `OWNER` role cannot be assigned (`400 Bad Request`).
- Returns `201 Created` with the created membership record and triggers an in-app notification to the invited user.

---

### Update Member Role

| Method | Endpoint                                           |
| ------ | -------------------------------------------------- |
| PATCH  | `/api/workspaces/{workspaceId}/members/{memberId}` |

#### Authorization & Rules

- Accessible strictly to the workspace `OWNER` (`403 Forbidden` for other roles).
- The `OWNER` role cannot be assigned via role update (`400 Bad Request`).
- The workspace owner's membership role cannot be altered (`403 Forbidden`).
- Returns `200 OK` with the updated membership.

---

### Remove Member

| Method | Endpoint                                           |
| ------ | -------------------------------------------------- |
| DELETE | `/api/workspaces/{workspaceId}/members/{memberId}` |

#### Authorization & Rules

- Accessible to workspace `OWNER` and `ADMIN`.
- The workspace owner cannot be removed (`403 Forbidden`).
- Administrators cannot remove other administrators (`403 Forbidden`); only the Owner can remove an Administrator.
- Returns `204 No Content` on successful removal.

---

# 15. Project API

The Project API manages projects within workspaces.

---

## Endpoints

| Method | Endpoint                                 | Description        |
| ------ | ---------------------------------------- | ------------------ |
| GET    | `/api/workspaces/{workspaceId}/projects` | Retrieve projects  |
| GET    | `/api/projects/{projectId}`              | Retrieve a project |
| POST   | `/api/workspaces/{workspaceId}/projects` | Create a project   |
| PATCH  | `/api/projects/{projectId}`              | Update a project   |
| DELETE | `/api/projects/{projectId}`              | Delete a project   |

---

### Create Project

| Method | Endpoint                                 |
| ------ | ---------------------------------------- |
| POST   | `/api/workspaces/{workspaceId}/projects` |

#### Request Body

```json
{
  "name": "SprintHub Core",
  "description": "Optional project description",
  "status": "PLANNING"
}
```

- `name` is required (unique within workspace).
- `description` is optional (nullable, max 1000 characters).
- `status` is required (`PLANNING`, `ACTIVE`, `COMPLETED`).
- Requires workspace `OWNER` or `ADMIN` role.
- Returns `201 Created` with the project object.

---

## Archive Project

| Method | Endpoint                            |
| ------ | ----------------------------------- |
| PATCH  | `/api/projects/{projectId}/archive` |

### Description

Archives a project without permanently removing it.

---

## Unarchive Project

| Method | Endpoint                              |
| ------ | ------------------------------------- |
| PATCH  | `/api/projects/{projectId}/unarchive` |

### Description

Restores an archived project to an active state.

---

# 16. Task API

The Task API manages project tasks.

---

## Endpoints

| Method | Endpoint                          | Description     |
| ------ | --------------------------------- | --------------- |
| GET    | `/api/projects/{projectId}/tasks` | Retrieve tasks  |
| GET    | `/api/tasks/{taskId}`             | Retrieve a task |
| POST   | `/api/projects/{projectId}/tasks` | Create a task   |
| PATCH  | `/api/tasks/{taskId}`             | Update a task   |
| DELETE | `/api/tasks/{taskId}`             | Delete a task   |

---

## Create Task

| Method | Endpoint                          |
| ------ | --------------------------------- |
| POST   | `/api/projects/{projectId}/tasks` |

#### Authorization & Validation Rules

- Accessible to workspace `OWNER`, `ADMIN`, and `MEMBER`.
- Caller must be an active member of the workspace owning the project (`403 Forbidden` if not).
- Tasks cannot be created within an archived project (`400 Bad Request`).
- Task `title` must be unique within the project (`409 Conflict`).
- If `assigneeId` is provided, the designated user must be an active member of the workspace (`403 Forbidden` if not).
- Initial task status is automatically set to `TODO`.
- Returns `201 Created` with the task object.

---

## Update Task

| Method | Endpoint              |
| ------ | --------------------- |
| PATCH  | `/api/tasks/{taskId}` |

#### Authorization & Validation Rules

- Accessible to workspace `OWNER`, `ADMIN`, and `MEMBER`.
- Caller must be an active member of the workspace owning the task's project (`403 Forbidden` if not).
- Tasks in archived projects cannot be updated (`400 Bad Request`).
- If `title` is updated, it must remain unique within the project (`409 Conflict`).
- General task update does not modify task status, priority, or assignee (handled by dedicated endpoints).
- Returns `200 OK` with the updated task object.

---

## Task Assignment & Unassignment

| Method | Endpoint                     |
| ------ | ---------------------------- |
| PATCH  | `/api/tasks/{taskId}/assign` |

### Description

Assigns a task to a workspace member or unassigns the current assignee.

#### Authorization & Validation Rules

- Accessible strictly to workspace `OWNER` and `ADMIN`. Workspace `MEMBER` users receive `403 Forbidden`.
- Tasks within an archived project cannot be assigned or unassigned (`400 Bad Request`).
- Providing `{ "assigneeId": "<userId>" }` assigns the task to the specified workspace member (the target user must be an active member of the workspace; otherwise returns `403 Forbidden`) and generates a task assignment notification.
- Providing `{ "assigneeId": null }` unassigns the task (clearing the current assignee without generating a notification).
- Returns `200 OK` with the updated task object.

---

## Task Status

| Method | Endpoint                     |
| ------ | ---------------------------- |
| PATCH  | `/api/tasks/{taskId}/status` |

### Description

Updates the task status.

#### Authorization & Validation Rules

- Accessible to workspace `OWNER`, `ADMIN`, and `MEMBER`.
- Caller must be an active member of the workspace owning the task's project (`403 Forbidden` if not).
- Tasks within an archived project cannot have their status changed (`400 Bad Request`).
- Valid status values: `BACKLOG`, `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`.
- Automatically sets `completedAt` to the current timestamp when transitioned to `DONE`, or resets `completedAt` to `null` when transitioned out of `DONE`.
- Triggers a notification to the task's assignee if one is assigned.
- Returns `200 OK` with the updated task object.

---

## Task Priority

| Method | Endpoint                       |
| ------ | ------------------------------ |
| PATCH  | `/api/tasks/{taskId}/priority` |

### Description

Updates the task priority.

#### Authorization & Validation Rules

- Accessible to workspace `OWNER`, `ADMIN`, and `MEMBER`.
- Caller must be an active member of the workspace owning the task's project (`403 Forbidden` if not).
- Tasks within an archived project cannot have their priority changed (`400 Bad Request`).
- Valid priority values: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- Triggers a notification to the task's assignee if one is assigned.
- Returns `200 OK` with the updated task object.

---

## Delete Task

| Method | Endpoint              |
| ------ | --------------------- |
| DELETE | `/api/tasks/{taskId}` |

### Description

Permanently deletes a task.

### Authorization Rules

- A task can be deleted by the user who created it (`createdById`).
- Workspace `OWNER` and `ADMIN` users can delete any task within the workspace.
- If a workspace member attempts to delete a task created by another user, the API returns `403 Forbidden`.
- Returns `204 No Content` on successful deletion.

---

# 17. Notification API

The Notification API provides access to in-application notifications.

---

## Endpoints

| Method | Endpoint                                   | Description                 |
| ------ | ------------------------------------------ | --------------------------- |
| GET    | `/api/notifications`                       | Retrieve notifications      |
| PATCH  | `/api/notifications/{notificationId}/read` | Mark a notification as read |

---

## Notification Access

Users can retrieve only their own notifications.

The authenticated user is determined from the access token.

`GET /api/notifications` returns only notifications associated with the authenticated user.

The API does not provide an endpoint for directly creating notifications. Notifications are generated internally as a result of business events handled by the application.

---

## Notification Scope

The MVP supports only in-application notifications.

The following notification events are supported:

- Workspace invitations.
- Project creation.
- Task assignment.
- Task status changes.
- Task priority changes.

Notification recipients depend on the event:

- Workspace invitation notifications are sent to the invited user.
- Project creation notifications are sent to all members of the workspace.
- Task assignment notifications are sent only to the user assigned to the task.
- Task status change notifications are sent only to the user assigned to the task.
- Task priority change notifications are sent only to the user assigned to the task.
- If a task has no assignee, no notification is created for task assignment, status change, or priority change events.

---

# 18. Dashboard API

The Dashboard API provides high-level consolidated project and task metrics for a specific workspace.

---

## Get Workspace Dashboard

| Method | Endpoint                                  | Description                   |
| ------ | ----------------------------------------- | ----------------------------- |
| GET    | `/api/workspaces/{workspaceId}/dashboard` | Retrieve consolidated metrics |

### Description

Retrieves aggregate project and task counters for the specified workspace. This endpoint prevents the frontend from having to request raw collections of projects and tasks to compute metrics on the client side.

### Authorization & Validation Rules

- Accessible to workspace `OWNER`, `ADMIN`, and `MEMBER`.
- Caller must be an active member of the specified workspace.
- If the user is not a member of the workspace (or the workspace does not exist), the API returns `404 Not Found` to prevent workspace enumeration (anti-IDOR).

### Response (`200 OK`)

```json
{
  "activeProjects": 3,
  "pendingTasks": 12,
  "completedTasks": 25,
  "overdueTasks": 2
}
```

#### Field Specifications

- `activeProjects`: Count of projects in the workspace where `status == "ACTIVE"` and `archived == false`.
- `pendingTasks`: Count of tasks across the workspace projects whose status is `BACKLOG`, `TODO`, `IN_PROGRESS`, or `REVIEW`.
- `completedTasks`: Count of tasks across the workspace projects whose status is `DONE`.
- `overdueTasks`: Count of tasks across the workspace projects that are not completed (`status != "DONE"`) and whose `dueDate` is earlier than the current timestamp.

---

# 19. Health API

The Health API provides an endpoint to verify the operational status of SprintHub services.

---

## Health Endpoint

| Method | Endpoint      | Purpose                    |
| ------ | ------------- | -------------------------- |
| GET    | `/api/health` | Overall application health |

---

## Response Example

```json
{
  "success": true,
  "message": "SprintHub API is running"
}
```

---

## Future Health Checks

As the platform evolves, additional health endpoints may be introduced for future infrastructure components such as:

- Redis distributed caching.
- Background workers.
- Queue processing.

These endpoints are intentionally excluded from the MVP.

---

# 20. Filtering Standards

Filtering is supported for resources where filtering criteria are defined by the product requirements.

---

## Workspaces

Workspaces do not support attribute-based filtering.

---

## Projects

Projects support filtering by:

- `status`
- `archived`

---

## Tasks

Tasks support filtering by:

- `status`
- `priority`
- `assigneeId`
- `dueDate`

---

## Example

```text
GET /api/projects/{projectId}/tasks?status=IN_PROGRESS&priority=HIGH
```

---

# 21. Sorting Standards

Collection resources support sorting by the fields defined for each resource.

---

## Workspaces

Workspaces support sorting by:

- `name`
- `createdAt`

---

## Projects

Projects support sorting by:

- `name`
- `createdAt`

---

## Tasks

Tasks support sorting by:

- `createdAt`
- `dueDate`
- `priority`

---

## Sort Order

Supported sort orders are:

- `asc`
- `desc`

---

## Example

```text
GET /api/workspaces?sortBy=name&sortOrder=asc
```

---

## Parameters

| Parameter | Description            |
| --------- | ---------------------- |
| sortBy    | Field used for sorting |
| sortOrder | asc or desc            |

---

# 22. Search Standards

Search is supported for collection resources using the primary searchable field defined for each resource.

---

## Workspaces

Workspaces support search by:

- `name`

---

## Projects

Projects support search by:

- `name`

---

## Tasks

Tasks support search by:

- `title`

Task search is limited exclusively to the `title` field.

---

## Example

```text
GET /api/workspaces/{workspaceId}/projects?search=sprint
```

Search matches only the project `name`.

---

## Search Behavior

Search should:

- Be case-insensitive.
- Match partial text where appropriate.

Search is restricted to the primary `name` field of workspaces and projects, and to the `title` field of tasks.

---

# 23. Rate Limiting

Rate limiting protects the API from abuse and excessive traffic.

---

## Default Policy

| Endpoint Type           | Limit                   |
| ----------------------- | ----------------------- |
| Public endpoints        | 100 requests per minute |
| Authenticated endpoints | 300 requests per minute |

---

## Exceeded Limit

When the limit is exceeded, the API returns:

```http
HTTP 429 Too Many Requests
```

---

# 24. API Security

SprintHub applies multiple security mechanisms across the API.

---

## Security Features

The API implements:

- HTTPS
- JWT Authentication
- Refresh Token Authentication
- HttpOnly Cookies
- Password Hashing
- Input Validation
- CORS
- Helmet
- Rate Limiting

---

## Security Principles

The API follows these principles:

- Least Privilege
- Defense in Depth
- Secure by Default
- Fail Securely

Sensitive information is never exposed through API responses.

---

# 25. API Versioning Strategy

SprintHub follows a versioned API strategy to support future evolution without breaking existing clients.

---

## Current API Base Path

The MVP exposes all endpoints under:

```text
/api
```

---

## Versioning Principles

New API versions are introduced only for breaking changes.

Examples of breaking changes include:

- Removing endpoints.
- Renaming resources.
- Changing request or response structures.
- Removing required fields.

Non-breaking additions, such as optional fields or new endpoints, may be introduced within the current API version.

---

# 26. OpenAPI & Swagger

SprintHub supports API documentation through the OpenAPI Specification.

---

## Documentation Goals

The API documentation should:

- Describe every endpoint.
- Define request and response schemas.
- Document authentication requirements.
- Include example requests and responses.
- Facilitate frontend and backend integration.

---

## Documentation Standard

SprintHub documents its REST API using:

- OpenAPI Specification
- Swagger UI

OpenAPI defines the API contract, including endpoints, request and response schemas, authentication requirements, and available parameters.

Swagger UI provides interactive API documentation during development.

The ADS serves as the authoritative design reference for the API, while the OpenAPI documentation must remain synchronized with the implementation.

---

# 27. API Best Practices

SprintHub follows industry-standard API design practices.

---

## Design Guidelines

The API should:

- Remain RESTful.
- Be predictable.
- Return consistent responses.
- Use appropriate HTTP status codes.
- Validate all incoming requests.
- Minimize unnecessary payloads.
- Follow secure authentication practices.

---

## Error Handling

Errors should:

- Be consistent.
- Be descriptive.
- Avoid exposing sensitive implementation details.
- Help API consumers identify and resolve issues.

---

# 28. Future API Evolution

The API has been designed to evolve as new SprintHub capabilities are introduced.

Potential future API capabilities include:

## Collaboration

- Comment endpoints.
- File attachment endpoints.
- Activity timeline endpoints.
- Mention endpoints.
- Team chat endpoints.

## Productivity

- Label endpoints.
- Custom field endpoints.
- Time tracking endpoints.
- Sprint planning endpoints.
- Kanban board improvement endpoints.

## Notifications

- Email notification endpoints.
- Push notification endpoints.
- Real-time notification endpoints.

## Integrations

- Google Calendar integration endpoints.
- GitHub integration endpoints.
- Slack integration endpoints.
- Microsoft Teams integration endpoints.

## Infrastructure

Future infrastructure improvements may introduce API capabilities related to:

- Redis distributed caching.
- Background workers.
- Queue processing.
- WebSockets.
- Horizontal scaling.

These capabilities are intentionally excluded from the MVP and may be introduced in future versions.

---

# 29. API Change Management

API changes should be introduced in a controlled and backward-compatible manner.

---

## Change Principles

Changes should:

- Preserve backward compatibility whenever possible.
- Be documented before implementation.
- Be versioned when required.
- Be reviewed before release.

---

## Deprecation Policy

Deprecated endpoints should:

- Remain available during the defined deprecation period.
- Be clearly documented.
- Provide migration guidance when a replacement endpoint exists.

---

# 30. Conclusion

The API Design Specification defines the communication contract for SprintHub.

It establishes the standards, conventions, authentication model, endpoint organization, request and response formats, and evolution strategy that guide the implementation of the REST API.

Together with the Blueprint, PRD, SRS, ADD, DDS, ADRs, and Developer Guide, this document provides the authoritative reference for API design and ensures consistency across the frontend, backend, and future integrations.

---
