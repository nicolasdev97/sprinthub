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
- Manage members
- Assign roles
- Delete projects

### Project Management

- Create projects
- Update projects
- Archive projects

### Task Management

- Create tasks
- Assign users
- Set priorities
- Manage task status
- Due dates
- Delete tasks

### Dashboard

- Task statistics
- Project metrics
- Productivity overview
- Workspace overview

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

## Planned Architecture

### Backend

Controller → Service → Repository → Database

### Frontend

```
src/
├── app/
├── features/
├── components/
├── hooks/
├── services/
├── providers/
├── types/
└── utils/
```

---

## Security

Planned security features:

- JWT Authentication
- Refresh Token Rotation
- HttpOnly Cookies
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

Install → Lint → Test → Build → Docker Build

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
