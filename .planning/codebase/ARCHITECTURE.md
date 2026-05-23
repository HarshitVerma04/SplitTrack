# Architecture

## High-level
- Monorepo with a Spring Boot backend and React frontends.
- Primary app is `splititup-frontend-v1` + `splititup-backend`.

## Backend architecture (Spring Boot)
- Package-by-domain layering:
  - `com.splititup.backend.app` for core expense/group domain.
  - `com.splititup.backend.auth` for auth and refresh tokens.
  - `com.splititup.backend.user` for user directory queries.
  - `com.splititup.backend.security` and `com.splititup.backend.config` for security.

Layered flow:
- HTTP -> Controller -> Service -> Repository -> Database.
- Controllers: `splititup-backend/src/main/java/com/splititup/backend/app/controller` and `.../auth/controller`.
- Services: `splititup-backend/src/main/java/com/splititup/backend/app/service` and `.../auth/service`.
- Repositories: `splititup-backend/src/main/java/com/splititup/backend/app/repository` and `.../auth/repository`.
- Entities: `splititup-backend/src/main/java/com/splititup/backend/app/entity` and `.../auth/entity`.

Key runtime entry:
- `splititup-backend/src/main/java/com/splititup/backend/SplitItUpBackendApplication.java`.

App state aggregation:
- Dashboard data is aggregated in `splititup-backend/src/main/java/com/splititup/backend/app/service/AppStateService.java`.

## Frontend architecture (React + Vite)
- Entry point: `splititup-frontend-v1/src/main.tsx`.
- Routing: `splititup-frontend-v1/src/App.tsx` with React Router.
- Layout shell: `splititup-frontend-v1/src/components/AppShell.tsx`.
- Data access:
  - Auth API: `splititup-frontend-v1/src/auth/authApi.ts`.
  - App API: `splititup-frontend-v1/src/api/appApi.ts`.
  - Live state hook: `splititup-frontend-v1/src/api/useLiveAppState.ts`.
- Shared providers:
  - Auth: `splititup-frontend-v1/src/auth/AuthProvider.tsx`.
  - Theme: `splititup-frontend-v1/src/theme/ThemeProvider.tsx`.
  - Toasts: `splititup-frontend-v1/src/ui/ToastProvider.tsx`.

## Secondary UI app
- `splititup-ui` is a separate Vite React app with its own entry point.
- Files under `splititup-ui/src` are not referenced by `splititup-frontend-v1`.
