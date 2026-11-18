# Changelog

All notable changes to **SprintHub** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.1] - 2026-11-18

### Fixed
- **Mobile UI/UX Layouts:** Resolved toast notifications alignment, profile card dimensions, and modal background scroll locking on mobile touch viewports.
- **Guided Task Workflows:** Added disabled placeholders and guided prompts when creating tasks in workspaces with no existing projects, preventing stranded states.
- **Turbopack Build Compatibility:** Simplified Next.js variable font configurations to eliminate Turbopack bundling warnings and build errors.

### Documentation & Showcase
- **Test Suite Metrics:** Synchronized test count across the documentation to reflect all **119 passing tests** (51 API unit, 39 web unit, 24 API integration, 5 Playwright E2E).
- **Showcase & Recruiter Access:** Elevated live production demo URL (`https://sprinthub-omega.vercel.app`) and pre-seeded test credentials directly to the README header.
- **Visual System Architecture:** Integrated an opening high-level architecture diagram visualizing client, API, RBAC, SSE real-time sync, and PostgreSQL persistence.
- **Architecture Documentation Matrix:** Transformed technical specifications into a top-level showcase matrix with direct relative links to SAD, DDS, PRD, SRS, Blueprint, and all 10 ADRs.
- **Branch Governance Policy:** Formalized branch preservation notice explaining why all working branches remain accessible for technical evaluation.

---

## [1.0.0] - 2026-10-28

### Added
- **Modular Monolith Backend:** Production REST API built with Node.js 22, Express 5, TypeScript, and Prisma ORM 6.
- **Feature-Based Frontend:** Next.js 15 App Router with React 19, Tailwind CSS v4, shadcn/ui, and TanStack Query v5.
- **Authentication & RBAC:** Cryptographic password hashing (`bcrypt`), stateless JWT access tokens, and `HttpOnly` refresh token cookies with contextual workspace roles (`OWNER`, `ADMIN`, `MEMBER`).
- **Core Domain Workflows:** Complete lifecycle for multi-tenant Workspaces, Projects (with search and status filters), and Tasks (interactive Kanban board and list views).
- **Real-Time Synchronization:** Server-Sent Events (SSE) event pipeline combined with cross-tab `BroadcastChannel` coordination.
- **API Documentation:** OpenAPI 3.0 specification natively served with interactive Swagger UI explorer at `/api/docs`.
- **Automated Testing Suite:** 119 automated tests across unit (Vitest, Jest), database integration (Supertest on PostgreSQL), and browser journeys (Playwright).
- **DevOps & CI/CD:** Multi-stage Docker containerization, Docker Compose orchestration, and GitHub Actions CI pipelines with branch protection governance.
