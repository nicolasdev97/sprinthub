# Developer Guide (DG)

> Development standards, workflows, coding conventions, and contribution guidelines for SprintHub.

---

| Property         | Value                |
| ---------------- | -------------------- |
| **Document**     | Developer Guide (DG) |
| **Project**      | SprintHub            |
| **Version**      | 1.1                  |
| **Status**       | Approved             |
| **Owner**        | Nicolás Palacio      |
| **Last Updated** | September 2026       |

---

# Table of Contents

1. Purpose
2. Development Environment
3. Initial Project Setup
4. Repository Structure
5. Git Branch Strategy
6. Commit Convention
7. Pull Request Process
8. Folder Naming
9. React Conventions
10. Code Standards
11. Testing
12. Useful Scripts
13. Environment Variables
14. Continuous Integration
15. Related Documentation
16. Conclusion

---

# 1. Purpose

This document defines the engineering standards, development workflow, coding conventions, and collaboration practices used throughout SprintHub.

Its goal is to ensure that every contributor follows a consistent development process, improving maintainability, code quality, and long-term scalability.

This guide focuses on **how SprintHub is developed**. Product requirements, software architecture, database design, API specifications, and architectural decisions are documented separately.

---

# 2. Development Environment

Every contributor should use the following development environment.

## Required Software

- Node.js 22.23.2
- npm 10.9.8
- Git
- Docker Desktop

## Recommended Tools

- Visual Studio Code
- Postman
- DBeaver
- GitHub Desktop (optional)

## Recommended VS Code Extensions

- ESLint
- Prettier
- Prisma
- Docker
- GitLens
- Error Lens

Using a consistent development environment helps reduce configuration differences and improves collaboration across the project.

---

# 3. Initial Project Setup

Follow these steps to configure the project for local development.

## 1. Clone the repository

```bash
git clone https://github.com/<username>/SprintHub.git
```

## 2. Navigate to the project directory

```bash
cd SprintHub
```

## 3. Install project dependencies

```bash
npm install
```

## 4. Create the environment configuration

```bash
cp .env.example .env
```

## 5. Start the development infrastructure

```bash
docker compose up -d
```

This command starts the containerized development environment and its required services, including the frontend, backend, and PostgreSQL database.

Future infrastructure services may be added as the platform evolves.

## 6. Start the application

```bash
npm run dev
```

After completing these steps, the local development environment is ready.

---

# 4. Repository Structure

SprintHub is organized as a **monorepo**, separating applications, documentation, and development infrastructure.

```text
SprintHub/
├── apps/
│   ├── web/
│   └── api/
├── docs/
├── docker/
├── .github/
├── package.json
├── package-lock.json
└── README.md
```

## Directory Overview

| Directory  | Purpose                      |
| ---------- | ---------------------------- |
| `apps/web` | Next.js frontend application |
| `apps/api` | Express backend API          |
| `docs`     | Project documentation        |
| `docker`   | Docker configuration files   |
| `.github`  | GitHub Actions workflows     |

This structure keeps the project modular, maintainable, and easy to navigate while supporting future growth.

---

# 5. Git Branch Strategy

SprintHub follows a Git workflow based on a stable integration branch and short-lived working branches.

The workflow is designed to keep `main` stable while allowing features, fixes, refactors, maintenance tasks, and documentation changes to be developed independently.

---

## Main Branch

The `main` branch represents the production-ready version of the application.

Rules:

- Never develop directly on `main`.
- Changes reach `main` through `develop`.
- Every merge into `main` should represent a stable release.
- Direct pushes to `main` are not allowed.

---

## Develop Branch

The `develop` branch acts as the primary integration branch.

Rules:

- Completed work is merged into `develop` through Pull Requests.
- Features, fixes, refactors, maintenance changes, and documentation changes are integrated here.
- Changes are validated together before being promoted to `main`.

---

## Feature Branches

Feature branches are used to implement new functionality or business capabilities.

Naming convention:

```text
feature/<feature-name>
```

Examples from SprintHub:

```text
feature/authentication
feature/backend-foundation
feature/database
feature/frontend-foundation
feature/project-bootstrap
feature/projects
feature/tasks
feature/workspaces
feature/workspace-project-search
feature/task-endpoint-refactor
```

Workflow:

```text
develop
    │
    └──► feature/*
             │
             ▼
      Pull Request
             │
             ▼
         develop
```

---

## Fix Branches

Fix branches are used to correct bugs or unintended application behavior.

Naming convention:

```text
fix/<issue-name>
```

Example from SprintHub:

```text
fix/domain-rules
```

Fix branches should contain only the changes required to resolve the identified issue.

---

## Refactor Branches

Refactor branches are used to improve the internal structure, organization, or maintainability of the code without intentionally changing its external behavior.

Naming convention:

```text
refactor/<scope>
```

Examples from SprintHub:

```text
refactor/domain-models
refactor/middleware-organization
refactor/domain-consistency
```

Refactor branches should avoid introducing unrelated features or behavioral changes.

---

## Chore Branches

Chore branches are used for maintenance tasks that do not represent a new user-facing feature or a specific bug fix.

Naming convention:

```text
chore/<task-name>
```

Example from SprintHub:

```text
chore/prisma-integrity
```

Typical uses include:

- Project maintenance.
- Dependency or tooling configuration.
- Database or ORM integrity improvements.
- Development infrastructure tasks.

---

## Documentation Branches

Documentation branches are used for changes that primarily affect project documentation.

Naming convention:

```text
docs/<documentation-scope>
```

Examples from SprintHub:

```text
docs/update-phase-7
```

Documentation branches may update:

- Architecture documentation.
- Development guides.
- ADRs.
- Project specifications.
- Phase documentation.
- Other technical documentation.

---

## Branch Naming Rules

All new branch names should follow these conventions:

- Use lowercase letters.
- Separate words using hyphens.
- Use a recognized branch type.
- Keep names short and descriptive.
- Each branch should address a single objective.
- Avoid unnecessary abbreviations.
- Delete branches after they have been merged when they are no longer required.

Supported branch types are:

```text
feature/*
fix/*
refactor/*
chore/*
docs/*
```

---

## Pull Requests

All working branches are integrated into develop through Pull Requests.

The Pull Request should:

- Describe the purpose of the changes.
- Reference the relevant issue, phase, or task when applicable.
- Pass the required CI checks.
- Be reviewed before merging when applicable.
- Use the repository's established commit and merge conventions.

After successful validation, the branch can be merged into develop.

---

## Branch Flow

The general development flow is:

```text
feature/*
fix/*
refactor/*
chore/*
docs/*
      │
      ▼
   develop
      │
      ▼
     main
```

The develop branch is therefore the integration point for all active development, while main remains the stable production branch.

---

# 6. Commit Convention

SprintHub follows the **Conventional Commits** specification to maintain a consistent and readable project history.

## Commit Format

```text
<type>(<scope>): <description>
```

Example:

```text
feat(auth): implement JWT authentication
```

---

## Commit Types

| Type       | Purpose                                     |
| ---------- | ------------------------------------------- |
| `feat`     | New feature                                 |
| `fix`      | Bug fix                                     |
| `docs`     | Documentation changes                       |
| `refactor` | Code improvements without changing behavior |
| `style`    | Formatting and style changes                |
| `test`     | Test additions or updates                   |
| `chore`    | Maintenance tasks                           |
| `build`    | Build system or dependency changes          |
| `ci`       | Continuous Integration changes              |

---

## Commit Guidelines

- Write commit messages in English.
- Use the imperative mood.
- Keep descriptions concise and meaningful.
- Each commit should represent a single logical change.
- Avoid mixing unrelated changes in the same commit.

---

## Examples

```text
feat(auth): implement login endpoint

fix(tasks): validate task due date

docs(add): update backend architecture

refactor(api): simplify repository implementation

test(projects): add integration tests

ci(github): configure pull request workflow
```

---

# 7. Pull Request Process

All changes must be reviewed through a Pull Request before being merged into a protected branch.

---

## Pull Request Workflow

```text
Feature Branch
      │
      ▼
Push to GitHub
      │
      ▼
Open Pull Request
      │
      ▼
Automatic CI Validation
      │
      ▼
Code Review
      │
      ▼
Merge into develop
```

---

## Pull Request Guidelines

Each Pull Request should:

- Address a single objective.
- Include a clear description of the change.
- Reference related documentation when applicable.
- Pass all required CI checks.
- Be reviewed before merging.
- Update related project documentation when the implementation changes documented behavior or architecture.

---

## Pull Request Checklist

Before requesting a review, verify that:

- The branch is up to date.
- The project builds successfully.
- Tests pass.
- Linting passes.
- Documentation has been updated when necessary.
- No unnecessary files are included.

---

## Merge Strategy

SprintHub uses **Squash and Merge** to keep the Git history clean and readable.

Each merged Pull Request results in a single commit on the target branch.

---

# 8. Folder Naming

SprintHub follows consistent naming conventions across frontend and backend code.

| Element          | Convention                        | Example                    |
| ---------------- | --------------------------------- | -------------------------- |
| Backend folders  | lowercase                         | `repository`, `controller` |
| Backend modules  | lowercase, plural                 | `workspaces`, `projects`   |
| Frontend folders | lowercase, kebab-case when needed | `user-profile`             |
| React Components | PascalCase                        | `TaskCard.tsx`             |
| Hooks            | camelCase with `use` prefix       | `useProjects.ts`           |
| Utility Files    | camelCase                         | `formatDate.ts`            |
| Types            | PascalCase                        | `Task.ts`                  |
| Constants        | UPPER_SNAKE_CASE                  | `MAX_FILE_SIZE`            |

These conventions apply across both frontend and backend projects where appropriate.

---

# 9. React Conventions

Frontend development follows a consistent set of React best practices.

## Components

- Keep components focused on a single responsibility.
- Prefer composition over inheritance.
- Extract reusable UI into shared components only when appropriate.
- Avoid unnecessarily large components.

---

## Hooks

- Custom hooks encapsulate reusable logic.
- Hook names must start with `use`.
- Hooks should avoid direct UI rendering responsibilities.

---

## State Management

Use the most appropriate state mechanism based on the scope of the data.

| Scope               | Solution         |
| ------------------- | ---------------- |
| Local UI State      | React `useState` |
| Shared Client State | React Context    |
| Server State        | TanStack Query   |

Avoid duplicating server state in client state whenever possible.

---

## Forms

Forms are implemented using:

- React Hook Form
- Zod validation

Validation rules should remain centralized and reusable.

---

## Next.js App Router

The frontend uses the Next.js App Router.

Server Components should be used by default when the component does not require client-side interactivity.

Client Components should be introduced only when required for:

- Client-side state.
- Event handlers.
- Browser APIs.
- Interactive UI behavior.

---

## Feature Organization

Frontend code is organized by business capability rather than technical file type.

Feature-specific code must remain inside its corresponding feature.

Example:

```text
features/
└── tasks/
    ├── api/
    ├── components/
    ├── hooks/
    ├── schemas/
    ├── services/
    ├── types/
    └── utils/
```

Shared directories should contain only functionality that is genuinely reused across multiple features.

---

# 10. Code Standards

SprintHub follows consistent coding standards across the project.

## General Principles

- Write readable code.
- Prefer simplicity over cleverness.
- Avoid duplicated logic.
- Keep functions focused on a single responsibility.
- Remove unused code.

---

## TypeScript

- Enable strict mode.
- Avoid the `any` type whenever possible.
- Define explicit types for public APIs.
- Reuse shared types instead of duplicating definitions.

---

## Backend Architecture

Backend modules must follow the established Layered Architecture.

- Controllers handle HTTP concerns.
- Services contain business rules.
- Repositories handle persistence through Prisma.
- DTOs define API contracts.
- Zod schemas define request validation.
- Middleware handles cross-cutting concerns.
- Repositories must not contain business logic.
- Controllers must not access repositories directly.
- Repositories must not depend on higher application layers.

Business logic must remain within the Service layer.

### Shared Infrastructure

Cross-cutting infrastructure is organized as follows:

- Application middleware: `src/middleware`
- Shared validation utilities: `src/shared/validation`
- Shared errors: `src/shared/errors`
- Shared logging utilities: `src/shared/logger`

Module-specific validation schemas remain inside their corresponding module under `schema/`.

### Authentication

Protected backend routes use the shared `authenticate` middleware.

The authentication infrastructure supports:

- JWT Access Tokens.
- HttpOnly cookies.
- `Authorization: Bearer` headers.
- Typed `req.user`.

Authentication-related middleware is located under:

```text
src/middleware/auth/
```

Business authorization rules remain within the Service layer.

---

## Search, Filtering and Sorting

Collection endpoints should follow the established query conventions.

### Workspaces

- Search by name.
- Sort by name or createdAt.
- Sort order: asc or desc.
- No filters.

### Projects

- Search by name.
- Filter by status.
- Filter by archived.
- Sort by name or createdAt.
- Sort order: asc or desc.

### Tasks

- Search by title only.
- Filter by status.
- Filter by priority.
- Filter by assigneeId.
- Filter by dueDate.
- Sort by createdAt, dueDate, or priority.
- Sort order: asc or desc.

The search parameter must only search the documented resource field and must not implicitly search other fields.

### Task Update Rules

The general Task update operation is limited to:

- title
- description
- dueDate

Task status and priority are handled through their dedicated operations.

Task assignment and unassignment are handled independently from the general Task update operation.

### Task Completion Rules

The completedAt field follows the Task status lifecycle:

- When a Task changes to DONE, completedAt is set to the corresponding completion timestamp.
- When a Task changes from DONE to another status, completedAt must be reset to null.

---

## Formatting

Formatting is enforced automatically using:

- ESLint
- Prettier

Developers should avoid manual formatting changes that conflict with project rules.

---

# 11. Testing

SprintHub follows a layered testing strategy.

| Test Type         | Purpose                                              |
| ----------------- | ---------------------------------------------------- |
| Unit Tests        | Validate isolated business logic and utilities       |
| Integration Tests | Validate interactions between application components |
| End-to-End Tests  | Validate complete user workflows                     |

Backend tests should follow the layered architecture:

| Layer      | Primary Focus                                              |
| ---------- | ---------------------------------------------------------- |
| Controller | HTTP status codes, request validation, response formatting |
| Service    | Business rules, authorization, workflows, transactions     |
| Repository | Database queries, persistence behavior, query correctness  |

Tests should be deterministic, independent, and easy to maintain.

---

# 12. Useful Scripts

Common development scripts are defined in the root `package.json`.

| Script                   | Purpose                           |
| ------------------------ | --------------------------------- |
| `npm run dev`            | Start the development environment |
| `npm run build`          | Generate the production build     |
| `npm run lint`           | Run ESLint                        |
| `npm run test`           | Execute automated tests           |
| `npm run format`         | Format the codebase with Prettier |
| `npm run prisma:migrate` | Apply Prisma database migrations  |
| `npm run prisma:seed`    | Seed the database                 |

Additional scripts may be introduced as the project evolves.

---

# 13. Environment Variables

SprintHub uses environment variables to manage configuration across different environments.

Sensitive information must never be committed to the repository.

## Local Configuration

Developers should create a local environment file based on the provided template.

```text
.env.example
        │
        ▼
      .env
```

The .env.example file documents the required variables without exposing sensitive values.

Environment variables may include:

- Database connection strings.
- JWT secrets.
- Application URLs.
- Third-party service credentials.

Local .env files must never be committed to the repository.
Sensitive production values must be managed through the appropriate deployment or repository secret-management mechanisms.

---

# 14. Continuous Integration

SprintHub uses **GitHub Actions** for Continuous Integration.

Workflows are triggered automatically by:

- Pull Requests.
- Pushes to protected branches.

The default CI pipeline includes:

1. Install dependencies.
2. Type checking.
3. Linting.
4. Automated tests.
5. Production build validation.

All required CI checks must pass before changes can be merged into protected branches.

Workflow files are stored in:

```text
.github/workflows/
```

The CI pipeline establishes the foundation for future Continuous Deployment workflows.

---

# 15. Related Documentation

The Developer Guide complements the rest of SprintHub's technical documentation.

| Document  | Purpose                                             |
| --------- | --------------------------------------------------- |
| Blueprint | Defines the overall technical vision.               |
| PRD       | Defines product requirements.                       |
| SRS       | Defines functional and non-functional requirements. |
| ADD       | Describes the overall software architecture.        |
| DDS       | Defines the domain model and database design.       |
| ADS       | Defines the REST API specification.                 |
| ADRs      | Document significant architectural decisions.       |

Developers should consult these documents when working on architecture, implementation, API behavior, database changes, or product features.

---

# 16. Conclusion

This guide establishes the development standards and engineering practices used throughout SprintHub.

By following these conventions, contributors can:

- Produce consistent, maintainable code.
- Collaborate effectively.
- Reduce integration issues.
- Maintain architectural consistency.
- Support the long-term evolution of the project.

As SprintHub evolves, this guide should be updated to reflect changes in development practices, tooling, and workflows.

---
