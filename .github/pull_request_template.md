## 📌 Description

<!-- Provide a clear and concise summary of the changes introduced in this PR. -->

## 🔗 Related Issues

<!-- Link the corresponding issue (e.g. Closes #123, Fixes #456, Ref #789) -->

- Closes #

## 🏷️ Type of Change

- [ ] `feat`: New feature
- [ ] `fix`: Bug fix
- [ ] `refactor`: Code refactoring without functional changes
- [ ] `test`: Test addition or update
- [ ] `docs`: Documentation addition or modification
- [ ] `ci`: CI/CD pipeline or workflow changes
- [ ] `build` / `chore`: Dependency, npm scripts, or Docker tasks
- [ ] `perf`: Performance improvement

## 📦 Affected Workspaces

- [ ] `apps/api` (Backend Express 5 + Prisma)
- [ ] `apps/web` (Frontend Next.js 16 + React 19)
- [ ] `root` / Infrastructure (CI/CD, Docker Compose, scripts)
- [ ] `docs` (Architecture, specifications, guides)

---

## ✅ Author Checklist

Please ensure all of the following requirements are met before requesting a review:

- [ ] **Linting**: `npm run lint` passes without warnings or errors across all workspaces.
- [ ] **Formatting**: `npm run format:check` verifies Prettier code style.
- [ ] **Typecheck**: `npm run typecheck` (`tsc --noEmit`) passes with 0 typing errors.
- [ ] **Unit Tests**: `npm run test:unit` passes 100% across backend and frontend.
- [ ] **OpenAPI Documentation**: `npm run docs:validate` was run if endpoints were added or modified in `apps/api`.
- [ ] **Environment Variables**: New variables are documented in the respective `.env.example` files.
- [ ] **Security**: No credentials, secrets, API keys, or sensitive files (`.env`) are committed.
- [ ] **Build**: `npm run build` compiles successfully for production with 0 errors.

---

## 🧪 Local Testing Instructions

<!-- Detailed steps for the reviewer to test and verify these changes locally. -->

1.
2.
3.

## 📸 Evidence / Screenshots (if applicable)

<!-- Attach relevant screenshots, terminal outputs, or API response payloads. -->
