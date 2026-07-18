# ADR-002 – Use PostgreSQL as the Primary Database Management System

> Architecture Decision Record documenting the adoption of PostgreSQL as the primary Database Management System (DBMS) for SprintHub.

---

| Property            | Value                                                    |
| ------------------- | -------------------------------------------------------- |
| **Document**        | ADR-002                                                  |
| **Title**           | Use PostgreSQL as the Primary Database Management System |
| **Project**         | SprintHub                                                |
| **Version**         | 1.0                                                      |
| **Status**          | Approved                                                 |
| **Owner**           | Nicolás Palacio                                          |
| **Decision Makers** | SprintHub Architecture Team                              |
| **Last Updated**    | July 2026                                                |

---

# Table of Contents

1. Context
2. Decision
3. Decision Drivers
4. Alternatives Considered
5. Rationale
6. Architectural Implications
7. Performance Considerations
8. Scalability
9. Security Considerations
10. Consequences
11. Trade-offs
12. Implementation Notes
13. Related Documents
14. References
15. Conclusion

---

# 1. Context

SprintHub is a collaborative SaaS application where data integrity, transactional consistency, and relationships between business entities are fundamental.

The platform manages highly related entities, including:

- Users
- Workspaces
- Workspace Members
- Projects
- Tasks
- Notifications
- Refresh Tokens

Many business operations involve multiple related entities and therefore require reliable transactional support.

Examples include:

- Creating a workspace and assigning its owner.
- Creating projects within workspaces.
- Assigning tasks to workspace members.
- Managing workspace permissions.
- Handling authentication sessions.

The selected database must provide:

- Strong consistency
- Robust relational modeling
- ACID transactions
- High performance
- Long-term scalability
- Excellent ORM compatibility

---

# 2. Decision

SprintHub adopts **PostgreSQL** as its primary Database Management System (DBMS).

PostgreSQL serves as the single source of truth for all persistent application data and is accessed exclusively through **Prisma ORM**, ensuring type-safe database access and version-controlled schema management.

---

# 3. Decision Drivers

The following criteria guided this decision.

| Driver               | Priority |
| -------------------- | -------- |
| Data Integrity       | High     |
| Relational Modeling  | High     |
| ACID Transactions    | High     |
| Performance          | High     |
| Scalability          | High     |
| Maintainability      | High     |
| Community Support    | High     |
| Prisma Compatibility | High     |
| Learning Value       | High     |

---

# 4. Alternatives Considered

## Option 1 – MongoDB

### Advantages

- Flexible schema.
- Well suited for document-oriented data.
- Easy to start with.
- Good horizontal scalability.

### Disadvantages

- Relationships require additional modeling effort.
- Referential integrity is not enforced by default.
- Data duplication is more common.
- Multi-document transactions add complexity.
- Less suitable for highly relational domains.

### Decision

**Rejected.**

SprintHub's domain is strongly relational and benefits from a database that naturally enforces relationships and transactional consistency.

---

## Option 2 – MySQL

### Advantages

- Mature ecosystem.
- Excellent performance.
- Large community.
- Widely adopted.

### Disadvantages

- Fewer advanced relational capabilities than PostgreSQL.
- Less flexibility for complex queries.
- Smaller Prisma ecosystem.

### Decision

**Rejected.**

Although MySQL is an excellent relational database, PostgreSQL better supports SprintHub's long-term architectural goals.

---

## Option 3 – SQLite

### Advantages

- Zero configuration.
- Extremely lightweight.
- Ideal for prototypes and small applications.

### Disadvantages

- Not intended for production SaaS applications.
- Limited concurrency.
- Limited scalability.

### Decision

**Rejected.**

SQLite does not satisfy SprintHub's production and scalability requirements.

---

## Option 4 – PostgreSQL

### Advantages

- ACID compliant.
- Strong relational modeling.
- Advanced indexing.
- Foreign key enforcement.
- Excellent transaction support.
- Mature ecosystem.
- Production-ready.
- Outstanding Prisma integration.
- Supported by managed cloud providers.

### Disadvantages

- Slightly more administration than lightweight databases.
- Schema evolution requires migration planning.

### Decision

**Accepted.**

PostgreSQL best satisfies SprintHub's functional and non-functional requirements.

---

# 5. Rationale

PostgreSQL was selected because SprintHub's domain is highly relational and requires strong consistency across interconnected business entities.

Examples include:

- Users belong to multiple Workspaces.
- Workspaces contain Projects.
- Projects contain Tasks.
- Tasks reference Users.
- Notifications belong to Users.
- Refresh Tokens belong to Users.

PostgreSQL naturally models these relationships through foreign keys and constraints while providing robust transactional integrity.

---

## Relational Modeling

SprintHub follows a normalized relational model (Third Normal Form) to:

- Reduce data redundancy.
- Preserve consistency.
- Simplify maintenance.
- Clearly define entity ownership.

---

## Transaction Support

PostgreSQL provides full ACID compliance, ensuring reliable execution of operations involving multiple entities.

Typical transactional operations include:

- Workspace creation.
- Member assignment.
- Project creation.
- Authentication session management.

---

## Prisma Integration

PostgreSQL integrates seamlessly with Prisma ORM, providing:

- Type-safe queries.
- Version-controlled migrations.
- Strong developer experience.
- Consistent schema management.

---

# 6. Architectural Implications

Adopting PostgreSQL influences several architectural decisions across the persistence layer.

---

## Referential Integrity

Relationships are enforced through database constraints, including:

- Primary Keys
- Foreign Keys
- Unique Constraints
- Check Constraints (where applicable)

This prevents invalid references and preserves data consistency.

---

## Schema Management

All schema changes are managed through **Prisma Migrate**.

Schema modifications must be version-controlled, and direct changes to production databases are not permitted.

---

## Primary Keys

All entities use **UUIDs** as primary keys.

Benefits include:

- Global uniqueness.
- Better support for distributed systems.
- Reduced identifier predictability.
- Easier future architectural evolution.

---

# 7. Performance Considerations

PostgreSQL provides several built-in mechanisms that support efficient query execution.

SprintHub leverages:

- B-tree indexes.
- Composite indexes.
- Query optimization.
- Connection pooling.
- Efficient joins.
- Optimized foreign key lookups.

Additional indexing strategies are documented in the DDS.

---

# 8. Scalability

The selected database supports SprintHub's long-term growth without requiring a change of database engine.

Future capabilities may include:

- Read replicas.
- Table partitioning.
- Materialized views.
- Full-text search.
- JSONB support for semi-structured data.
- Horizontal scaling through managed cloud infrastructure.

These capabilities are considered future enhancements and are intentionally outside the scope of the MVP.

---

# 9. Security Considerations

PostgreSQL contributes to the application's security through:

- Role-based database permissions.
- SSL/TLS encrypted connections.
- Transaction isolation.
- Parameterized queries via Prisma ORM.
- Strong authentication mechanisms.

Sensitive information, including passwords and refresh token hashes, is never stored in plain text.

---

# 10. Consequences

Adopting PostgreSQL establishes a robust and reliable persistence layer for SprintHub.

## Positive Consequences

- Strong relational modeling.
- Excellent data consistency.
- Reliable ACID transactions.
- Mature ecosystem.
- Seamless Prisma integration.
- Production-ready architecture.
- Broad industry adoption.
- High learning value.

---

## Negative Consequences

- Requires schema migration management.
- Slightly steeper learning curve than document-oriented databases.
- More structured schema evolution.

These trade-offs are acceptable given SprintHub's long-term architectural goals.

---

# 11. Trade-offs

| Benefit                     | Trade-off                         |
| --------------------------- | --------------------------------- |
| Strong relational integrity | Less schema flexibility           |
| ACID transactions           | More structured schema evolution  |
| Long-term maintainability   | Slower initial prototyping        |
| Prisma integration          | Dependency on relational modeling |

Overall, PostgreSQL provides the best balance between consistency, maintainability, and scalability for SprintHub.

---

# 12. Implementation Notes

The database implementation should follow these conventions:

- PostgreSQL 17 (or the latest stable version).
- Prisma ORM for all database access.
- UUID primary keys.
- `snake_case` table names.
- `camelCase` Prisma models.
- `createdAt` and `updatedAt` timestamp fields on all entities.
- Database configuration managed through environment variables.

Soft deletes may be considered in future versions if business requirements evolve.

---

# 13. Related Documents

This decision is supported by the following project documentation.

| Document  | Relationship                          |
| --------- | ------------------------------------- |
| Blueprint | Defines the overall technical vision. |
| ADD       | Defines the persistence architecture. |
| DDS       | Defines the relational data model.    |
| ADR-003   | Documents the adoption of Prisma ORM. |

---

# 14. References

- PostgreSQL Documentation
- Prisma Documentation
- PostgreSQL Performance Best Practices
- PostgreSQL Indexing Guide

---

# 15. Conclusion

PostgreSQL was selected because it provides the strongest combination of relational modeling, transactional integrity, scalability, performance, and ecosystem support for SprintHub.

The decision establishes a solid foundation for the application's persistence layer while aligning with the project's architectural principles and supporting future growth.

---
