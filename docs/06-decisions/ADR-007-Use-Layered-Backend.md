# ADR-007 – Use a Layered Backend Architecture

> Architecture Decision Record documenting the adoption of a Layered Backend Architecture for SprintHub.

---

| Property            | Value                              |
| ------------------- | ---------------------------------- |
| **Document**        | ADR-007                            |
| **Title**           | Use a Layered Backend Architecture |
| **Project**         | SprintHub                          |
| **Version**         | 1.0                                |
| **Status**          | Approved                           |
| **Owner**           | Nicolás Palacio                    |
| **Decision Makers** | SprintHub Architecture Team        |
| **Last Updated**    | July 2026                          |

---

# Table of Contents

1. Context
2. Decision
3. Decision Drivers
4. Alternatives Considered
5. Layer Responsibilities
6. Architectural Principles
7. Folder Organization
8. Communication Rules
9. Testing Strategy
10. Consequences
11. Trade-offs
12. Implementation Notes
13. Related Documents
14. References
15. Conclusion

---

# 1. Context

SprintHub's backend is expected to grow as new business capabilities are introduced.

Core business domains include:

- Authentication
- Users
- Workspaces
- Projects
- Tasks
- Notifications

To support long-term maintainability, business logic must remain isolated from HTTP concerns and persistence implementation details.

The backend architecture must provide:

- Clear separation of responsibilities.
- High maintainability.
- Independent testing.
- Low coupling.
- High cohesion.
- Future scalability.

The selected architecture complements the **Modular Monolith Architecture** adopted in ADR-005.

---

# 2. Decision

SprintHub adopts a **Layered Backend Architecture** within each business module.

Each module is organized into independent layers with clearly defined responsibilities.

Standard request flow:

```text
HTTP Request
      │
      ▼
Controller
      │
      ▼
Service
      │
      ▼
Repository
      │
      ▼
Prisma ORM
      │
      ▼
PostgreSQL
```

Each layer communicates only with the adjacent layer.

Business rules are implemented exclusively within the **Service** layer.

---

# 3. Decision Drivers

The following criteria guided this decision.

| Driver                 | Priority |
| ---------------------- | -------- |
| Maintainability        | High     |
| Testability            | High     |
| Separation of Concerns | High     |
| Scalability            | High     |
| Developer Experience   | High     |
| Low Coupling           | High     |
| High Cohesion          | High     |
| Code Readability       | High     |

---

# 4. Alternatives Considered

## Option 1 – MVC (Model-View-Controller)

### Advantages

- Widely adopted.
- Easy to understand.
- Large ecosystem.

### Disadvantages

- Controllers often become too large.
- Business logic tends to leak into controllers.
- Complex workflows are harder to test.
- Weak separation between application logic and infrastructure.

### Decision

**Rejected.**

While suitable for smaller applications, MVC often leads to "fat controllers" as complexity grows. SprintHub requires stronger separation of concerns.

---

## Option 2 – Controller → Repository

### Advantages

- Very simple.
- Minimal boilerplate.

### Disadvantages

- Business logic becomes scattered.
- Controllers interact directly with persistence.
- Logic is difficult to reuse.
- Lower maintainability.

### Decision

**Rejected.**

Business rules should never reside inside controllers.

---

## Option 3 – Clean Architecture

### Advantages

- Excellent separation of concerns.
- Highly testable.
- Framework independent.
- Highly scalable.

### Disadvantages

- Significant architectural complexity.
- Large number of abstractions.
- Steeper learning curve.
- Excessive for the current project scope.

### Decision

**Rejected.**

Although architecturally strong, Clean Architecture introduces more complexity than SprintHub currently requires. Several of its principles are adopted without implementing the full architecture.

---

## Option 4 – Layered Architecture

### Advantages

- Clear responsibilities.
- Excellent maintainability.
- Easy testing.
- Familiar development model.
- Good balance between simplicity and scalability.
- Integrates naturally with a Modular Monolith.

### Disadvantages

- Increased number of files.
- Slightly more boilerplate.

### Decision

**Accepted.**

Layered Architecture provides the best balance between maintainability, clarity, scalability, and development speed.

---

# 5. Layer Responsibilities

Each layer has a single, clearly defined responsibility.

---

## Controller Layer

Responsibilities:

- Receive HTTP requests.
- Parse and validate request data.
- Invoke application services.
- Return HTTP responses.

Controllers must remain thin and must never contain business rules.

---

## Service Layer

The Service layer contains the application's business logic.

Responsibilities:

- Business rules.
- Workflow orchestration.
- Authorization checks.
- Transaction coordination.
- Interaction between modules.

All business rules belong exclusively in this layer.

---

## Repository Layer

Responsibilities:

- Read data.
- Insert data.
- Update data.
- Delete data.
- Execute database queries through Prisma Client.

Repositories act exclusively as the persistence layer and must never contain business logic.

---

## Prisma Layer

Prisma Client is responsible for:

- SQL generation.
- Database communication.
- Type-safe queries.
- Transaction execution.

This layer abstracts database interactions while leveraging PostgreSQL as the underlying DBMS.

---

# 6. Architectural Principles

The Layered Backend Architecture follows a set of principles that promote maintainability and long-term evolution.

---

## Single Responsibility

Each layer has one reason to change.

Examples:

- Controllers change when the HTTP contract changes.
- Services change when business rules change.
- Repositories change when persistence requirements change.

---

## Separation of Concerns

Responsibilities remain isolated.

- Presentation logic stays in Controllers.
- Business logic stays in Services.
- Data access stays in Repositories.

---

## Dependency Direction

Dependencies flow only downward.

```text
Controller
      │
      ▼
Service
      │
      ▼
Repository
      │
      ▼
Database
```

Lower layers never depend on higher layers.

---

## Reusability

Business logic implemented in Services can be reused by multiple controllers without duplication.

---

# 7. Folder Organization

Every backend module follows the same internal structure.

```text
apps/

└── api/
    └── src/
        ├── modules/
        │   └── tasks/
        │       ├── controller/
        │       ├── service/
        │       ├── repository/
        │       ├── dto/
        │       ├── schema/
        │       ├── routes/
        │       ├── types/
        │       └── index.ts
        ├── shared/
        ├── config/
        ├── database/
        ├── middleware/
        ├── routes/
        ├── app.ts
        └── server.ts
```

This convention applies consistently across all business modules.

---

# 8. Communication Rules

Layer communication follows strict dependency rules.

Allowed:

```text
Controller
      │
      ▼
Service
      │
      ▼
Repository
```

Forbidden:

```text
Controller
      │
      ▼
Repository
```

```text
Repository
      │
      ▼
Controller
```

```text
Repository
      │
      ▼
Service
```

Repositories should never invoke business logic or higher application layers.

---

# 9. Testing Strategy

The Layered Architecture enables focused and independent testing.

| Layer      | Primary Focus                                              |
| ---------- | ---------------------------------------------------------- |
| Controller | HTTP status codes, request validation, response formatting |
| Service    | Business rules, authorization, workflows, transactions     |
| Repository | Database queries, persistence behavior, query correctness  |

This separation reduces mocking complexity and improves test quality.

---

# 10. Consequences

Adopting a Layered Backend Architecture establishes a maintainable, testable, and scalable backend structure for SprintHub.

## Positive Consequences

- Clear separation of responsibilities.
- High maintainability.
- Improved testability.
- Better code readability.
- Reduced code duplication.
- Strong separation between business logic and infrastructure.
- Easier onboarding for new developers.

---

## Negative Consequences

- Increased number of project files.
- Slightly more boilerplate.
- Requires architectural discipline to preserve layer boundaries.

These trade-offs are acceptable given SprintHub's long-term architectural goals.

---

# 11. Trade-offs

| Benefit                      | Trade-off                             |
| ---------------------------- | ------------------------------------- |
| High maintainability         | More project files                    |
| Clear separation of concerns | Additional boilerplate                |
| Better testability           | More structured architecture          |
| Explicit responsibilities    | Requires disciplined layer boundaries |

Overall, the Layered Backend Architecture provides the best balance between maintainability, clarity, scalability, and developer productivity.

---

# 12. Implementation Notes

Each backend module should follow these implementation conventions:

- Controllers contain no business logic.
- Services contain all business rules.
- Repositories interact exclusively with Prisma Client.
- Validation is implemented using Zod.
- DTOs define API contracts.
- Global middleware handles cross-cutting concerns.
- Errors are managed through a centralized error handler.
- Every module follows the same folder structure.

These conventions ensure consistency across the entire backend.

---

# 13. Related Documents

This decision is supported by the following project documentation.

| Document        | Relationship                                                     |
| --------------- | ---------------------------------------------------------------- |
| Blueprint       | Defines the overall technical vision.                            |
| ADD             | Defines the backend architecture.                                |
| Developer Guide | Defines the backend project structure and development standards. |
| ADR-003         | Documents the adoption of Prisma ORM.                            |
| ADR-005         | Defines the Modular Monolith Architecture.                       |

---

# 14. References

- Clean Architecture — Robert C. Martin
- Patterns of Enterprise Application Architecture — Martin Fowler
- Domain-Driven Design — Eric Evans
- Node.js Best Practices
- Express Documentation

---

# 15. Conclusion

SprintHub adopts a Layered Backend Architecture because it provides the best balance between maintainability, testability, separation of concerns, and development simplicity.

By isolating HTTP handling, business logic, and data access into dedicated layers, the backend remains easy to understand, maintain, and extend while supporting both the MVP and future product evolution without unnecessary architectural complexity.

---
