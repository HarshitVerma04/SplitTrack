# Architecture

## High-level
- Monorepo with a Spring Boot backend and React frontends.
- Primary app is `splittrack-frontend-v1` + `splittrack-backend`.

## Backend architecture (Spring Boot)
- Package-by-domain layering:
  - `com.splittrack.backend.app` for core expense/group domain.
  - `com.splittrack.backend.auth` for auth and refresh tokens.
  - `com.splittrack.backend.user` for user directory queries.
  - `com.splittrack.backend.security` and `com.splittrack.backend.config` for security.

Layered flow:
- HTTP -> Controller -> Service -> Repository -> Database.
- Controllers: `splittrack-backend/src/main/java/com/splittrack/backend/app/controller` and `.../auth/controller`.
- Services: `splittrack-backend/src/main/java/com/splittrack/backend/app/service` and `.../auth/service`.
- Repositories: `splittrack-backend/src/main/java/com/splittrack/backend/app/repository` and `.../auth/repository`.
- Entities: `splittrack-backend/src/main/java/com/splittrack/backend/app/entity` and `.../auth/entity`.

Key runtime entry:
- `splittrack-backend/src/main/java/com/splittrack/backend/SplittrackBackendApplication.java`.

App state aggregation:
- Dashboard data is aggregated in `splittrack-backend/src/main/java/com/splittrack/backend/app/service/AppStateService.java`.

## Frontend architecture (React + Vite)
- Entry point: `splittrack-frontend-v1/src/main.tsx`.
- Routing: `splittrack-frontend-v1/src/App.tsx` with React Router.
- Layout shell: `splittrack-frontend-v1/src/components/AppShell.tsx`.
- Data access:
  - Auth API: `splittrack-frontend-v1/src/auth/authApi.ts`.
  - App API: `splittrack-frontend-v1/src/api/appApi.ts`.
  - Live state hook: `splittrack-frontend-v1/src/api/useLiveAppState.ts`.
- Shared providers:
  - Auth: `splittrack-frontend-v1/src/auth/AuthProvider.tsx`.
  - Theme: `splittrack-frontend-v1/src/theme/ThemeProvider.tsx`.
  - Toasts: `splittrack-frontend-v1/src/ui/ToastProvider.tsx`.

## Secondary UI app
- `splittrack-ui` is a separate Vite React app with its own entry point.
- Files under `splittrack-ui/src` are not referenced by `splittrack-frontend-v1`.
