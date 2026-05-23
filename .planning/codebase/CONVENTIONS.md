# Conventions

## Backend (Spring Boot)
- Package organization follows domain boundaries: `app`, `auth`, `user`, `security`, `config`, `common`.
- Controllers are annotated with `@RestController` and route under `/api/v1`.
  - Example: `splititup-backend/src/main/java/com/splititup/backend/app/controller/GroupController.java`.
- Services encapsulate business logic and use `@Service` + `@Transactional`.
  - Example: `splititup-backend/src/main/java/com/splititup/backend/app/service/AppCommandService.java`.
- Entities use JPA annotations and Lombok to reduce boilerplate.
  - Example: `splititup-backend/src/main/java/com/splititup/backend/app/entity/GroupEntity.java`.
- Repositories use Spring Data with derived query methods and `@EntityGraph`.
  - Example: `splititup-backend/src/main/java/com/splititup/backend/app/repository/ExpenseRepository.java`.
- Errors are raised via a custom runtime exception with HTTP status.
  - Example: `splititup-backend/src/main/java/com/splititup/backend/common/exception/AppException.java`.
- DTOs often use Java records for responses.
  - Example: `splititup-backend/src/main/java/com/splititup/backend/app/dto/AppStateResponse.java`.

## Frontend (React)
- Functional components with hooks; no class components detected.
- Context providers at app root for auth, theme, and toasts.
  - `splititup-frontend-v1/src/auth/AuthProvider.tsx`
  - `splititup-frontend-v1/src/theme/ThemeProvider.tsx`
- Routing centralized in `splititup-frontend-v1/src/App.tsx`.
- API access centralized in `splititup-frontend-v1/src/api/appApi.ts` and `.../auth/authApi.ts`.
- Styling uses utility-first class names and CSS variables.
  - Example: `splititup-frontend-v1/src/components/AppShell.tsx`.
- Animations use Framer Motion in page components.

## Linting and formatting
- ESLint configs in `splititup-frontend-v1/eslint.config.js` and `splititup-ui/eslint.config.js`.
- Prettier listed in `splititup-frontend-v1/package.json` but no explicit script.
