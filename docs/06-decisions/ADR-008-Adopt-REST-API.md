# ADR-008 – Adopt REST as the Primary API Architecture

> Architecture Decision Record documenting the adoption of REST as the primary API architecture for SprintHub.

---

| Property            | Value                                      |
| ------------------- | ------------------------------------------ |
| **Document**        | ADR-008                                    |
| **Title**           | Adopt REST as the Primary API Architecture |
| **Project**         | SprintHub                                  |
| **Version**         | 1.0                                        |
| **Status**          | Approved                                   |
| **Owner**           | Nicolás Palacio                            |
| **Decision Makers** | SprintHub Architecture Team                |
| **Last Updated**    | July 2026                                  |

---

# Table of Contents

1. Context
2. Decision
3. Decision Drivers
4. Alternatives Considered
5. Rationale
6. REST Design Principles
7. Architectural Implications
8. Performance Considerations
9. Security Considerations
10. Consequences
11. Trade-offs
12. Implementation Notes
13. Related Documents
14. References
15. Conclusion

---

# 1. Context

SprintHub requires a communication protocol between the frontend and backend that is secure, scalable, predictable, and easy to consume.

The API supports the following business domains:

- Authentication
- Users
- Workspaces
- Projects
- Tasks
- Notifications

The selected API architecture must provide:

- Broad tooling support.
- Excellent documentation capabilities.
- Easy frontend integration.
- Industry-standard practices.
- Long-term maintainability.

It must also integrate naturally with the Modular Monolith Architecture (ADR-005) and the Layered Backend Architecture (ADR-007).

---

# 2. Decision

SprintHub adopts **REST (Representational State Transfer)** as its primary API architecture.

The API exposes resource-oriented endpoints over HTTPS using JSON as the data exchange format.

REST principles guide:

- Endpoint design.
- HTTP methods.
- Status codes.
- Authentication.
- API versioning.
- Error handling.
- Resource naming.

---

# 3. Decision Drivers

The following criteria guided this decision.

| Driver                 | Priority |
| ---------------------- | -------- |
| Simplicity             | High     |
| Industry Adoption      | High     |
| Tooling Support        | High     |
| Frontend Compatibility | High     |
| Documentation          | High     |
| Learning Value         | High     |
| Maintainability        | High     |
| Scalability            | Medium   |

---

# 4. Alternatives Considered

## Option 1 – GraphQL

### Advantages

- Clients request only the data they need.
- Strongly typed schema.
- Reduces over-fetching and under-fetching.
- Excellent for highly dynamic client applications.

### Disadvantages

- More complex backend implementation.
- Additional learning curve.
- More difficult caching.
- Increased authorization complexity.
- Unnecessary flexibility for SprintHub's predictable resource model.

### Decision

**Rejected.**

GraphQL is a powerful technology, but REST provides a simpler and more maintainable solution for SprintHub's current requirements.

---

## Option 2 – gRPC

### Advantages

- High performance.
- Binary communication.
- Strong contracts through Protocol Buffers.
- Excellent service-to-service communication.

### Disadvantages

- Limited browser support.
- Less intuitive frontend integration.
- More difficult debugging.
- Additional tooling requirements.

### Decision

**Rejected.**

gRPC is better suited for internal service communication than for a browser-based SaaS application.

---

## Option 3 – JSON-RPC

### Advantages

- Lightweight.
- Simple request format.
- Easy implementation.

### Disadvantages

- Action-oriented rather than resource-oriented.
- Less standardized for modern web APIs.
- Smaller ecosystem.
- Less expressive HTTP semantics.

### Decision

**Rejected.**

REST better represents SprintHub's business resources and aligns with modern API design practices.

---

## Option 4 – REST

### Advantages

- Mature ecosystem.
- Excellent tooling.
- Easy browser integration.
- Native HTTP semantics.
- Broad industry adoption.
- Straightforward OpenAPI documentation.

### Disadvantages

- Potential over-fetching.
- Multiple requests for complex screens.
- Less flexible than GraphQL for dynamic clients.

### Decision

**Accepted.**

REST provides the best balance between simplicity, maintainability, interoperability, and scalability.

---

# 5. Rationale

REST was selected because SprintHub manages well-defined business resources that map naturally to resource-oriented endpoints.

Core resources include:

- Users
- Workspaces
- Projects
- Tasks
- Notifications

Examples:

```text
GET    /projects
POST   /projects
GET    /projects/{id}
PATCH  /projects/{id}
DELETE /projects/{id}
```

This approach provides a predictable, standardized API that is easy to consume, document, maintain, and evolve.

---

# 6. REST Design Principles

SprintHub follows established REST principles to ensure consistency across the API.

---

## Resource-Oriented URLs

Endpoints represent business resources rather than actions.

Good:

```text
GET /tasks
```

Bad:

```text
GET /getTasks
```

---

## Standard HTTP Methods

| Method | Purpose                    |
| ------ | -------------------------- |
| GET    | Retrieve resources         |
| POST   | Create resources           |
| PATCH  | Partially update resources |
| PUT    | Replace resources          |
| DELETE | Remove resources           |

---

## Stateless Communication

Each request contains all information required for processing.

The server does not maintain client session state. Authentication is handled using JWT Access Tokens.

---

## Consistent Responses

All endpoints follow a standardized response structure.

Example:

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

---

## HTTP Status Codes

REST endpoints return meaningful HTTP status codes.

Common responses include:

- 200 OK
- 201 Created
- 204 No Content
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 422 Unprocessable Entity
- 500 Internal Server Error

---

# 7. Architectural Implications

The adoption of REST influences several architectural components.

---

## Backend

Controllers expose RESTful endpoints, while Services implement business logic.

Repositories remain independent of HTTP concerns.

---

## Frontend

The frontend communicates exclusively through HTTP using:

- Axios
- TanStack Query

---

## API Documentation

The REST API is documented using:

- OpenAPI 3.x
- Swagger UI

The API Design Specification (ADS) remains the authoritative API reference.

---

## Versioning

SprintHub uses URI versioning.

Example:

```text
/api/v1/projects
```

Breaking changes require a new API version.

---

# 8. Performance Considerations

SprintHub follows REST best practices to improve API performance.

Current strategies include:

- Pagination.
- Filtering.
- Sorting.
- Response compression (Gzip/Brotli).

Future enhancements may include:

- HTTP caching headers.
- Additional caching strategies if future scalability requirements justify them.

---

# 9. Security Considerations

REST endpoints are protected through multiple security mechanisms.

Security measures include:

- HTTPS.
- JWT Authentication.
- Refresh Tokens.
- Role-Based Access Control (RBAC).
- Input validation.
- Rate limiting.
- Secure HTTP headers.

Sensitive information is never exposed through API responses.

---

# 10. Consequences

Adopting REST establishes a standardized, maintainable, and interoperable API for SprintHub.

## Positive Consequences

- Broad industry adoption.
- Excellent tooling support.
- Simple frontend integration.
- Standardized HTTP semantics.
- Straightforward API documentation.
- Easy onboarding for developers.
- High interoperability.

---

## Negative Consequences

- Potential over-fetching of data.
- Multiple requests may be required for complex views.
- Less flexible than GraphQL for highly dynamic clients.

These trade-offs are acceptable given SprintHub's current requirements and architectural goals.

---

# 11. Trade-offs

| Benefit                         | Trade-off                                                   |
| ------------------------------- | ----------------------------------------------------------- |
| Standardized HTTP communication | Potential over-fetching                                     |
| Simple API design               | Multiple requests for complex screens                       |
| Broad ecosystem support         | Less flexibility than GraphQL                               |
| Easy frontend integration       | Resource-oriented design requires careful endpoint planning |

Overall, REST provides the best balance between simplicity, maintainability, interoperability, and scalability.

---

# 12. Implementation Notes

The API should follow these implementation conventions:

- Resource-oriented endpoints.
- Standard HTTP methods.
- JSON request and response bodies.
- Consistent response structure.
- Standard HTTP status codes.
- URI versioning (`/api/v1`).
- OpenAPI 3.x documentation.
- Authentication using JWT Access Tokens and Refresh Tokens.

Future versions may introduce additional caching strategies if performance requirements evolve.

---

# 13. Related Documents

This decision is supported by the following project documentation.

| Document  | Relationship                                               |
| --------- | ---------------------------------------------------------- |
| Blueprint | Defines the overall technical vision.                      |
| ADS       | Defines the complete REST API specification.               |
| ADD       | Defines how REST integrates with the backend architecture. |
| ADR-004   | Documents the authentication strategy used by the API.     |
| ADR-005   | Defines the Modular Monolith Architecture.                 |
| ADR-007   | Defines the Layered Backend Architecture.                  |

---

# 14. References

- Roy Fielding — _Architectural Styles and the Design of Network-Based Software Architectures_
- RFC 9110 — HTTP Semantics
- OpenAPI Specification
- RESTful API Design Best Practices
- MDN Web Docs — HTTP

---

# 15. Conclusion

SprintHub adopts REST as its primary API architecture because it provides the best balance between simplicity, interoperability, maintainability, and industry adoption.

By following established REST principles, the API remains predictable, well-documented, and easy to consume while supporting the long-term evolution of the application without introducing unnecessary complexity.

---
