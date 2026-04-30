# Integrations

## Database
- PostgreSQL via JDBC driver `org.postgresql:postgresql`.
- Connection config in `splittrack-backend/src/main/resources/application.yml`.
- Flyway migrations in `splittrack-backend/src/main/resources/db/migration`.

## Authentication
- JWT tokens via `io.jsonwebtoken` (JJWT).
- Spring Security configuration in `splittrack-backend/src/main/java/com/splittrack/backend/config/SecurityConfig.java`.
- JWT settings in `splittrack-backend/src/main/resources/application.yml`.

## Frontend to backend (local dev)
- Vite proxy routes `/api/v1` to backend.
- Proxy config in `splittrack-frontend-v1/vite.config.ts` using `VITE_API_PROXY_TARGET`.

## CORS
- Allowed origins configured via `CORS_ALLOWED_ORIGINS` env var.
- Config in `splittrack-backend/src/main/resources/application.yml`.

## External services
- No external OAuth providers, email/SMS services, or third-party APIs detected.
- No file storage or OCR services configured.

## Observed integrations not present
- No payment gateway or settlement provider integrations.
- No WebSocket or real-time messaging service configured.
