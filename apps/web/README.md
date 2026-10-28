# SprintHub Web (`apps/web`)

> Production-ready Next.js frontend application for SprintHub, built with React, TypeScript, Tailwind CSS, and shadcn/ui.

---

## Architecture Overview

The web client adheres strictly to **ADR-006 (Feature-Based Frontend Architecture)** and the SprintHub **Developer Guide**. Code is organized by business domain rather than technical layers to ensure high cohesion, low coupling, and scalable feature expansion.

### Directory Structure

```text
apps/web/src/
├── app/                  # Next.js App Router (pages, layouts, and route groups)
│   ├── (app)/            # Authenticated core application layout and routes
│   │   ├── dashboard/    # Personal cross-workspace dashboard
│   │   ├── projects/     # Global Projects Hub
│   │   ├── tasks/        # Global Tasks Hub
│   │   ├── workspaces/   # Workspaces hub, projects overview, task boards, and settings
│   │   └── profile/      # User profile settings
│   ├── (auth)/           # Authentication layout (login, register)
│   └── page.tsx          # Marketing landing page
├── components/           # Reusable presentation components
│   ├── layout/           # AppNavbar, AppSidebar, CommandPalette, Breadcrumbs
│   └── ui/               # Core primitives (shadcn/ui Buttons, Modals, Forms)
├── features/             # Business feature modules
│   ├── auth/             # Authentication & session management
│   ├── dashboard/        # Personal dashboard widgets & analytics
│   ├── workspaces/       # Workspace CRUD, membership & settings
│   ├── projects/         # Project lifecycle, progress & settings
│   ├── tasks/            # Sprint task Kanban boards, list views & task drawer
│   └── notifications/    # In-app notifications menu & triggers
├── lib/                  # Library configurations (TanStack Query client)
├── providers/            # React context providers (Auth, Query, Theme, Workspace)
├── services/             # Base HTTP client with Axios interceptors and token refresh
└── shared/               # Shared utilities, classnames (cn), and normalized API errors
```

### Feature Module Conventions

Inside `src/features/<feature-name>/`:

| Layer Folder  | Convention | Example Files                                       |
| :------------ | :--------- | :-------------------------------------------------- |
| `context/`    | Singular   | `WorkspaceContext.tsx`                              |
| `hook/`       | Singular   | `project.hook.ts`, `task.hook.ts`                   |
| `service/`    | Singular   | `project.service.ts`, `task.service.ts`             |
| `schema/`     | Singular   | `create-task.schema.ts`, `update-project.schema.ts` |
| `types/`      | Plural     | `project.type.ts`, `task.type.ts`                   |
| `components/` | Plural     | `ProjectCard.tsx`, `TaskKanbanBoard.tsx`            |

---

## Route Map & Navigation Contract

### Application Routes

- `/` – Marketing Landing Page (swaps to _"Open Your Workspace"_ when authenticated).
- `/login` & `/register` – Authentication gateway with instant redirect to `/dashboard`.
- `/dashboard` – Centralized Personal Dashboard (Assigned to You, Needs Attention, Due This Week, Active Projects, Workload & Health).
- `/projects` – Global Projects Hub across all workspaces.
- `/tasks` – Global Tasks Hub with cascading workspace/project filters and pagination.
- `/workspaces` – Workspaces directory.
- `/workspaces/[workspaceId]/projects` – Workspace overview, metrics, and project cards.
- `/workspaces/[workspaceId]/projects/[projectId]/tasks` – Dual-mode Sprint Board (Kanban & Table).
- `/workspaces/[workspaceId]/projects/[projectId]/settings` – Project settings and Danger Zone.
- `/workspaces/[workspaceId]/settings` – Workspace membership, roles, and Danger Zone.
- `/profile` – User account preferences.

### Contextual Navigation

Views use query parameters (`?from=dashboard`, `?from=projects`, `?from=tasks`, `?from=workspaces`) to preserve origin context. Back buttons automatically resolve their label and route to prevent broken user journeys.

Task details are deep-linked via `?taskId=<id>`. Dismissing the drawer cleanses the query string while preserving origin query parameters without reloading.

---

## Available Scripts

Run from repository root using npm workspaces:

```bash
# Start Next.js development server with Turbopack (http://localhost:3000)
npm --workspace=web run dev

# Run TypeScript typecheck without emitting output
npm --workspace=web run typecheck

# Run ESLint validation
npm --workspace=web run lint

# Build production application bundle
npm --workspace=web run build

# Start production server
npm --workspace=web run start
```
