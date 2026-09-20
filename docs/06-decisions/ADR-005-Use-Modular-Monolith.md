# ADR-005 – Adopt a Modular Monolith Architecture

> Architecture Decision Record documenting the adoption of a Modular Monolith Architecture for SprintHub's backend.

---

| Property            | Value                                 |
| ------------------- | ------------------------------------- |
| **Document**        | ADR-005                               |
| **Title**           | Adopt a Modular Monolith Architecture |
| **Project**         | SprintHub                             |
| **Version**         | 1.1                                   |
| **Status**          | Approved                              |
| **Owner**           | Nicolás Palacio                       |
| **Decision Makers** | SprintHub Architecture Team           |
| **Last Updated**    | September 2026                        |

---

# Table of Contents

1. Context
2. Decision
3. Decision Drivers
4. Alternatives Considered
5. Rationale
6. Architectural Principles
7. Module Organization
8. Module Communication
9. Scalability Considerations
10. Performance Considerations
11. Security Considerations
12. Consequences
13. Trade-offs
14. Implementation Notes
15. Related Documents
16. References
17. Conclusion

---

# 1. Context

SprintHub is a modern Software-as-a-Service (SaaS) application designed to support long-term growth while remaining simple to develop, deploy, and maintain.

The backend architecture must provide:

- Modular development.
- High maintainability.
- Clear separation of concerns.
- Scalable feature growth.
- Efficient testing.
- Fast deployments.
- Low operational complexity.

Although SprintHub is initially developed by a single engineer, the architecture should remain suitable for future collaboration and product evolution.

The selected approach must balance simplicity, maintainability, and scalability without introducing unnecessary infrastructure complexity.

---

# 2. Decision

SprintHub adopts a **Modular Monolith Architecture** for the backend.

The application is deployed as a single backend service while internally organizing the codebase into independent business modules.

Each module encapsulates its own business logic and data access components, with internal files and folders organized according to the needs of the module.

Modules may contain components such as:

- Controllers.
- Services.
- Repositories.
- DTOs.
- Validation Schemas.
- Routes.
- Types.

Not every module is required to contain all of these components.

---

# 3. Decision Drivers

The following criteria guided this decision.

| Driver                 | Priority |
| ---------------------- | -------- |
| Maintainability        | High     |
| Scalability            | High     |
| Simplicity             | High     |
| Low Operational Cost   | High     |
| Developer Productivity | High     |
| Testability            | High     |
| Future Evolution       | High     |
| Learning Value         | High     |

---

# 4. Alternatives Considered

## Option 1 – Traditional Monolith

### Advantages

- Very simple architecture.
- Easy deployment.
- Minimal infrastructure.

### Disadvantages

- High coupling.
- Difficult maintenance.
- Mixed business logic.
- Limited scalability.

### Decision

**Rejected.**

A traditional monolith does not provide the modularity required for SprintHub's long-term goals.

---

## Option 2 – Layered Monolith

### Advantages

- Clear separation into layers.
- Easier testing.
- Simple deployment.

### Disadvantages

- Features become scattered across technical folders.
- Lower feature cohesion.
- Strong coupling between modules.

### Decision

**Rejected.**

Although an improvement over a traditional monolith, this architecture becomes harder to navigate and maintain as the application grows.

---

## Option 3 – Microservices

### Advantages

- Independent deployments.
- Independent scalability.
- Strong service isolation.
- Technology flexibility.

### Disadvantages

- High operational complexity.
- Distributed transactions.
- Network latency.
- Infrastructure overhead.
- Increased DevOps requirements.

### Decision

**Rejected.**

Microservices introduce operational complexity that is unnecessary for SprintHub's current scope. The project does not yet require independently deployable services.

---

## Option 4 – Modular Monolith

### Advantages

- Strong modularity.
- Single deployment.
- High maintainability.
- Excellent scalability.
- Easier testing.
- Lower infrastructure costs.
- Clear migration path to microservices.

### Disadvantages

- Module boundaries require architectural discipline.
- The entire backend is deployed as a single unit.

### Decision

**Accepted.**

The Modular Monolith provides the best balance between simplicity, maintainability, scalability, and developer productivity.

---

# 5. Rationale

SprintHub is organized around business domains rather than technical layers.

Core modules include:

- Authentication
- Workspaces
- Projects
- Tasks
- Notifications

Each module encapsulates its own business logic and internal implementation while respecting the boundaries defined by the backend architecture.

---

# 6. Architectural Principles

The Modular Monolith follows a set of architectural principles that promote maintainability and long-term evolution.

---

## Module Independence

Each module encapsulates its own business logic and internal implementation.

Modules may contain controllers, services, repositories, DTOs, validation schemas, routes, types, and other components according to their specific requirements.

Modules expose only their public interfaces and do not depend on another module's internal implementation.

---

## High Cohesion

Related functionality is grouped within the same business module.

For example, all task-related functionality remains inside the **Tasks** module.

---

## Low Coupling

Modules communicate only through public services.

Implementation details remain private to each module.

---

## Separation of Concerns

Business modules follow the Layered Backend Architecture where applicable:

- Controller
- Service
- Repository

Each layer has a single, well-defined responsibility.

Modules may omit layers or components that are not required by their specific responsibilities.

---

# 7. Module Organization

Each business module is organized according to its specific needs.

Example:

```text
apps/

└── api/
    └── src/
        ├── config/
        ├── database/
        ├── middleware/
        ├── modules/
        │   ├── auth/
            │     ├── controller/
            │     ├── service/
            │     ├── repository/
            │     ├── dto/
            │     ├── schema/
            │     └── types/
        │   ├── users/
        │   ├── workspaces/
        │   ├── projects/
        │   ├── tasks/
        │   └── notifications/
        ├── routes/
        ├── shared/
        ├── app.ts
        └── server.ts
```

The internal structure is not required to be identical across all modules. Components are added only when required by the module's responsibilities.

---

# 8. Module Communication

Modules communicate through their public services.

A module must not access another module's repository or database layer directly.

Preferred interaction:

```text
Module A Service
      │
      ▼
Module B Public Service
      │
      ▼
Module B Repository
```

Instead of:

```text
TaskRepository
      │
      ▼
WorkspaceRepository
```

This preserves module boundaries and keeps persistence concerns encapsulated within each module.

---

# 9. Scalability Considerations

The Modular Monolith supports incremental growth by allowing new business modules to be added without restructuring the existing architecture.

Potential future modules and capabilities include:

- Comments
- File Uploads
- Activity Timeline
- Calendar Integration
- Push Notifications
- Email Notifications

If future requirements justify it, individual modules may be extracted into independent microservices.

Examples include:

- Notification Service
- Authentication Service
- AI Service

Because clear module boundaries already exist, this migration can be performed incrementally.

---

# 10. Performance Considerations

A Modular Monolith avoids many of the performance costs associated with distributed systems.

Benefits include:

- No network communication between modules.
- No serialization overhead.
- No service discovery.
- No distributed transactions.
- Direct in-process communication.

This results in lower latency, simpler debugging, and reduced operational overhead.

---

# 11. Security Considerations

Cross-cutting security concerns are centralized while business logic remains isolated within each module.

Shared infrastructure includes:

- Authentication Middleware
- Authorization Middleware
- Global Error Handling
- Logging

Request validation is performed using the validation schemas defined within each business module.

---

# 12. Consequences

Adopting a Modular Monolith Architecture establishes a maintainable and scalable backend while preserving the simplicity of a single deployment.

## Positive Consequences

- Clear module boundaries.
- High cohesion.
- Low coupling.
- Simplified deployment.
- Lower operational costs.
- Faster development.
- Easier testing.
- Straightforward evolution toward future microservices.

---

## Negative Consequences

- The entire backend is deployed as a single unit.
- Independent scaling of individual modules is not possible.
- Module boundaries rely on development discipline.

These trade-offs are acceptable given SprintHub's current scope and long-term architectural goals.

---

# 13. Trade-offs

| Benefit                      | Trade-off                              |
| ---------------------------- | -------------------------------------- |
| Simple deployment            | No independent service deployment      |
| High cohesion                | Requires disciplined module boundaries |
| Lower operational complexity | Limited independent scalability        |
| Faster development           | Single deployment unit                 |

Overall, the Modular Monolith provides the best balance between simplicity, maintainability, and future evolution.

---

# 14. Implementation Notes

The backend should follow these architectural conventions:

- A single backend application.
- Independent business modules.
- Layered Architecture within each module.
- Shared infrastructure for cross-cutting concerns.
- No direct repository-to-repository communication between modules.
- Communication through public services only.
- Consistent architectural conventions across modules.
- Internal folder structures should reflect each module's specific responsibilities.

These conventions are defined in the Architecture Design Document (ADD) and Developer Guide.

Future architectural evolution may extract individual modules into independent services if business and scalability requirements justify it.

---

# 15. Related Documents

This decision is supported by the following project documentation.

| Document        | Relationship                                                               |
| --------------- | -------------------------------------------------------------------------- |
| Blueprint       | Defines the overall technical vision and architectural direction.          |
| ADD             | Defines the backend architecture and system structure.                     |
| DDS             | Defines the detailed technical and domain design.                          |
| ADS             | Defines the REST API design and communication contract.                    |
| Developer Guide | Defines backend project structure and development standards.               |
| ADR-002         | Documents the adoption of PostgreSQL.                                      |
| ADR-003         | Documents the adoption of Prisma ORM.                                      |
| ADR-007         | Defines the Layered Backend Architecture used within each business module. |

---

# 16. References

- Martin Fowler — _Monolith First_
- Martin Fowler — _Microservices_
- Simon Brown — _Modular Monoliths_
- _Domain-Driven Design_ — Eric Evans
- _Clean Architecture_ — Robert C. Martin

---

# 17. Conclusion

SprintHub adopts a Modular Monolith Architecture for its backend, organizing the application into cohesive business modules within a single deployable service.

Each module encapsulates its business logic, persistence, validation, routes, and related components while communicating with other modules through defined service interfaces.

This architecture provides a maintainable and scalable foundation for the current MVP while preserving a clear path for future evolution, including the potential extraction of individual modules into independent services when justified by business or scalability requirements.

---
