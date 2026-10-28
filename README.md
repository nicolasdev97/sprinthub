# SprintHub

<p align="center">
  <img src="https://raw.githubusercontent.com/nicolasdev97/sprinthub/main/apps/web/public/favicon.ico" alt="SprintHub Logo" width="64" height="64" />
</p>

<p align="center">
  <strong>Enterprise-Grade Project & Sprint Management Platform</strong><br />
  A modern, full-stack collaborative workspace inspired by Jira, Trello, and ClickUp.<br />
  Engineered with strict modular architecture, defensive security, real-time concurrency, and 100% critical testing coverage.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-22%20LTS-339933?style=flat&logo=nodedotjs&logoColor=white" alt="Node.js 22" />
  <img src="https://img.shields.io/badge/TypeScript-5.x%20%7C%207.x-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Next.js-15%20%2F%20React%2019-000000?style=flat&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Express-5.x-000000?style=flat&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-6.x-2D3748?style=flat&logo=prisma&logoColor=white" alt="Prisma ORM" />
  <img src="https://img.shields.io/badge/OpenAPI-3.0%20%2F%20Swagger-85EA2D?style=flat&logo=swagger&logoColor=black" alt="OpenAPI 3.0" />
  <img src="https://img.shields.io/badge/Tests-115%20Passing-brightgreen?style=flat&logo=vitest&logoColor=white" alt="115 Tests Passing" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat" alt="MIT License" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Monorepo Architecture](#monorepo-architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
  - [Workflow A: Local Development with Docker PostgreSQL (Recommended)](#workflow-a-local-development-with-docker-postgresql-recommended)
  - [Workflow B: Full Stack Multi-Container Orchestration](#workflow-b-full-stack-multi-container-orchestration)
- [Demo Seed Credentials](#demo-seed-credentials)
- [Interactive API Documentation (Swagger)](#interactive-api-documentation-swagger)
- [Testing Suite](#testing-suite)
- [Environment Variables](#environment-variables)
- [Scripts & Command Matrix](#scripts--command-matrix)
- [Security & Hardening](#security--hardening)
- [Technical Documentation](#technical-documentation)
- [License](#license)

---

## Overview

SprintHub is designed from the ground up as a **production-ready SaaS platform**, prioritizing:
* **Architecture Integrity:** Modular Monolith on the backend (`Controller → Service → Repository`) and Domain-Driven Features on the frontend.
* **Defensive Security:** Contextual RBAC guards, deep input sanitization, strict Zod schema validation against IDOR/mass-assignment, and HttpOnly cookie session management.
* **Interactive Documentation:** Native OpenAPI 3.0 specification served via interactive Swagger UI at `/api/docs`.
* **Zero-Regressions Quality:** Exhaustive test suite combining Unit (`Vitest`, `Jest`), Integration with isolated PostgreSQL (`Supertest`), and End-to-End browser testing (`Playwright`).

---

## Key Features

### 🔐 Authentication & Access Control
- Cryptographic password hashing via `bcrypt` (10 salt rounds).
- Short-lived JSON Web Tokens (JWT) in memory paired with secure `HttpOnly`, `SameSite=Lax` Refresh Tokens persisted in database.
- Granular Role-Based Access Control (**RBAC**) across Workspaces: `OWNER`, `ADMIN`, `MEMBER`.
- Account management with intentional full-name confirmation guard for deletions.

### 🏢 Workspaces & Project Governance
- Multi-tenant workspace isolation.
- Member invitations, role upgrades/downgrades, and safe ownership transfer.
- Project lifecycle management (`PLANNING`, `ACTIVE`, `COMPLETED`), search, status filtering, and soft archival.

### 📋 Task Board & Kanban Workflows
- Interactive Kanban Board and List views with drag-and-drop state progression (`BACKLOG`, `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`).
- Priority classification (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), due dates, and assignee delegation.
- Automatic task completion timestamping (`completedAt`).

### ⚡ Real-Time Concurrency & Synchronization
- Real-time event streams powered by **Server-Sent Events (SSE)** at `/api/events`.
- Instant task state updates and assignment alerts pushed to connected team members.
- Cross-tab coordination via `BroadcastChannel` to synchronize active sessions without page reloads.

### 📊 Workspace Analytics & Dashboard
- Aggregated project, task, and team velocity metrics.
- High-priority workload breakdown: urgent tasks needing attention and upcoming 7-day deadlines.

---

## Monorepo Architecture

SprintHub is structured as a unified monorepo managed with **npm workspaces**:

```text
sprinthub/
├── apps/
│   ├── api/                     # Backend REST API (Express.js, TypeScript, Prisma ORM)
│   │   ├── prisma/              # Schema, migrations, and deterministic seed script
│   │   ├── src/
│   │   │   ├── database/        # Prisma client singleton
│   │   │   ├── docs/            # Modular OpenAPI 3.0 specification & Swagger UI
│   │   │   ├── middleware/      # Security (Helmet, CORS, RateLimiter, RBAC, Sanitization)
│   │   │   ├── modules/         # Domain modules (auth, users, workspaces, projects, tasks, ...)
│   │   │   ├── routes/          # Express route registration and healthcheck
│   │   │   └── shared/          # Centralized error handler, logger, and cryptographic utilities
│   │   └── tests/               # Unit, integration, and mock suites
│   │
│   └── web/                     # Frontend Application (Next.js 15, React 19, Tailwind CSS)
│       ├── src/
│       │   ├── app/             # Next.js App Router (pages, nested layouts, protected routes)
│       │   ├── components/      # UI component library (shadcn/ui, Radix/Base UI)
│       │   ├── features/        # Feature domains (auth, workspaces, projects, tasks, dashboard)
│       │   ├── providers/       # TanStack Query, Theme, and Realtime SSE providers
│       │   └── services/        # Resilient Axios HTTP client with interceptors
│       └── tests/               # Unit, component, and Playwright E2E suites
│
├── docs/                        # Complete technical specifications (Blueprint, PRD, SRS, ADRs)
├── docker-compose.yml           # Multi-container orchestration (PostgreSQL 17, API, Web)
└── package.json                 # Monorepo root configuration and unified lifecycle scripts
```

---

## Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [TanStack Query v5](https://tanstack.com/query), [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |
| **Backend** | [Node.js 22 LTS](https://nodejs.org/), [Express 5](https://expressjs.com/), [Prisma ORM 6](https://www.prisma.io/), [Zod](https://zod.dev/), [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken), [bcrypt](https://github.com/kelektiv/node.bcrypt.js) |
| **Database** | [PostgreSQL 17](https://www.postgresql.org/) |
| **API Documentation** | [OpenAPI 3.0.3](https://swagger.io/specification/) & [Swagger UI Express](https://github.com/scottie1984/swagger-ui-express) |
| **DevOps & Containers** | [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) |
| **Testing Suite** | [Vitest](https://vitest.dev/), [Jest](https://jestjs.io/), [Supertest](https://github.com/ladjs/supertest), [React Testing Library](https://testing-library.com/), [Playwright](https://playwright.dev/) |

---

## Prerequisites

Ensure you have the following installed locally:
- **Node.js**: `>= 20.18.0` (Recommended: `v22.x LTS`)
- **npm**: `>= 10.x`
- **Docker & Docker Compose**: Required for PostgreSQL persistence and containerized builds
- **Git**

---

## Quick Start

### Workflow A: Local Development with Docker PostgreSQL (Recommended)

This workflow runs PostgreSQL in Docker while executing the API and Web applications natively on your host machine for hot-reloading and debugging.

#### 1. Clone the repository and install dependencies
```bash
git clone https://github.com/nicolasdev97/sprinthub.git
cd sprinthub
npm install
```

#### 2. Configure environment variables
```bash
# Copy backend environment template
cp apps/api/.env.example apps/api/.env

# Copy frontend environment template
cp apps/web/.env.example apps/web/.env
```

#### 3. Start PostgreSQL container
```bash
npm run docker:db
```

#### 4. Run database migrations and seed default data
```bash
npm run db:migrate
npm run db:seed
```

#### 5. Launch development servers
```bash
npm run dev
```

The applications will be available at:
- 🌐 **Frontend (Web):** [http://localhost:3000](http://localhost:3000)
- 🚀 **Backend (API):** [http://localhost:3001](http://localhost:3001)
- 📖 **Swagger UI Docs:** [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- 🗄️ **Database (PostgreSQL):** `localhost:5432`

---

### Workflow B: Full Stack Multi-Container Orchestration

To run the complete isolated stack (PostgreSQL + API + Web) using Docker Compose:

```bash
# 1. Setup root environment template
cp .env.example .env

# 2. Build and launch all services in background
npm run docker:up

# 3. Apply migrations and seed data inside container
docker compose exec api npx prisma migrate deploy
docker compose exec api npm run db:seed
```

To stop all running containers:
```bash
npm run docker:down
```

---

## Demo Seed Credentials

Running `npm run db:seed` provisions a ready-to-test workspace, project, and task board with the following accounts:

| Role | Email | Password | Preloaded Workspace |
| :--- | :--- | :--- | :--- |
| **Workspace Owner (Admin)** | `admin@sprinthub.dev` | `Password123!` | SprintHub Engineering |
| **Workspace Member (Dev)** | `dev@sprinthub.dev` | `Password123!` | SprintHub Engineering |

---

## Interactive API Documentation (Swagger)

SprintHub includes full **OpenAPI 3.0** documentation served natively by the backend:

- **Swagger UI Interactive Explorer:** [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- **OpenAPI Schema (JSON raw):** [http://localhost:3001/api/docs.json](http://localhost:3001/api/docs.json)

### Features:
* **Interactive Testing ("Try it out"):** Test every endpoint directly from the browser.
* **Persistent Authentication:** Authorize once using `bearerAuth` (JWT Token) or cookie session; your token is preserved across page reloads.
* **Static Verification:** Validate the OpenAPI specification syntax without starting the server:
  ```bash
  npm run docs:validate
  ```

---

## Testing Suite

SprintHub maintains a strict automated testing suite ensuring zero regressions across all critical business flows (**115 tests passing**):

```bash
# Run all unit tests across API and Web
npm run test:unit

# Run backend integration tests with isolated real PostgreSQL
npm run test:integration

# Run frontend End-to-End (E2E) browser journeys with Playwright
npm run test:e2e

# Run global TypeScript typecheck (0 errors)
npm run typecheck
```

### Coverage Breakdown:
1. **API Unit Tests (`apps/api` - 51 tests):** Vitest + Prisma mocks covering AuthService, WorkspaceService, TaskService, JWT utilities, Password hashing, RBAC middleware, and Swagger docs.
2. **Web Unit Tests (`apps/web` - 39 tests):** Jest + React Testing Library covering Zod schemas, form validations, session cookies, permission guards, and custom hooks.
3. **API Integration Tests (`apps/api` - 24 tests):** Supertest on a dedicated database verifying complete registration, login, token refresh, workspace creation, RBAC enforcement, and task transitions.
4. **E2E Tests (`apps/web` - 5 tests):** Playwright on Chromium covering end-to-end auth journey, workspace/project lifecycle, and Kanban board task manipulation with state persistence.

---

## Environment Variables

### Root (`.env.example`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `POSTGRES_USER` | PostgreSQL user | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `postgres` |
| `POSTGRES_DB` | PostgreSQL database name | `sprinthub` |
| `POSTGRES_PORT` | PostgreSQL exposed host port | `5432` |
| `API_PORT` | Backend API exposed port | `3001` |
| `WEB_PORT` | Frontend Web exposed port | `3000` |

### Backend API (`apps/api/.env.example`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/sprinthub?schema=public` |
| `PORT` | HTTP server port | `3001` |
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) | `development` |
| `JWT_SECRET` | 256-bit secret for signing access tokens | `replace-with-a-secure-random-secret-key` |
| `JWT_REFRESH_SECRET`| Secret for refresh tokens | `replace-with-a-secure-random-refresh-secret-key` |
| `CORS_ORIGIN` | Allowed client origins (comma-separated) | `http://localhost:3000` |

### Frontend Web (`apps/web/.env.example`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Backend REST API endpoint URL | `http://localhost:3001/api` |
| `NEXT_PUBLIC_APP_URL` | Frontend public domain URL | `http://localhost:3000` |

---

## Scripts & Command Matrix

| Category | Command | Description |
| :--- | :--- | :--- |
| **Development** | `npm run dev` | Concurrently runs API (`:3001`) and Web (`:3000`) with hot-reload |
| | `npm run dev:api` | Runs backend Express API only |
| | `npm run dev:web` | Runs frontend Next.js application only |
| **Build & Start** | `npm run build` | Compiles both API (`tsc`) and Web (`next build`) |
| | `npm run start` | Starts production build of frontend Web |
| | `npm run start:api` | Starts compiled backend API (`node dist/server.js`) |
| **Testing** | `npm run test` / `test:unit` | Executes all unit test suites |
| | `npm run test:api` | Runs Vitest unit tests in `apps/api` |
| | `npm run test:web` | Runs Jest unit tests in `apps/web` |
| | `npm run test:integration` | Runs Supertest integration tests on real DB |
| | `npm run test:e2e` | Runs Playwright Chromium E2E browser tests |
| **Database (Prisma)**| `npm run db:migrate` | Applies development database migrations |
| | `npm run db:seed` | Populates database with default demo accounts and tasks |
| | `npm run db:studio` | Opens interactive Prisma Studio GUI |
| | `npm run db:generate` | Regenerates Prisma Client types |
| **Docker** | `npm run docker:up` | Boots full stack via Docker Compose (`-d`) |
| | `npm run docker:down` | Shuts down and removes Docker Compose containers |
| | `npm run docker:build` | Rebuilds and launches Docker containers |
| | `npm run docker:db` | Boots isolated PostgreSQL database container |
| **Code Quality** | `npm run typecheck` | Validates TypeScript types across all workspaces |
| | `npm run lint` | Runs ESLint analysis across the monorepo |
| | `npm run lint:fix` | Automatically corrects fixable lint issues |
| | `npm run format:check` | Verifies code formatting with Prettier |
| **Documentation** | `npm run docs:validate` | Statically checks OpenAPI 3.0 schema integrity |
| | `npm run docs:generate` | Exports OpenAPI schema to `apps/api/dist/docs/openapi.json` |

---

## Security & Hardening

SprintHub implements a defense-in-depth posture:
* **HTTP Security Headers:** Helmet enforces strict CSP, HSTS, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY`.
* **CORS Restrictions:** Environment-driven origin whitelisting with credentials support.
* **Rate Limiting:** Global API rate limiting with dedicated aggressive throttling for credential endpoints (`/api/auth/register`, `/api/auth/login`) to mitigate brute force.
* **Contextual RBAC:** Middleware validates workspace/project memberships and roles before request processing, eliminating IDOR vulnerabilities.
* **Input Sanitization:** Recursive request body sanitization stripping null bytes, script tags, and normalized email formats.
* **Cookie Security:** Refresh tokens stored exclusively in `HttpOnly`, `Secure`, `SameSite=Lax` cookies.

---

## Technical Documentation

Detailed architecture specifications and design records are located in the [`docs/`](file:///c:/Users/NICOLAS/Documents/GitHub/sprinthub/docs) directory:

- [Project Blueprint](file:///c:/Users/NICOLAS/Documents/GitHub/sprinthub/docs/01-blueprint/Blueprint.md)
- [Product Requirements Document (PRD)](file:///c:/Users/NICOLAS/Documents/GitHub/sprinthub/docs/02-requirements/PRD.md)
- [Software Architecture Document (SAD)](file:///c:/Users/NICOLAS/Documents/GitHub/sprinthub/docs/03-architecture/SAD.md)
- [Detailed Design Specification (DDS)](file:///c:/Users/NICOLAS/Documents/GitHub/sprinthub/docs/04-design/DDS.md)
- [Architecture Decision Records (ADRs)](file:///c:/Users/NICOLAS/Documents/GitHub/sprinthub/docs/06-decisions)
- [Developer Guide (DG)](file:///c:/Users/NICOLAS/Documents/GitHub/sprinthub/docs/07-development/Developer-Guide.md)

---

## License

Distributed under the **MIT License**. See `LICENSE` for details.
