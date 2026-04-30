# Codebase Stack

## Overview
- Monorepo with a Spring Boot backend and two Vite React frontends.
- Primary runtimes: Java 23 (backend) and Node.js 20+ (frontend).
- Build tools: Maven, Vite, TypeScript, ESLint, Prettier.

## Backend
- Framework: Spring Boot 3.4.4.
- Key starters: web, validation, security, data-jpa.
- Database: PostgreSQL with Flyway migrations.
- Auth: JWT via JJWT.
- ORM: Hibernate via Spring Data JPA.
- Codegen: Lombok.

Key files:
- `splittrack-backend/pom.xml`
- `splittrack-backend/src/main/java/com/splittrack/backend/SplittrackBackendApplication.java`
- `splittrack-backend/src/main/resources/application.yml`

## Frontend (primary)
- App: `splittrack-frontend-v1`.
- Frameworks: React 19, React Router 7, Vite 8.
- Language: TypeScript 5.9.
- UI: Tailwind CSS v4 (via PostCSS), Framer Motion, Lucide React.

Key files:
- `splittrack-frontend-v1/package.json`
- `splittrack-frontend-v1/vite.config.ts`
- `splittrack-frontend-v1/src/main.tsx`
- `splittrack-frontend-v1/src/App.tsx`

## Frontend (secondary)
- App: `splittrack-ui`.
- Frameworks: React 19, Vite 8, TypeScript 5.9.

Key files:
- `splittrack-ui/package.json`
- `splittrack-ui/vite.config.ts`
- `splittrack-ui/src/main.tsx`

## Tooling
- Linting: ESLint config in both frontends.
- Formatting: Prettier listed in `splittrack-frontend-v1/package.json`.
- Root `package.json` contains only `lucide-react` dependency.

## Build and run
- Backend: `mvn spring-boot:run` from `splittrack-backend`.
- Frontend: `npm run dev` from `splittrack-frontend-v1`.
- Backend tests: `mvn test` from `splittrack-backend`.
- Frontend checks: `npm run lint`, `npm run build` from `splittrack-frontend-v1`.
