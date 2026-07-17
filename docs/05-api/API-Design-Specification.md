# SprintHub – API Design Specification (ADS)

> API design specification defining the REST API conventions, communication contract, authentication model, and endpoint design standards for SprintHub.

---

| Property         | Value                          |
| ---------------- | ------------------------------ |
| **Document**     | API Design Specification (ADS) |
| **Project**      | SprintHub                      |
| **Version**      | 1.0                            |
| **Status**       | Approved                       |
| **Owner**        | Nicolás Palacio                |
| **Last Updated** | July 2026                      |

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
13. Workspace API
14. Project API
15. Task API
16. Notification API
17. Health API
18. Pagination Standards
19. Filtering Standards
20. Sorting Standards
21. Search Standards
22. Rate Limiting
23. API Security
24. API Versioning Strategy
25. OpenAPI & Swagger
26. API Best Practices
27. Future API Evolution
28. API Change Management
29. Conclusion

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

| Environment | Base URL                                   |
| ----------- | ------------------------------------------ |
| Development | `http://localhost:3001/api/v1`             |
| Staging     | `https://staging-api.sprinthub.com/api/v1` |
| Production  | `https://api.sprinthub.com/api/v1`         |

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
GET /projects
```

### Bad

```text
GET /getProjects
```

---

## DP-02 – Stateless Communication

The server does not store client session state.

Every request contains all information required to process it.

---

## DP-03 – Predictable URLs

URLs use nouns instead of verbs.

Examples:

```text
/projects
/tasks
/workspaces
/users
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
/workspaces
/projects
/refresh-tokens
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
POST /auth/login
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
POST /auth/refresh
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
POST /auth/register
POST /auth/login
POST /auth/refresh
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

Every endpoint is versioned.

Current version:

```text
/api/v1
```

Future versions:

```text
/api/v2
```

Versioning ensures backward compatibility while allowing the API to evolve.

---

## Versioning Strategy

| Change Type     | Strategy         |
| --------------- | ---------------- |
| Major changes   | New API version  |
| Minor additions | Same API version |

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
  "priority": "HIGH",
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

SprintHub returns a standardized response structure.

The `message` field is optional and may be omitted for read-only operations such as GET requests.

---

## Successful Response

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

---

## Collection Response

```json
{
  "success": true,
  "message": "Projects retrieved successfully.",
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 45,
    "totalPages": 3
  }
}
```

---

## Empty Response

```json
{
  "success": true,
  "message": "No tasks found.",
  "data": []
}
```

---

# 9. Error Response Standards

Every API error follows a consistent structure.

---

## Error Response

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "field": "email",
      "message": "Email already exists."
    }
  ]
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
/users
/projects
/tasks
/workspaces
```

---

## Path Parameters

Examples:

```text
/projects/{projectId}
/tasks/{taskId}
```

---

## Query Parameters

Query parameters use camelCase.

Example:

```text
/tasks?page=1&pageSize=20&status=TODO
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

| Method | Endpoint         |
| ------ | ---------------- |
| POST   | `/auth/register` |

### Description

Creates a new user account.

---

## Login

| Method | Endpoint      |
| ------ | ------------- |
| POST   | `/auth/login` |

### Description

Authenticates a user and returns an Access Token together with a Refresh Token.

---

## Refresh Token

| Method | Endpoint        |
| ------ | --------------- |
| POST   | `/auth/refresh` |

### Description

Generates a new Access Token using a valid Refresh Token.

---

## Logout

| Method | Endpoint       |
| ------ | -------------- |
| POST   | `/auth/logout` |

### Description

Terminates the current authenticated session by invalidating the Refresh Token.

---

# 13. Workspace API

The Workspace API manages collaborative workspaces and their members.

---

## Endpoints

| Method | Endpoint                    | Description                        |
| ------ | --------------------------- | ---------------------------------- |
| GET    | `/workspaces`               | Retrieve all accessible workspaces |
| GET    | `/workspaces/{workspaceId}` | Retrieve a workspace               |
| POST   | `/workspaces`               | Create a workspace                 |
| PATCH  | `/workspaces/{workspaceId}` | Update a workspace                 |
| DELETE | `/workspaces/{workspaceId}` | Delete a workspace                 |

---

## Member Management

| Method | Endpoint                                       | Description        |
| ------ | ---------------------------------------------- | ------------------ |
| POST   | `/workspaces/{workspaceId}/members`            | Invite a member    |
| PATCH  | `/workspaces/{workspaceId}/members/{memberId}` | Update member role |
| DELETE | `/workspaces/{workspaceId}/members/{memberId}` | Remove a member    |

---

# 14. Project API

The Project API manages projects within workspaces.

---

## Endpoints

| Method | Endpoint                | Description        |
| ------ | ----------------------- | ------------------ |
| GET    | `/projects`             | Retrieve projects  |
| GET    | `/projects/{projectId}` | Retrieve a project |
| POST   | `/projects`             | Create a project   |
| PATCH  | `/projects/{projectId}` | Update a project   |
| DELETE | `/projects/{projectId}` | Delete a project   |

---

## Archive Project

| Method | Endpoint                        |
| ------ | ------------------------------- |
| PATCH  | `/projects/{projectId}/archive` |

### Description

Archives a project without permanently removing it.

---

# 15. Task API

The Task API manages project tasks.

---

## Endpoints

| Method | Endpoint          | Description     |
| ------ | ----------------- | --------------- |
| GET    | `/tasks`          | Retrieve tasks  |
| GET    | `/tasks/{taskId}` | Retrieve a task |
| POST   | `/tasks`          | Create a task   |
| PATCH  | `/tasks/{taskId}` | Update a task   |
| DELETE | `/tasks/{taskId}` | Delete a task   |

---

## Task Assignment

| Method | Endpoint                 |
| ------ | ------------------------ |
| PATCH  | `/tasks/{taskId}/assign` |

### Description

Assigns a task to a workspace member.

---

## Task Status

| Method | Endpoint                 |
| ------ | ------------------------ |
| PATCH  | `/tasks/{taskId}/status` |

### Description

Updates the task status.

---

## Task Priority

| Method | Endpoint                   |
| ------ | -------------------------- |
| PATCH  | `/tasks/{taskId}/priority` |

### Description

Updates the task priority.

---

# 16. Notification API

The Notification API provides access to in-application notifications.

---

## Endpoints

| Method | Endpoint                               | Description                 |
| ------ | -------------------------------------- | --------------------------- |
| GET    | `/notifications`                       | Retrieve notifications      |
| PATCH  | `/notifications/{notificationId}/read` | Mark a notification as read |

---

## Notification Scope

The MVP supports only in-application notifications.

Future versions may introduce:

- Email notifications
- Push notifications
- Real-time notifications

These notification channels are intentionally excluded from the MVP.

---

# 17. Health API

The Health API provides endpoints to verify the operational status of SprintHub services.

---

## Health Endpoints

| Method | Endpoint           | Purpose                    |
| ------ | ------------------ | -------------------------- |
| GET    | `/health`          | Overall application health |
| GET    | `/health/database` | Database connectivity      |

---

## Response Example

```json
{
  "status": "healthy",
  "services": {
    "application": "up",
    "database": "up"
  }
}
```

---

## Future Health Checks

As the platform evolves, additional health endpoints may be introduced for infrastructure components such as:

- Distributed caching
- Background workers
- Queue processing

These endpoints are intentionally excluded from the MVP.

---

# 18. Pagination Standards

Collection endpoints support pagination to improve performance and reduce response size.

---

## Query Parameters

| Parameter | Description              | Default |
| --------- | ------------------------ | ------- |
| page      | Page number              | 1       |
| pageSize  | Number of items per page | 20      |

---

## Example

```text
GET /tasks?page=2&pageSize=20
```

---

## Pagination Response

```json
{
  "pagination": {
    "page": 2,
    "pageSize": 20,
    "totalItems": 120,
    "totalPages": 6
  }
}
```

---

# 19. Filtering Standards

Collection endpoints may support filtering using query parameters.

---

## Example

```text
GET /tasks?status=IN_PROGRESS&priority=HIGH
```

---

## Supported Filters

Typical filters include:

- Status
- Priority
- Assignee
- Workspace
- Project

Available filters depend on the resource being queried.

---

# 20. Sorting Standards

Collection endpoints may support server-side sorting.

---

## Example

```text
GET /tasks?sortBy=createdAt&order=desc
```

---

## Parameters

| Parameter | Description            |
| --------- | ---------------------- |
| sortBy    | Field used for sorting |
| order     | asc or desc            |

---

# 21. Search Standards

Resources may support text-based searching.

---

## Example

```text
GET /projects?search=sprint
```

---

## Search Behavior

Search should:

- Be case-insensitive.
- Match partial text where appropriate.
- Return paginated results.

---

# 22. Rate Limiting

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

# 23. API Security

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

# 24. API Versioning Strategy

SprintHub follows a versioned API strategy to support future evolution without breaking existing clients.

---

## Current Version

The MVP exposes all endpoints under:

```text
/api/v1
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

# 25. OpenAPI & Swagger

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

The project follows the OpenAPI Specification and may expose interactive documentation through Swagger UI during development.

API documentation should remain synchronized with the implementation.

---

# 26. API Best Practices

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

# 27. Future API Evolution

The API has been designed to evolve without requiring major redesign.

Potential future capabilities include:

- Email notification endpoints.
- Push notification endpoints.
- Real-time communication endpoints.
- File upload endpoints.
- Comment endpoints.
- Activity timeline endpoints.
- Calendar integration endpoints.

Future infrastructure improvements may also introduce endpoints related to background processing or additional platform capabilities.

These features are intentionally excluded from the MVP.

---

# 28. API Change Management

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

# 29. Conclusion

The API Design Specification defines the communication contract for SprintHub.

It establishes the standards, conventions, authentication model, endpoint organization, request and response formats, and evolution strategy that guide the implementation of the REST API.

Together with the Blueprint, PRD, SRS, ADD, DDS, ADRs, and Developer Guide, this document provides the authoritative reference for API design and ensures consistency across the frontend, backend, and future integrations.

---
