# Developer Guide (DG)

> Development standards, workflows, coding conventions, and contribution guidelines for SprintHub.

---

| Property         | Value                |
| ---------------- | -------------------- |
| **Document**     | Developer Guide (DG) |
| **Project**      | SprintHub            |
| **Version**      | 1.0                  |
| **Status**       | Approved             |
| **Owner**        | Nicolás Palacio      |
| **Last Updated** | July 2026            |

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

- Node.js 22 LTS
- npm 10+
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

This command starts the required local services, including the PostgreSQL database.

Future infrastructure services (such as Redis) may be added as the platform evolves.

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

SprintHub follows a Git workflow that promotes collaboration while keeping the `main` branch stable.

---

## Main Branch

The `main` branch represents the production-ready version of the application.

Rules:

- Never develop directly on `main`.
- Only receive changes from `develop`.
- Every merge should represent a stable release.

---

## Develop Branch

The `develop` branch acts as the primary integration branch.

Rules:

- Completed features are merged into `develop`.
- Features are validated together before being promoted to `main`.

---

## Feature Branches

Feature branches are used to implement new functionality.

Naming convention:

```text
feature/<feature-name>
```

Examples:

```text
feature/auth-login
feature/auth-register
feature/dashboard
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

Fix branches are used exclusively to correct bugs.

Naming convention:

```text
fix/<bug-name>
```

Examples:

```text
fix/token-refresh
fix/sidebar-scroll
fix/task-validation
```

---

## Refactor Branches

Refactor branches improve code quality without changing application behavior.

Naming convention:

```text
refactor/<module>
```

Examples:

```text
refactor/auth-service
refactor/project-repository
refactor/database-layer
```

---

## Branch Naming Rules

All branch names should follow these conventions:

- Use lowercase letters.
- Separate words using hyphens.
- Keep names short and descriptive.
- Each branch should address a single objective.
- Delete branches after they have been merged.

---

## Branch Flow

```text
feature/*
fix/*
refactor/*
      │
      ▼
   develop
      │
      ▼
     main
```

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
- Reference related issues when applicable.
- Pass all CI checks.
- Be reviewed before merging.

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

SprintHub follows consistent naming conventions to improve readability and maintainability.

| Element          | Convention                  | Example          |
| ---------------- | --------------------------- | ---------------- |
| Folders          | kebab-case                  | `user-profile`   |
| React Components | PascalCase                  | `TaskCard.tsx`   |
| Hooks            | camelCase with `use` prefix | `useProjects.ts` |
| Utility Files    | camelCase                   | `formatDate.ts`  |
| Types            | PascalCase                  | `Task.ts`        |
| Constants        | UPPER_SNAKE_CASE            | `MAX_FILE_SIZE`  |

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

## Formatting

Formatting is enforced automatically using:

- ESLint
- Prettier

Developers should avoid manual formatting changes that conflict with project rules.

---

# 11. Testing

SprintHub adopts a layered testing strategy.

| Test Type         | Purpose                                               |
| ----------------- | ----------------------------------------------------- |
| Unit Tests        | Validate isolated business logic                      |
| Integration Tests | Validate interactions between components and services |
| End-to-End Tests  | Validate complete user workflows                      |

Tests should be deterministic, independent, and easy to maintain.

---

# 12. Useful Scripts

Common development scripts are defined in the root `package.json`.

| Script           | Purpose                           |
| ---------------- | --------------------------------- |
| `npm run dev`    | Start the development environment |
| `npm run build`  | Generate the production build     |
| `npm run lint`   | Run ESLint                        |
| `npm run test`   | Execute automated tests           |
| `npm run format` | Format the codebase with Prettier |

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

The `.env.example` file documents all required variables without exposing sensitive values.

Typical configuration includes:

- Database connection.
- JWT secrets.
- Application URLs.
- Third-party service credentials.

---

# 14. Continuous Integration

SprintHub uses **GitHub Actions** to automate Continuous Integration.

Every Pull Request is automatically validated before it can be merged into a protected branch.

The default CI pipeline includes:

- Dependency installation.
- Type checking.
- Linting.
- Automated tests.
- Production build validation.

Future enhancements may introduce additional workflows, such as release automation or security scanning, as the project evolves.

---

# 15. Related Documentation

The Developer Guide complements the rest of SprintHub's documentation.

| Document  | Purpose                                             |
| --------- | --------------------------------------------------- |
| Blueprint | Defines the overall technical vision.               |
| PRD       | Defines product requirements.                       |
| SRS       | Defines functional and non-functional requirements. |
| ADD       | Describes the overall software architecture.        |
| DDS       | Defines the domain model and database design.       |
| ADS       | Defines the REST API specification.                 |
| ADRs      | Document key architectural decisions.               |

Developers are encouraged to consult these documents when working on architecture, implementation, or product features.

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
