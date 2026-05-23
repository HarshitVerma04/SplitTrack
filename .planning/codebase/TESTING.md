# Testing

## Backend
- Test framework: JUnit 5 with Spring Boot test support.
- Only a basic context load test is present.
  - `splititup-backend/src/test/java/com/splititup/backend/SplitItUpBackendApplicationTests.java`.
- Test profile is enabled via `@ActiveProfiles("test")`.
- H2 is included as a test dependency in `splititup-backend/pom.xml`.

## Frontend (primary)
- No test framework or test scripts detected in `splititup-frontend-v1/package.json`.
- No `__tests__` or `*.test.*` files observed in `splititup-frontend-v1/src`.

## Frontend (secondary)
- No test framework or test scripts detected in `splititup-ui/package.json`.

## CI and automation
- No CI workflow files found under `.github/workflows`.

## Manual checks in README
- Backend tests are documented as `mvn test` in `README.md`.
- Frontend checks are documented as `npm run lint` and `npm run build` in `README.md`.

## Gaps
- No automated API tests or repository-level unit tests are visible.
- No browser or component tests for the frontend apps.
