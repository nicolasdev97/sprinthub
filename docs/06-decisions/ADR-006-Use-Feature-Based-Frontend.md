# ADR-006 – Use a Feature-Based Frontend Architecture

> Architecture Decision Record documenting the adoption of a Feature-Based Frontend Architecture for SprintHub.

---

| Property            | Value                                     |
| ------------------- | ----------------------------------------- |
| **Document**        | ADR-006                                   |
| **Title**           | Use a Feature-Based Frontend Architecture |
| **Project**         | SprintHub                                 |
| **Version**         | 1.0                                       |
| **Status**          | Approved                                  |
| **Owner**           | Nicolás Palacio                           |
| **Decision Makers** | SprintHub Architecture Team               |
| **Last Updated**    | July 2026                                 |

---

# Table of Contents

1. Context
2. Decision
3. Decision Drivers
4. Alternatives Considered
5. Rationale
6. Architectural Principles
7. Folder Organization
8. Shared Resources
9. Scalability
10. Performance Considerations
11. Consequences
12. Trade-offs
13. Implementation Notes
14. Related Documents
15. References
16. Conclusion

---

# 1. Context

SprintHub is expected to evolve from a Minimum Viable Product (MVP) into a feature-rich SaaS platform.

As new business capabilities are introduced, the frontend architecture must remain:

- Easy to understand.
- Easy to maintain.
- Easy to scale.
- Easy to onboard new developers.
- Highly modular.

The application is organized around independent business domains, including:

- Authentication
- Dashboard
- Workspaces
- Projects
- Tasks
- Notifications
- User Profile

The selected architecture must support continuous feature growth while maintaining high cohesion and low coupling.

---

# 2. Decision

SprintHub adopts a **Feature-Based Frontend Architecture**.

The frontend is organized around business capabilities rather than technical file types.

Each feature owns its own:

- Components
- Hooks
- Services
- Validation Schemas
- Types
- Utilities
- API Layer

Shared functionality is extracted only when it is genuinely reusable across multiple features.

---

# 3. Decision Drivers

The following criteria guided this decision.

| Driver               | Priority |
| -------------------- | -------- |
| Maintainability      | High     |
| Scalability          | High     |
| Modularity           | High     |
| Developer Experience | High     |
| Low Coupling         | High     |
| High Cohesion        | High     |
| Learning Value       | High     |
| Code Discoverability | High     |

---

# 4. Alternatives Considered

## Option 1 – Type-Based Folder Structure

### Example

```text
components/
hooks/
pages/
services/
utils/
types/
```

### Advantages

- Easy to understand.
- Common in small React projects.
- Minimal setup.

### Disadvantages

- Features become scattered across technical folders.
- Navigation becomes harder as the application grows.
- Low cohesion.
- High coupling.
- A single feature often requires changes across multiple directories.

### Decision

**Rejected.**

Although suitable for small projects, this structure becomes difficult to maintain as the application scales.

---

## Option 2 – Atomic Design

### Advantages

- Strong UI consistency.
- Highly reusable components.
- Well-structured design system.

### Disadvantages

- Focuses on UI composition rather than business domains.
- Does not organize business logic.
- Can introduce unnecessary complexity for product-oriented applications.

### Decision

**Partially Adopted.**

Atomic Design principles are applied only within the shared UI component library where appropriate.

The overall frontend architecture remains Feature-Based.

---

## Option 3 – Feature-Based Architecture

### Advantages

- High cohesion.
- Low coupling.
- Excellent scalability.
- Easier navigation.
- Faster onboarding.
- Business-oriented organization.
- Better modularity.

### Disadvantages

- Requires discipline when extracting shared code.
- Slightly more elaborate initial structure.

### Decision

**Accepted.**

This architecture best supports SprintHub's long-term evolution while remaining easy to maintain and extend.

---

# 5. Rationale

SprintHub organizes the frontend around business domains rather than technical file types.

Core features include:

- Authentication
- Dashboard
- Workspaces
- Projects
- Tasks
- Notifications
- User Profile

Each feature encapsulates everything required for its implementation, including UI, business logic, API communication, validation, and supporting types.

This organization keeps related code together, improving maintainability, discoverability, and scalability as the application evolves.

---

# 6. Architectural Principles

The Feature-Based Architecture follows a set of principles that promote modularity and long-term maintainability.

---

## High Cohesion

Each feature owns its complete implementation.

For example, the **Tasks** feature contains:

- UI components
- API communication
- Hooks
- Validation schemas
- Types

Keeping related functionality together simplifies development and maintenance.

---

## Low Coupling

Features must not depend directly on each other's internal implementation.

Communication occurs only through well-defined interfaces or shared utilities.

---

## Separation of Concerns

Responsibilities are clearly divided:

- Components focus on presentation.
- Hooks encapsulate reusable logic.
- Services manage API communication.
- Schemas define validation.

---

## Reusability

Only functionality shared across multiple features belongs in shared directories.

Feature-specific code remains within its owning feature.

---

# 7. Folder Organization

The frontend follows the structure below.

```text
apps/

└── web/
    └── src/
        ├── app/
        ├── components/
        ├── features/
        ├── hooks/
        ├── lib/
        ├── providers/
        ├── services/
        ├── styles/
        ├── types/
        ├── utils/
        └── middleware.ts
```

Each feature follows a consistent internal structure.

Example:

```text
features/

tasks/

├── api/
├── components/
├── hooks/
├── schemas/
├── services/
├── types/
├── utils/
└── index.ts
```

A consistent organization reduces cognitive load, simplifies onboarding, and improves maintainability.

---

# 8. Shared Resources

Shared directories are reserved for functionality reused across multiple features.

Examples include:

| Directory     | Purpose                                                                          |
| ------------- | -------------------------------------------------------------------------------- |
| `components/` | Reusable UI components (Button, Modal, Input, Dialog).                           |
| `hooks/`      | Shared hooks (`useDebounce`, `useMediaQuery`, `useLocalStorage`).                |
| `lib/`        | Application-wide utilities (API client, authentication helpers, date utilities). |
| `providers/`  | React Context providers (Theme, Query, Authentication).                          |
| `styles/`     | Global styles.                                                                   |
| `types/`      | Shared TypeScript definitions.                                                   |

Business-specific code should remain inside its corresponding feature.

---

# 9. Scalability

Adding a new feature should require minimal changes to existing code.

Example:

```text
features/

comments/

├── api/
├── components/
├── hooks/
├── schemas/
├── services/
├── types/
└── utils/
```

Existing features remain unchanged, reducing regression risk and supporting incremental growth.

---

# 10. Performance Considerations

The architecture naturally supports frontend performance optimizations, including:

- Lazy loading.
- Dynamic imports.
- Code splitting.
- Memoization.
- Route-based loading.
- Feature isolation.

Each feature can evolve independently without impacting unrelated parts of the application.

---

# 11. Consequences

Adopting a Feature-Based Frontend Architecture establishes a modular, maintainable, and scalable frontend for SprintHub.

## Positive Consequences

- Excellent scalability.
- High maintainability.
- Clear code ownership.
- Better organization around business domains.
- Easier onboarding.
- Faster navigation.
- Strong modularity.

---

## Negative Consequences

- Increased number of folders.
- Requires discipline when deciding what belongs in shared directories.
- Slightly steeper learning curve for developers unfamiliar with Feature-Based Architecture.

These trade-offs are acceptable given SprintHub's long-term architectural goals.

---

# 12. Trade-offs

| Benefit                          | Trade-off                                              |
| -------------------------------- | ------------------------------------------------------ |
| Organization by business domains | More elaborate project structure                       |
| High cohesion                    | Requires disciplined feature boundaries                |
| Excellent scalability            | Additional folders compared to type-based organization |
| Easier feature ownership         | Shared code must be managed carefully                  |

Overall, the Feature-Based Architecture provides the best balance between maintainability, scalability, and developer productivity.

---

# 13. Implementation Notes

The frontend should follow these architectural conventions:

- Next.js App Router.
- TypeScript (strict mode).
- Feature-Based organization.
- TanStack Query for server state.
- React Hook Form for forms.
- Zod for validation.
- Tailwind CSS.
- shadcn/ui.

Every new feature must follow the established internal structure.

Shared directories should remain small and contain only functionality reused across multiple features.

---

# 14. Related Documents

This decision is supported by the following project documentation.

| Document        | Relationship                                                      |
| --------------- | ----------------------------------------------------------------- |
| Blueprint       | Defines the overall technical vision.                             |
| ADD             | Defines the frontend architecture.                                |
| Developer Guide | Defines the frontend project structure and development standards. |
| ADR-001         | Documents the adoption of Next.js App Router.                     |
| ADR-005         | Defines the Modular Monolith Architecture.                        |

---

# 15. References

- React Documentation
- Next.js Documentation
- Feature-Sliced Design
- Atomic Design — Brad Frost
- Clean Architecture — Robert C. Martin

---

# 16. Conclusion

SprintHub adopts a Feature-Based Frontend Architecture because it provides the best balance between scalability, maintainability, modularity, and developer experience.

By organizing the frontend around business capabilities instead of technical file types, the architecture remains easy to understand, extend, and maintain while supporting the long-term evolution of the application.

---
