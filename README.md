# SprintHub

A modern full-stack project management platform inspired by Jira, Trello, and ClickUp.

SprintHub is being built as a production-ready SaaS application with a strong focus on software architecture, scalability, security, testing, CI/CD, and developer experience.

The goal of this project is not only to build a functional application, but also to showcase professional software engineering practices used in modern development teams.

---

## Features

### Authentication & Authorization

- User registration
- User login
- JWT authentication
- Refresh tokens
- Role-based access control (RBAC)

### Workspace Management

- Create workspaces
- Update workspaces
- Delete workspaces
- View and invite members
- Manage member roles

### Project Management

- Create projects
- Update projects
- Archive and unarchive projects
- Delete projects

### Task Management

- Create tasks
- Assign users
- Set priorities
- Manage task status
- Due dates
- Delete tasks

### Dashboard

- Personal cross-workspace dashboard (`/dashboard`)
- Workload & Health analytics with sprint completion metrics
- Urgent items (*Needs Attention*) and 7-day planning window (*Due This Week*)
- Workspace-scoped progress metrics and KPIs

### Global Hubs & Productivity

- Global Projects Hub (`/projects`) with multi-workspace search & status filters
- Global Tasks Hub (`/tasks`) with cascading workspace/project filters and pagination
- Command Palette (`Ctrl+K`) for fuzzy navigation across views and projects
- Keyboard shortcuts catalog modal (`?`)
- Contextual back navigation preserving filter and hub history

### Notifications

- In-app notifications
- Task assignment alerts

---

## Tech Stack

### Frontend

- Next.js
- TypeScript
- React Query (TanStack Query)
- React Hook Form
- Zod
- Tailwind CSS
- shadcn/ui

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- JWT
- bcrypt

### Database

- PostgreSQL

### Infrastructure

- Docker
- Docker Compose
- GitHub Actions
- CI/CD Pipelines
- Redis (planned)

### Testing

- Jest
- Supertest
- Playwright

---

## Repository Structure & Architecture

SprintHub is organized as a **monorepo** powered by npm workspaces, cleanly separating frontend, backend, and documentation:

```text
sprinthub/
├── apps/
│   ├── web/          # Next.js frontend application (Feature-based architecture)
│   └── api/          # Express.js REST API backend (Modular monolith with layered architecture)
├── docs/             # Technical specifications, architectural blueprints, and ADRs
├── docker/           # Docker configuration files
├── .github/          # GitHub Actions CI/CD workflows
├── docker-compose.yml
└── package.json
```

### Backend Architecture (`apps/api`)

Each business module follows a strict layered pattern:

`Controller → Service → Repository → Prisma ORM → PostgreSQL`

Core modules: `auth`, `users`, `workspaces`, `projects`, `tasks`, `notifications`, `dashboard`.

### Frontend Architecture (`apps/web`)

Organized around feature domains with clear separation of concerns:

```text
apps/web/src/
├── app/              # Next.js App Router (pages and layouts)
├── components/       # Reusable UI components (shadcn/ui)
├── features/         # Feature-based modules (hook, service, schema, context, types, components)
├── lib/              # Third-party client configurations (e.g., TanStack Query client)
├── providers/        # Application-level React providers
├── services/         # HTTP client (Axios) and integration services
└── shared/           # Shared frontend errors and helper utilities
```

---

## Quick Start

### 1. Prerequisites

- **Node.js:** `>= 20.x`
- **Docker & Docker Compose**

### 2. Setup & Installation

```bash
git clone https://github.com/nicolasdev97/sprinthub.git
cd sprinthub
npm install
cp .env.example .env
```

### 3. Start Database Infrastructure

```bash
docker compose up -d
```

### 4. Run Migrations

```bash
npm run prisma:migrate
```

### 5. Start Development Servers

```bash
npm run dev
```

Both applications will start concurrently:

- **Frontend (Next.js):** `http://localhost:3000`
- **Backend (Express API):** `http://localhost:3001`
- **Database (PostgreSQL):** `localhost:5432`

---

## Security

Planned security features:

- JWT Authentication
- Refresh Token Authentication (HttpOnly Cookies)
- Password Hashing (bcrypt)
- Request Validation (Zod)
- Rate Limiting
- Helmet
- CORS Protection
- Secure Cookies

---

## Testing Strategy

### Unit Testing

- Services
- Utilities
- Business logic

### Integration Testing

- API endpoints
- Database interactions

### End-to-End Testing

- Authentication flows
- Project management flows
- Task management flows

Target Coverage: 70%+

---

## CI/CD Pipeline

Install → Lint → Type Check → Test → Build

---

## Project Goals

- Build a production-ready application
- Apply scalable software architecture
- Follow industry best practices
- Implement automated testing
- Use modern DevOps workflows
- Demonstrate full-stack engineering skills

---

## Documentation

Project documentation can be found in the `/docs` directory.

- Blueprint
- PRD
- SRS
- ADD
- DDS
- ADS
- ADRs
- Developer Guide

---

## License

MIT License
