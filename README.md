# TrainingApp

A training programme app — running, swimming and strength — with an Angular frontend and a
Spring Boot backend.

```
front-end/   Angular 19 single-page app, deployed to GitHub Pages
back-end/    Spring Boot 4 API backed by PostgreSQL
docs/        Design docs and implementation plans
```

## Prerequisites

- **Node 20+** (developed against 24)
- **JDK 25** — the backend targets Java 25
- **PostgreSQL 16** running on `localhost:5432`, with two databases:

```sql
CREATE DATABASE training_app;
CREATE DATABASE training_app_test;
```

Maven does not need installing — the backend is driven through the Maven wrapper.

## Frontend

```bash
cd front-end
npm ci
npm start                                             # http://localhost:4200
npx ng test --watch=false --browsers=ChromeHeadless
npx ng build
```

In development `/api` and `/actuator` are proxied to `http://localhost:8080`, so there is no
CORS configuration to worry about locally. See `front-end/proxy.conf.json`.

Pushing to `master` deploys the frontend to GitHub Pages automatically.

## Backend

Database credentials are read from the environment and are never committed. `DB_PASSWORD` has
no default, so the application refuses to start without it.

```bash
export DB_USERNAME=postgres
export DB_PASSWORD='your password'

cd back-end
./mvnw spring-boot:run      # http://localhost:8080
./mvnw verify               # runs against the training_app_test database
```

In Windows PowerShell, use `$env:DB_PASSWORD = "..."` and `.\mvnw.cmd` instead.

Check it is alive:

```bash
curl http://localhost:8080/actuator/health
```

Health details are shown only under the `local` profile, which `spring-boot:run` activates.

### Configuration

| Variable | Default | Purpose |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/training_app` | Main database |
| `TEST_DB_URL` | `jdbc:postgresql://localhost:5432/training_app_test` | Test database |
| `DB_USERNAME` | `postgres` | |
| `DB_PASSWORD` | *none — required* | |

## Status

The backend is a foundation only: it boots, reaches Postgres and reports its health. It has no
business endpoints yet. The five planned increments are recorded in
`docs/superpowers/specs/2026-08-20-backend-foundation-design.md`.
