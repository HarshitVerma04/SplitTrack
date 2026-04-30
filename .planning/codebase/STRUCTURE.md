# Repository Structure

## Top-level
- `splittrack-backend/` - Spring Boot backend.
- `splittrack-frontend-v1/` - Primary React frontend.
- `splittrack-ui/` - Secondary React frontend.
- `splittrack-web/` - Placeholder directory.
- `stitch/` - Design/prototype artifacts.
- `plan.md` - Product requirements document.
- `README.md` - Local run instructions.

## Backend layout
- `splittrack-backend/src/main/java/com/splittrack/backend/`
  - `app/` - Core domain (groups, expenses, settlements).
  - `auth/` - Auth, users, refresh tokens.
  - `user/` - User directory queries.
  - `security/` - JWT filter and service.
  - `config/` - Spring Security config and JWT properties.
  - `common/` - Shared exception and security utilities.
- `splittrack-backend/src/main/resources/`
  - `application.yml` - Config and env vars.
  - `db/migration/` - Flyway SQL migrations.
- `splittrack-backend/src/test/java/com/splittrack/backend/`
  - `SplittrackBackendApplicationTests.java`.

## Frontend layout (primary)
- `splittrack-frontend-v1/src/`
  - `App.tsx`, `main.tsx` - entry and routes.
  - `pages/` - page-level screens.
  - `components/` - shared UI components.
  - `api/` - API clients and live state hook.
  - `auth/` - auth context and API.
  - `ui/` - UI utilities (toasts).
  - `theme/` - theme provider.
  - `hooks/` - custom hooks.
  - `data/` - static data.

## Frontend layout (secondary)
- `splittrack-ui/src/`
  - `App.tsx`, `main.tsx`, `App.css`.

## Build artifacts
- `splittrack-backend/target/` - Maven outputs.
- `splittrack-frontend-v1/dist/` - Vite build output.
- `splittrack-ui/dist/` - Vite build output.
