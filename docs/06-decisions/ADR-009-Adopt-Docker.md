# ADR-009 – Adopt Containerization Using Docker

> Architecture Decision Record documenting the adoption of Docker as the containerization platform for SprintHub.

---

| Property            | Value                               |
| ------------------- | ----------------------------------- |
| **Document**        | ADR-009                             |
| **Title**           | Adopt Containerization Using Docker |
| **Project**         | SprintHub                           |
| **Version**         | 1.1                                 |
| **Status**          | Approved                            |
| **Owner**           | Nicolás Palacio                     |
| **Decision Makers** | SprintHub Architecture Team         |
| **Last Updated**    | September 2026                      |

---

# Table of Contents

1. Context
2. Decision
3. Decision Drivers
4. Alternatives Considered
5. Rationale
6. Container Strategy
7. Docker Compose
8. Architectural Implications
9. Security Considerations
10. Performance Considerations
11. Consequences
12. Trade-offs
13. Implementation Notes
14. Related Documents
15. References
16. Conclusion

---

# 1. Context

SprintHub consists of multiple application components that must run consistently across development, testing, and production environments.

The current platform includes:

- Next.js Frontend.
- Node.js Backend.
- PostgreSQL Database.

The containerization strategy must provide:

- Consistent development environments.
- Reproducible builds.
- Easy onboarding.
- CI compatibility.
- Predictable deployments.
- Portability across environments.
- Low operational complexity.

The selected solution should minimize environment-specific issues while remaining simple to adopt and maintain.

Docker must also integrate naturally with the Modular Monolith Architecture defined in ADR-005 and the PostgreSQL persistence strategy defined in ADR-002.

---

# 2. Decision

SprintHub adopts **Docker** as its official containerization platform.

Each major application component runs inside its own container, while local multi-container orchestration is managed through **Docker Compose**.

Docker is responsible for packaging applications and their runtime dependencies into reproducible environments.

Docker Compose is responsible for coordinating the services required by the local development environment.

The specific CI/CD pipeline, image promotion process, and production deployment strategy are defined separately as part of the project's delivery and infrastructure strategy.

---

# 3. Decision Drivers

The following criteria guided this decision.

| Driver                  | Priority |
| ----------------------- | -------- |
| Environment Consistency | High     |
| Portability             | High     |
| Developer Experience    | High     |
| Deployment Simplicity   | High     |
| CI Compatibility        | High     |
| Scalability             | Medium   |
| Industry Adoption       | High     |
| Learning Value          | High     |

---

# 4. Alternatives Considered

## Option 1 – Manual Environment Setup

### Advantages

- No additional container tooling.
- Simple for very small projects.
- Minimal initial configuration.

### Disadvantages

- Environment inconsistencies.
- Dependency conflicts.
- Difficult onboarding.
- "Works on my machine" issues.
- More difficult CI configuration.
- Increased configuration maintenance.

### Decision

**Rejected.**

Manual environment configuration reduces reproducibility and increases the risk of environment-specific issues.

---

## Option 2 – Docker

### Advantages

- Consistent environments.
- Cross-platform compatibility.
- Reproducible builds.
- Easy onboarding.
- Strong ecosystem.
- Excellent CI/CD compatibility.
- Broad industry adoption.
- Lightweight compared with full virtual machines.

### Disadvantages

- Initial learning curve.
- Docker installation required for local development.
- Additional local resource consumption.
- Container configuration introduces additional project files.

### Decision

**Accepted.**

Docker provides the best balance between simplicity, portability, reproducibility, and ecosystem support for SprintHub.

---

## Option 3 – Podman

### Advantages

- Daemonless architecture.
- Rootless containers.
- Docker-compatible CLI.
- Strong security model.

### Disadvantages

- Smaller ecosystem.
- Fewer learning resources.
- Lower adoption within the project's target development workflow.
- Additional tooling differences compared with Docker-based workflows.

### Decision

**Rejected.**

Although technically strong, Podman does not provide sufficient advantages over Docker for SprintHub's current requirements.

---

## Option 4 – Kubernetes

### Advantages

- Advanced container orchestration.
- Automatic scaling.
- High availability capabilities.
- Service discovery.
- Extensive production deployment capabilities.

### Disadvantages

- Significant operational complexity.
- Steep learning curve.
- Additional infrastructure requirements.
- Excessive for the current project scope.

### Decision

**Rejected.**

Kubernetes is an orchestration platform rather than a replacement for Docker-based containerization. SprintHub's current scope does not justify introducing Kubernetes-level operational complexity.

---

# 5. Rationale

Docker was selected because it packages applications together with their runtime dependencies into isolated and reproducible environments.

Key benefits include:

- Predictable environments.
- Consistent dependency versions.
- Cross-platform compatibility.
- Reproducible builds.
- Simplified local setup.
- Service isolation.
- Easier onboarding.
- Compatibility with CI/CD workflows.

Containerization reduces differences between development and deployment environments and provides a consistent foundation for the project's future infrastructure evolution.

---

# 6. Container Strategy

SprintHub follows a **one container per service** strategy.

The initial architecture consists of the following services:

```text
┌─────────────────────┐
│      Frontend       │
│       Next.js       │
└─────────┬───────────┘
          │ HTTP
          ▼
┌─────────────────────┐
│      Backend        │
│   Node.js + API     │
└─────────┬───────────┘
          │ Prisma
          ▼
┌─────────────────────┐
│    PostgreSQL DB    │
└─────────────────────┘
```

The backend remains a single deployable application in accordance with the Modular Monolith Architecture defined in ADR-005.

Containerization does not change the application's internal modular architecture.

Future infrastructure services may be introduced as independent containers if justified by new functional or operational requirements.

---

# 7. Docker Compose

Docker Compose orchestrates the local development environment.

Responsibilities include:

- Starting the required services.
- Creating the internal container network.
- Managing persistent volumes.
- Providing environment configuration.
- Defining service dependencies.
- Simplifying local environment startup.

Developers can start the complete local environment with:

```bash
docker compose up -d
```

The Docker Compose configuration should remain focused on local development and should not be treated as the definition of the production deployment architecture.

---

# 8. Architectural Implications

The adoption of Docker influences several architectural aspects.

---

## Development

Docker provides a consistent environment for contributors regardless of their host operating system.

Application dependencies and infrastructure services can be started using the same containerized configuration, reducing environment-specific configuration problems.

---

## Testing

Docker provides a reproducible environment that can support integration and end-to-end testing when required.

Test environments may use containerized dependencies to reduce differences between development and automated execution environments.

The specific automated testing infrastructure is defined separately within the project's testing and CI/CD strategy.

---

## Deployment

Docker provides reproducible container images that can be used across deployment environments.

The container image becomes a consistent artifact that can be built, tested, and promoted through the project's delivery pipeline.

The specific CI/CD workflow and image promotion strategy are defined separately.

---

## Database

PostgreSQL runs in its own container for local development.

Persistent database data is managed through Docker volumes.

Prisma remains the application's data access layer, as defined in ADR-003, while PostgreSQL remains the primary relational database, as defined in ADR-002.

---

## Configuration

Environment-specific configuration is provided through environment variables.

Sensitive configuration values must not be embedded directly into Docker images or committed to source control.

---

# 9. Security Considerations

Docker images and containers should follow established container security practices.

Recommended measures include:

- Minimal base images.
- Non-root users whenever possible.
- Environment variables for configuration and secrets.
- Multi-stage builds.
- Image vulnerability scanning.
- Regular dependency updates.
- Avoiding unnecessary packages and services.
- Keeping production images as small as practical.

Sensitive information must never be embedded directly in container images.

Container security does not replace application-level security controls defined by the project's authentication and authorization architecture.

---

# 10. Performance Considerations

Containers introduce additional infrastructure overhead but provide significant operational and development benefits.

Current optimization strategies include:

- Multi-stage builds.
- Docker layer caching.
- Small production images.
- Optimized dependency installation.
- Avoiding unnecessary processes inside containers.

Application and database performance should continue to be optimized independently through appropriate application, database, and infrastructure strategies.

Containerization itself is not considered a substitute for application or database performance optimization.

---

# 11. Consequences

Adopting Docker establishes a consistent, portable, and reproducible development and deployment foundation for SprintHub.

## Positive Consequences

- Consistent environments across development and deployment stages.
- Simplified onboarding.
- Improved reproducibility.
- Reduced environment-specific configuration issues.
- Better compatibility with CI/CD workflows.
- Service isolation.
- Cross-platform compatibility.
- Easier dependency management.
- Reproducible deployment artifacts.

---

## Negative Consequences

- Initial Docker learning curve.
- Additional local resource consumption.
- Container configuration introduces additional infrastructure files.
- Container management adds operational considerations.
- Developers must understand basic Docker workflows.

These trade-offs are acceptable given SprintHub's long-term development and deployment goals.

---

# 12. Trade-offs

| Benefit                  | Trade-off                        |
| ------------------------ | -------------------------------- |
| Consistent environments  | Docker knowledge required        |
| Portable deployments     | Additional local resource usage  |
| Reproducible builds      | Container configuration overhead |
| Simplified onboarding    | Additional infrastructure setup  |
| Better CI/CD integration | More deployment configuration    |

Overall, Docker provides the best balance between portability, reproducibility, maintainability, and developer productivity for SprintHub.

---

# 13. Implementation Notes

SprintHub follows these containerization conventions:

- One container per service.
- Docker Compose for local orchestration.
- Multi-stage Docker builds where appropriate.
- Environment-specific configuration through environment variables.
- Persistent PostgreSQL volumes for local development.
- Official and maintained base images whenever practical.
- Production images should be kept as small as practical.
- Sensitive values must never be embedded in container images.
- Dockerfiles should remain reproducible and deterministic.
- Container-specific configuration should remain separate from application business logic.

The backend remains a Modular Monolith inside its container, as defined in ADR-005.

Prisma remains responsible for database access, while PostgreSQL remains the primary database.

The CI/CD implementation and deployment automation are defined separately from this ADR.

---

# 14. Related Documents

This decision is supported by the following project documentation.

| Document        | Relationship                                           |
| --------------- | ------------------------------------------------------ |
| Blueprint       | Defines the overall project and infrastructure vision. |
| PRD             | Defines the product scope and requirements.            |
| SRS             | Defines the system requirements.                       |
| ADD             | Defines the deployment and system architecture.        |
| DDS             | Defines the detailed technical design.                 |
| ADS             | Defines the API design and communication standards.    |
| Developer Guide | Defines local development and Docker conventions.      |
| ADR-002         | Documents the adoption of PostgreSQL.                  |
| ADR-003         | Documents the adoption of Prisma ORM.                  |
| ADR-005         | Defines the Modular Monolith Architecture.             |
| ADR-007         | Defines the Layered Backend Architecture.              |

---

# 15. References

- Docker Documentation
- Docker Compose Documentation
- OCI (Open Container Initiative)
- Twelve-Factor App
- Docker Best Practices

---

# 16. Conclusion

SprintHub adopts Docker as its containerization platform because it provides a strong balance between consistency, portability, reproducibility, and operational simplicity.

By containerizing the application's services, SprintHub establishes reproducible development and deployment environments while reducing environment-specific configuration issues.

Docker complements the project's Modular Monolith, Layered Backend, PostgreSQL, and Prisma architecture without introducing unnecessary orchestration complexity.

The decision provides a solid foundation for the current MVP while allowing the infrastructure strategy to evolve independently as the project's deployment and scalability requirements grow.

---
