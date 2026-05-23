# Repository Structure

## Top-level
- `splititup-backend/` - Spring Boot backend.
- `splititup-frontend-v1/` - Primary React frontend.
- `splititup-ui/` - Secondary React frontend.
- `splititup-web/` - Placeholder directory.
- `stitch/` - Design/prototype artifacts.
- `plan.md` - Product requirements document.
- `README.md` - Local run instructions.

## Backend layout
- `splititup-backend/src/main/java/com/splititup/backend/`
  - `app/` - Core domain (groups, expenses, settlements).
  - `auth/` - Auth, users, refresh tokens.
  - `user/` - User directory queries.
  - `security/` - JWT filter and service.
  - `config/` - Spring Security config and JWT properties.
  - `common/` - Shared exception and security utilities.
- `splititup-backend/src/main/resources/`
  - `application.yml` - Config and env vars.
  - `db/migration/` - Flyway SQL migrations.
- `splititup-backend/src/test/java/com/splititup/backend/`
  - `SplitItUpBackendApplicationTests.java`.

## Frontend layout (primary)
- `splititup-frontend-v1/src/`
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
- `splititup-ui/src/`
  - `App.tsx`, `main.tsx`, `App.css`.

## Build artifacts
- `splititup-backend/target/` - Maven outputs.
- `splititup-frontend-v1/dist/` - Vite build output.
- `splititup-ui/dist/` - Vite build output.
