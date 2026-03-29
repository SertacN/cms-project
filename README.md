# CMS Project

[Turkce](docs/README.tr.md)

**Live:** [cms-project.sertaccan.com](https://cms-project.sertaccan.com)

> 🚧 **In Progress** — Under active development.

## Remaining
- Media (file upload and listing for content)
- Settings
- User Details
- Dashboard Live Data
- i18n Integration

A content management system built with NestJS + Angular 21.
Originally created to manage content for my portfolio site.

## Future Goals
After the CMS is complete, additional modules such as ERP and CRM will be added.
Note: This repo will only contain the CMS codebase. Other modules will be showcased via a live demo site.
Development progress will be documented in this README.

### Architectural Migration
Before adding new modules, the project architecture will be migrated to a Modular Monolith structure.
Example:
```
src/auth/                  →  src/identity/auth/
src/contents/              →  src/cms/
src/common/guards/         →  src/_kernel/guards/
src/prisma/                →  src/_infra/prisma/
```

### Event Bus (BullMQ)
- BullMQ will be integrated as the message queue service since Redis is already in place (fully compatible with NestJS)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 11, TypeScript |
| Frontend | Angular 21, Angular Material |
| Database | PostgreSQL 16 (Prisma ORM) |
| Cache | Redis 7 (cache-manager + @keyv/redis) |
| Auth | Express-session + JWT (access + refresh token) |
| Deploy | Docker, Traefik v3, GitHub Actions |

---

## Backend (NestJS)

### Architecture
- Global prefix: `/api` — all endpoints start with `/api/...`
- Prisma multi-file schema: `api/prisma/schema/` directory, configured via `prisma.config.ts`
- Winston logger + daily rotate file
- Swagger UI: `/api/docs` (non-production only)

### Auth
- Session-based (`express-session`), cookie `httpOnly: true`
- JWT access token (15min) + refresh token (7 days) pair
- Refresh token stored hashed in the database
- Endpoints protected with `JwtGuard`

### Cache (Redis)
- `@nestjs/cache-manager` + `@keyv/redis` adapter
- TTL: `CACHE_TTL` env variable (default 30min)
- Manual clear: `DELETE /api/settings/cache/clear`

### Rate Limiting
- Global rate limiting via `@nestjs/throttler`
- Protects auth endpoints against brute-force attacks

### File Upload
- File upload via Multer
- `uploads/` named volume — persistent across container restarts

---

## Frontend (Angular 21)

### Architecture
- Angular Material + CDK
- Signal-based state management (services)
- Lazy loading with route-based code splitting
- File generation via Angular CLI (`ng`)

### State Management — Signal vs Observable

Rules for when to use `signal` vs `Observable` in services:

| Method | Type | Approach |
|--------|------|----------|
| `loadCategories()` | Shared list state | Signal ✅ |
| `getCategoryDetails()` | One-time fetch (on dialog open) | Observable ✅ |
| `createCategory()` | Mutation | Observable ✅ |
| `editCategory()` | Mutation | Observable ✅ |
| `deleteCategory()` | Mutation | Observable ✅ |

**Rule:**
- Data read by multiple components, changing over time, persistent → **Signal**
- Triggered by a user action, one-time, transient result → **Observable**

Mutation methods (`create`, `edit`, `delete`) return Observables. The caller handles the result with `subscribe({ next, error })`, then triggers `loadCategories()` to update the actual state.

### Environment
Angular uses build-time environments (`environments/` directory). `.env` is not supported (browser runtime).
- `environment.ts` → production config, not in git
- `environment.development.ts` → dev config, not in git
- Reference: `environment.ts.example`

### Forms
- Simple forms without complex validation → FormField signal model (Login page)
- Other form operations → FormsModule (Dialog components)
- Reason: The Material library used for Dialog, Input, etc. is not yet compatible with the new FormField API. Instead of writing extra validation methods, FormField (signal-based) is used for simple forms and FormsModule for the rest.

---

## AI Preference (Claude Code)
### Use Cases
- i18n translations
- Generating commit messages
- Testing
- Refactoring (improving internal structure without changing external behavior)

---

### API Endpoint Testing
- Insomnia

### Database Management
- DBeaver
- Occasionally Prisma Studio (primarily used early in the project)

---

## Development Environment (Local)

### Requirements
- Docker Desktop

### Getting Started
```bash
docker compose -f docker-compose.dev.yml up --build
```

Services:
- `localhost:4200` → Angular (hot-reload)
- `localhost:3000/api` → NestJS (watch mode)
- `localhost:5432` → PostgreSQL
- `localhost:6379` → Redis

### Migration Workflow
```bash
# 1. Generate diff after schema changes
docker exec cms_project_api npx prisma migrate diff \
  --from-config-datasource \
  --to-schema prisma/schema \
  --script

# 2. Save the SQL to api/prisma/migrations/<timestamp>_<name>/migration.sql

# 3. Apply
docker exec cms_project_api npx prisma migrate deploy

# 4. Regenerate client (Docker + local)
docker exec cms_project_api npx prisma generate
cd api && npx prisma generate
```

---

## Production Deploy

### Infrastructure
- Traefik v3 reverse proxy + Let's Encrypt SSL (automatic)
- Services exposed to Traefik via `traefik-net` external network
- Services communicate internally via `cms-internal` bridge network

### CI/CD (GitHub Actions)
Push to `main` branch → automatic deploy:
1. SSH into VPS
2. `git pull origin main`
3. `docker compose --env-file api/.env up -d --build`
4. `docker exec cms_project_api npx prisma migrate deploy`
5. `docker image prune -f`

### Required GitHub Secrets
| Secret | Description |
|--------|------------|
| `VPS_HOST` | VPS IP address |
| `VPS_SSH_KEY` | Private SSH key |

---

## Commands

```bash
# API
cd api
npm run start:dev      # watch mode
npm run build          # production build
npm run lint           # eslint fix
npx prisma studio      # DB GUI (requires DATABASE_URL=localhost)

# Client
cd client
npm start              # ng serve
npm run build          # production build
```
