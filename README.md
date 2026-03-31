# SplitTrack Monorepo

SplitTrack is a full-stack expense sharing application workspace with a Spring Boot backend and React frontend.

## Project Layout

- `splittrack-backend/`: Java backend (Spring Boot, JPA, Flyway, PostgreSQL)
- `splittrack-frontend-v1/`: Primary React frontend (Vite + TypeScript)
- `splittrack-ui/`: Additional UI workspace
- `splittrack-web/`: Web workspace placeholder
- `stitch/`: Design/prototype artifacts

## Tech Stack

### Backend

- Java 23
- Maven 3.9+ (project also works with Maven 4)
- Spring Boot 3.4.4
- PostgreSQL JDBC 42.7.10
- Flyway migrations

### Frontend

- Node.js 20+ recommended
- React 19
- Vite 8
- TypeScript 5

## Prerequisites

Install and verify:

- Java 23
- Maven (or Maven Wrapper if added later)
- Node.js + npm
- PostgreSQL running locally

## Backend Setup

Path: `splittrack-backend/`

### 1. Database

Create a PostgreSQL database named `splittrack`.

Default connection values in backend config:

- DB URL: `jdbc:postgresql://localhost:5432/splittrack`
- DB username: `postgres`
- DB password: `postgres`

### 2. Environment Variables (optional overrides)

You can set these before starting the backend:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `SERVER_PORT` (default `8080`)
- `JWT_SECRET`
- `JWT_ACCESS_MINUTES`
- `JWT_REFRESH_DAYS`

### 3. Run Backend

From `splittrack-backend/`:

```powershell
mvn spring-boot:run
```

If you need a clean build and no process is locking `target/`:

```powershell
mvn clean spring-boot:run
```

Backend default URL:

- `http://localhost:8080`

## Frontend Setup

Path: `splittrack-frontend-v1/`

### 1. Install dependencies

```powershell
npm install
```

### 2. Configure API base URL (optional)

Frontend defaults to:

- `http://localhost:8080/api/v1`

To override, set:

- `VITE_API_BASE_URL`

### 3. Run Frontend

```powershell
npm run dev
```

Vite will print the local URL (typically `http://localhost:5173`).

## Run Full Stack Locally

Open two terminals:

Terminal 1:

```powershell
cd splittrack-backend
mvn spring-boot:run
```

Terminal 2:

```powershell
cd splittrack-frontend-v1
npm install
npm run dev
```

## Testing

### Backend tests

From `splittrack-backend/`:

```powershell
mvn test
```

### Frontend checks

From `splittrack-frontend-v1/`:

```powershell
npm run lint
npm run build
```

## Notes

- Backend runs Flyway migrations at startup.
- If startup fails, first verify PostgreSQL is reachable and credentials are correct.
- If frontend cannot reach backend, verify `VITE_API_BASE_URL` and backend port.
