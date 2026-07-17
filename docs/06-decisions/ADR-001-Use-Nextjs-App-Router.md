# ADR-001 – Adopt Next.js App Router

> Architecture Decision Record documenting the adoption of Next.js App Router as the frontend framework for SprintHub.

---

| Property            | Value                       |
| ------------------- | --------------------------- |
| **Document**        | ADR-001                     |
| **Title**           | Adopt Next.js App Router    |
| **Project**         | SprintHub                   |
| **Version**         | 1.0                         |
| **Status**          | Approved                    |
| **Owner**           | Nicolás Palacio             |
| **Decision Makers** | SprintHub Architecture Team |
| **Last Updated**    | July 2026                   |

---

# Table of Contents

1. Context
2. Decision
3. Decision Drivers
4. Alternatives Considered
5. Rationale
6. Architectural Implications
7. Consequences
8. Trade-offs
9. Implementation Notes
10. Related Documents
11. References
12. Conclusion

---

# 1. Context

SprintHub requires a modern frontend architecture capable of supporting the MVP while remaining scalable, maintainable, and aligned with current software engineering practices.

The selected framework should provide:

- High performance
- Type safety
- Excellent developer experience
- Modular architecture
- Server-side rendering capabilities
- Efficient routing
- Production-ready deployment
- Strong community support
- SEO support where applicable

As SprintHub is intended to showcase modern SaaS development practices, the frontend technology should follow widely adopted industry standards.

---

# 2. Decision

SprintHub adopts **Next.js App Router** as the official frontend framework.

The frontend will be built using:

- Next.js App Router
- React
- TypeScript
- Server Components by default
- Client Components only when interactivity is required

The legacy **Pages Router** will not be used.

---

# 3. Decision Drivers

The following criteria guided this decision.

| Driver                | Priority |
| --------------------- | -------- |
| Scalability           | High     |
| Developer Experience  | High     |
| Performance           | High     |
| Industry Adoption     | High     |
| Learning Value        | High     |
| Maintainability       | High     |
| SEO Support           | Medium   |
| Deployment Simplicity | Medium   |

---

# 4. Alternatives Considered

## Option 1 – React + Vite

### Advantages

- Fast development server.
- Lightweight.
- Excellent React support.

### Disadvantages

- Requires additional libraries for routing, rendering, metadata management, image optimization, and other production features.
- No built-in server-side rendering.
- Greater architectural and configuration effort.

### Decision

**Rejected.**

Although React + Vite is an excellent choice for many applications, SprintHub benefits from an opinionated framework that provides production-ready capabilities out of the box.

---

## Option 2 – Next.js Pages Router

### Advantages

- Stable.
- Well documented.
- Large ecosystem.

### Disadvantages

- Legacy routing approach.
- Does not leverage the latest React architecture.
- Less flexible than the App Router.

### Decision

**Rejected.**

The App Router represents the current and recommended direction of Next.js development.

---

## Option 3 – Remix

### Advantages

- Excellent nested routing.
- Strong performance.
- Modern data loading model.

### Disadvantages

- Smaller community.
- Fewer learning resources.
- Lower industry adoption than Next.js.

### Decision

**Rejected.**

While technically strong, Remix offers fewer ecosystem advantages for SprintHub's objectives.

---

## Option 4 – Angular

### Advantages

- Complete framework.
- Strong enterprise tooling.
- Built-in dependency injection.

### Disadvantages

- Steeper learning curve.
- More verbose development model.
- Less aligned with SprintHub's React-based ecosystem.

### Decision

**Rejected.**

Angular introduces unnecessary complexity for the project's scope and goals.

---

# 5. Rationale

Next.js App Router was selected because it provides a modern, production-ready framework that aligns with SprintHub's architectural objectives while reducing the amount of infrastructure and configuration required.

The decision was based on the following capabilities.

---

## Modern React Architecture

App Router is built around the latest React features, including:

- Server Components
- Client Components
- Nested layouts
- Streaming
- React Suspense

These capabilities provide a solid foundation for scalable applications.

---

## Performance

Next.js includes several built-in performance optimizations, such as:

- Server-side rendering (SSR)
- Static Site Generation (SSG)
- Incremental Static Regeneration (ISR)
- Automatic code splitting
- Image optimization
- Route prefetching

These features improve loading times without requiring additional configuration.

---

## Developer Experience

Next.js offers a streamlined development experience through:

- File-based routing
- TypeScript support
- Fast Refresh
- Built-in API routes
- Excellent documentation
- Strong ecosystem support

---

## Deployment

SprintHub is designed to be deployed on **Vercel**, allowing seamless integration with the framework while remaining portable to other hosting providers if needed.

---

# 6. Architectural Implications

Adopting Next.js App Router influences several architectural decisions across the frontend.

---

## Rendering Strategy

The application uses:

- Server Components by default.
- Client Components only when interactivity or browser APIs are required.

This approach reduces unnecessary client-side JavaScript while improving performance.

---

## Routing

Routing is implemented using the App Router's file-based convention.

This provides:

- Nested layouts
- Shared layouts
- Route groups
- Dynamic routes

without additional routing libraries.

---

## Data Fetching

Server-side data fetching is preferred whenever appropriate.

Client-side fetching is reserved for interactive features that require live updates or user-driven state changes.

---

## Project Organization

The frontend follows the Feature-Based Architecture defined in the ADD and Developer Guide.

High-level structure:

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

This organization promotes modularity, maintainability, and scalability as the application evolves.

---

## Type Safety

TypeScript is used across the frontend to improve reliability, maintainability, and developer productivity.

---

## Deployment

The frontend is designed for deployment on Vercel while remaining independent of any specific hosting provider.

---

# 7. Consequences

Adopting Next.js App Router provides several long-term benefits for SprintHub.

## Positive Consequences

- Modern React architecture aligned with current industry standards.
- Excellent scalability for future features.
- Built-in support for server-side rendering and optimized routing.
- Improved performance through Server Components and automatic optimizations.
- Simplified deployment workflow with Vercel.
- Reduced need for third-party libraries and custom infrastructure.

---

## Negative Consequences

- Developers must understand the App Router architecture.
- Server and Client Component boundaries introduce an additional learning curve.
- Migration from the legacy Pages Router would require architectural changes.

These trade-offs are acceptable given the long-term benefits of the framework.

---

# 8. Trade-offs

| Benefit                   | Trade-off                                   |
| ------------------------- | ------------------------------------------- |
| Modern React architecture | Higher learning curve                       |
| Built-in routing          | Less flexibility than custom routing        |
| Server Components         | Additional architectural concepts           |
| Optimized performance     | Requires understanding rendering strategies |
| Production-ready features | Greater framework dependency                |

Overall, the benefits outweigh the identified trade-offs for SprintHub's goals.

---

# 9. Implementation Notes

The frontend implementation should follow these guidelines:

- Use the App Router exclusively.
- Prefer Server Components by default.
- Use Client Components only when browser APIs or interactivity are required.
- Organize code using the Feature-Based Architecture defined in the ADD.
- Keep business logic outside presentation components.
- Maintain strict TypeScript usage across the application.

These guidelines ensure consistency with the project's architectural principles.

---

# 10. Related Documents

This decision is supported by the following project documentation.

| Document        | Relationship                                               |
| --------------- | ---------------------------------------------------------- |
| Blueprint       | Defines the overall technical vision.                      |
| ADD             | Defines the frontend architecture.                         |
| Developer Guide | Describes the project structure and development standards. |
| ADR-002         | Defines the Feature-Based Frontend Architecture.           |

---

# 11. References

- Next.js Documentation
- React Documentation
- TypeScript Documentation
- Vercel Documentation

---

# 12. Conclusion

Next.js App Router was selected because it provides the best balance of scalability, maintainability, performance, and developer experience for SprintHub.

The framework aligns with the project's architectural principles and establishes a modern foundation capable of supporting both the MVP and future evolution without requiring significant architectural changes.

---
