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
- `splititup-backend/pom.xml`
- `splititup-backend/src/main/java/com/splititup/backend/SplitItUpBackendApplication.java`
- `splititup-backend/src/main/resources/application.yml`

## Frontend (primary)
- App: `splititup-frontend-v1`.
- Frameworks: React 19, React Router 7, Vite 8.
- Language: TypeScript 5.9.
- UI: Tailwind CSS v4 (via PostCSS), Framer Motion, Lucide React.

Key files:
- `splititup-frontend-v1/package.json`
- `splititup-frontend-v1/vite.config.ts`
- `splititup-frontend-v1/src/main.tsx`
- `splititup-frontend-v1/src/App.tsx`

## Frontend (secondary)
- App: `splititup-ui`.
- Frameworks: React 19, Vite 8, TypeScript 5.9.

Key files:
- `splititup-ui/package.json`
- `splititup-ui/vite.config.ts`
- `splititup-ui/src/main.tsx`

## Tooling
- Linting: ESLint config in both frontends.
- Formatting: Prettier listed in `splititup-frontend-v1/package.json`.
- Root `package.json` contains only `lucide-react` dependency.

## Build and run
- Backend: `mvn spring-boot:run` from `splititup-backend`.
- Frontend: `npm run dev` from `splititup-frontend-v1`.
- Backend tests: `mvn test` from `splititup-backend`.
- Frontend checks: `npm run lint`, `npm run build` from `splititup-frontend-v1`.
