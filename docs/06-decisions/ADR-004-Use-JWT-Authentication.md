# ADR-004 – Use JWT Access Tokens with Refresh Tokens for Authentication

> Architecture Decision Record documenting the adoption of JWT Access Tokens and Refresh Tokens as the authentication mechanism for SprintHub.

---

| Property            | Value                                                        |
| ------------------- | ------------------------------------------------------------ |
| **Document**        | ADR-004                                                      |
| **Title**           | Use JWT Access Tokens with Refresh Tokens for Authentication |
| **Project**         | SprintHub                                                    |
| **Version**         | 1.1                                                          |
| **Status**          | Approved                                                     |
| **Owner**           | Nicolás Palacio                                              |
| **Decision Makers** | SprintHub Architecture Team                                  |
| **Last Updated**    | September 2026                                               |

---

# Table of Contents

1. Context
2. Decision
3. Decision Drivers
4. Alternatives Considered
5. Authentication Flow
6. Why JWT?
7. Why Refresh Tokens?
8. Token Storage Strategy
9. Security Considerations
10. Architectural Implications
11. Consequences
12. Trade-offs
13. Implementation Notes
14. Related Documents
15. References
16. Conclusion

---

# 1. Context

SprintHub is a multi-user SaaS application that requires a secure, scalable, and modern authentication mechanism aligned with its RESTful architecture.

The authentication solution must support:

- Secure user authentication.
- Stateless API communication.
- Multiple simultaneous device sessions.
- Session renewal without repeated logins.
- Secure logout.
- Protection against common web attacks.
- Future integration with third-party authentication providers.

The selected approach should balance security, scalability, and user experience while remaining suitable for cloud-native deployments.

---

# 2. Decision

SprintHub adopts the following authentication strategy:

- JWT Access Tokens.
- Refresh Tokens.
- HttpOnly Secure Cookies.
- Role-Based Access Control (RBAC).

The authentication flow is:

1. The user authenticates with email and password.
2. Credentials are validated.
3. The server issues:
   - A short-lived Access Token.
   - A long-lived Refresh Token.
4. The Access Token authenticates API requests.
5. The Refresh Token is used only to obtain new Access Tokens.
6. Logging out revokes the active Refresh Token.

---

# 3. Decision Drivers

The following criteria guided this decision.

| Driver                   | Priority |
| ------------------------ | -------- |
| Security                 | High     |
| Scalability              | High     |
| User Experience          | High     |
| Stateless Architecture   | High     |
| Industry Adoption        | High     |
| REST Compatibility       | High     |
| Multi-Device Support     | Medium   |
| Future OAuth Integration | Medium   |

---

# 4. Alternatives Considered

## Option 1 – Server-Side Sessions

### Advantages

- Easy to understand.
- Straightforward session invalidation.
- Mature and widely supported.

### Disadvantages

- Requires server-side session storage.
- Harder to scale horizontally.
- Introduces server-side state.

### Decision

**Rejected.**

SprintHub follows a stateless REST architecture, making traditional server-side sessions less suitable.

---

## Option 2 – JWT Only

### Advantages

- Simple implementation.
- Fully stateless.
- Minimal infrastructure.

### Disadvantages

- Frequent user logins.
- Difficult token revocation.
- Long-lived JWTs increase security risks.

### Decision

**Rejected.**

Using only JWTs creates an undesirable trade-off between security and user experience.

---

## Option 3 – OAuth Only

### Advantages

- Excellent user experience.
- Social login support.
- Reduced password management.

### Disadvantages

- More complex implementation.
- Dependency on external providers.
- Not required for the MVP.

### Decision

**Rejected.**

OAuth remains a future enhancement but is intentionally outside the MVP scope.

---

## Option 4 – JWT + Refresh Tokens

### Advantages

- Stateless authentication.
- Short-lived Access Tokens.
- Long-lived sessions.
- Improved security.
- Excellent scalability.
- Industry-standard approach.
- Supports multiple concurrent sessions.

### Disadvantages

- Additional implementation complexity.
- Refresh Token lifecycle management.
- Secure token storage requirements.

### Decision

**Accepted.**

JWT Access Tokens combined with Refresh Tokens provide the best balance between security, scalability, and user experience.

---

# 5. Authentication Flow

The authentication lifecycle is illustrated below.

```text
User
    │
    ▼
POST /api/auth/login
    │
    ▼
Validate Credentials
    │
    ▼
Generate Access Token
+
Generate Refresh Token
    │
    ├───────────────► Return Access Token
    │
    └───────────────► Store Refresh Token
                      (HttpOnly Secure Cookie)
                      +
                      Persist token hash in database
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
                  Issue New Access Token
                      │
                      ▼
                  Continue Session
```

This approach combines short-lived Access Tokens with long-lived Refresh Tokens to provide both security and a seamless user experience.

---

# 6. Why JWT?

JWT Access Tokens were selected because they support a stateless authentication model that aligns with SprintHub's REST architecture.

Key benefits include:

- Stateless authentication.
- Self-contained tokens.
- Fast signature verification.
- Broad ecosystem support.
- Excellent interoperability.

Using JWTs reduces server-side complexity while remaining compatible with horizontally scalable deployments.

---

# 7. Why Refresh Tokens?

Access Tokens remain intentionally short-lived to reduce the impact of token compromise.

Refresh Tokens provide secure session continuity by allowing clients to obtain new Access Tokens without requiring users to authenticate again.

Benefits include:

- Improved security.
- Better user experience.
- Token revocation.
- Multiple simultaneous sessions.

Refresh Tokens are stored securely in the database as cryptographic hashes, allowing compromised or expired sessions to be invalidated.

---

# 8. Token Storage Strategy

SprintHub intentionally avoids storing authentication tokens in Local Storage or Session Storage.

Instead:

| Token         | Client Storage         | Server Storage                         | Expiration |
| ------------- | ---------------------- | -------------------------------------- | ---------- |
| Access Token  | Client memory          | Not persisted                          | 15 minutes |
| Refresh Token | HttpOnly Secure Cookie | Cryptographic hash (`tokenHash`) in DB | 7 days     |

The server never persists the plain Refresh Token. Only its cryptographic hash (`tokenHash`) is stored in the database.

### Benefits

- Protected from JavaScript access.
- Reduced XSS attack surface.
- Automatic inclusion during refresh requests.
- Improved session security.

---

# 9. Security Considerations

The authentication architecture incorporates multiple security mechanisms.

---

## Password Security

- Passwords are hashed using **bcrypt**.
- Plain-text passwords are never stored.

---

## Secure Communication

All production traffic is encrypted using HTTPS.

---

## Token Expiration

| Token         | Lifetime   |
| ------------- | ---------- |
| Access Token  | 15 minutes |
| Refresh Token | 7 days     |

---

## Token Revocation

Refresh Tokens are revoked during logout by invalidating the active Refresh Token.

Additional revocation scenarios may be considered in future versions if required by the product.

---

## Brute Force Protection

Authentication endpoints are protected through the API rate limiting policy.

The specific rate limits are defined in the API Design Specification.

---

## Cookie Security

Refresh Tokens stored in cookies use:

- HttpOnly
- Secure
- SameSite=Strict

---

# 10. Architectural Implications

The authentication strategy influences several architectural components.

---

## Database

The `RefreshToken` entity stores:

- `tokenHash`
- User reference
- Expiration timestamp
- Revocation timestamp

The plain Refresh Token is not persisted.

---

## Backend

Authentication middleware is responsible for:

- JWT signature validation.
- Token expiration validation.
- User identity verification.

Authorization middleware enforces:

- User roles.
- Workspace membership.
- Resource permissions.

---

## Frontend

The frontend:

- Stores Access Tokens only in memory.
- Relies on the HttpOnly Secure Cookie for the Refresh Token.
- Uses `POST /api/auth/refresh` to obtain a new Access Token when the current Access Token expires.

---

# 11. Consequences

Adopting JWT Access Tokens with Refresh Tokens establishes a secure, scalable, and modern authentication model for SprintHub.

## Positive Consequences

- Stateless authentication.
- Improved horizontal scalability.
- Better user experience through seamless session renewal.
- Strong security model.
- Support for multiple concurrent sessions.
- Clear separation between authentication and authorization.
- Future-ready for OAuth integration.

---

## Negative Consequences

- Increased implementation complexity.
- Refresh Token lifecycle management.
- Token revocation logic.
- Cookie configuration across environments.

These trade-offs are acceptable given SprintHub's architectural and security objectives.

---

# 12. Trade-offs

| Benefit                   | Trade-off                         |
| ------------------------- | --------------------------------- |
| Stateless authentication  | More complex token lifecycle      |
| Short-lived Access Tokens | Refresh Token management          |
| Improved security         | Additional implementation effort  |
| Better user experience    | Cookie configuration requirements |
| Multi-device support      | Session revocation complexity     |

Overall, the selected approach provides the best balance between security, scalability, and usability.

---

# 13. Implementation Notes

The authentication layer should follow these conventions:

- Sign JWTs using a strong secret.
- Access Token lifetime: **15 minutes**.
- Refresh Token lifetime: **7 days**.
- Store the Refresh Token in an **HttpOnly Secure Cookie** on the client side.
- Store only the cryptographic hash (`tokenHash`) of the Refresh Token in the database.
- Never persist the plain Refresh Token in the database.
- Never store Access Tokens in Local Storage or Session Storage.
- Protect `POST /api/auth/refresh` against abuse through rate limiting.
- Apply authentication middleware to every protected route.
- Enforce RBAC after successful authentication.

Future versions may extend the authentication system with OAuth providers and additional session management capabilities.

---

# 14. Related Documents

This decision is supported by the following project documentation.

| Document  | Relationship                                               |
| --------- | ---------------------------------------------------------- |
| Blueprint | Defines the overall technical vision.                      |
| ADD       | Defines the authentication and authorization architecture. |
| DDS       | Defines the `RefreshToken` entity.                         |
| ADS       | Defines the Authentication API.                            |
| ADR-002   | Documents the adoption of PostgreSQL.                      |
| ADR-003   | Documents the adoption of Prisma ORM.                      |

---

# 15. References

- RFC 7519 – JSON Web Token (JWT)
- OWASP Authentication Cheat Sheet
- OWASP Session Management Cheat Sheet
- OAuth 2.0 Best Current Practices
- Prisma Documentation

---

# 16. Conclusion

JWT Access Tokens combined with Refresh Tokens were selected because they provide the best balance between security, scalability, and user experience for SprintHub.

The decision establishes a modern authentication architecture that aligns with REST principles, supports secure session management, and provides a solid foundation for future enhancements such as OAuth integration.

---
