# Integrations

## Database
- PostgreSQL via JDBC driver `org.postgresql:postgresql`.
- Connection config in `splititup-backend/src/main/resources/application.yml`.
- Flyway migrations in `splititup-backend/src/main/resources/db/migration`.

## Authentication
- JWT tokens via `io.jsonwebtoken` (JJWT).
- Spring Security configuration in `splititup-backend/src/main/java/com/splititup/backend/config/SecurityConfig.java`.
- JWT settings in `splititup-backend/src/main/resources/application.yml`.

## Frontend to backend (local dev)
- Vite proxy routes `/api/v1` to backend.
- Proxy config in `splititup-frontend-v1/vite.config.ts` using `VITE_API_PROXY_TARGET`.

## CORS
- Allowed origins configured via `CORS_ALLOWED_ORIGINS` env var.
- Config in `splititup-backend/src/main/resources/application.yml`.

## External services
- No external OAuth providers, email/SMS services, or third-party APIs detected.
- No file storage or OCR services configured.

## Observed integrations not present
- No payment gateway or settlement provider integrations.
- No WebSocket or real-time messaging service configured.
