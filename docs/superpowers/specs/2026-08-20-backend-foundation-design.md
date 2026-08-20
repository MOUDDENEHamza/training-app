# Backend Foundation — Design

## Purpose
The app has no server. Programme content lives in TypeScript files compiled into the bundle, and
tracking lives in one `localStorage` key in whichever browser happened to be used. That ceiling is
now the constraint: tracking cannot follow you from phone to desktop, the programme cannot be edited
without a commit and a deploy, nothing survives clearing the cache, and there is no notion of who
the data belongs to.

The chosen end state is a coach/athlete application: a coach writes programmes, athletes follow them
and record what they did. That is four distinct subsystems — authentication with roles, programme
storage and editing, persisted tracking, and history with statistics. This document specifies **only
the foundation all four sit on**, and deliberately contains no business behaviour at all.

## Scope: increment 0 of five
Agreed decomposition. Each increment gets its own design and plan.

| # | Increment | Depends on |
|---|---|---|
| **0** | **Foundation — repo restructuring, Spring Boot skeleton, Postgres, CI** | — |
| 1 | Auth and roles: hand-created coach/athlete accounts, login, role-based authorisation | 0 |
| 2 | Programme in the database: schema, the current `*.data.ts` as seed, read API, then coach editing | 1 |
| 3 | Persisted tracking: `TrackingService` calls the API, importing existing `localStorage` data | 1 |
| 4 | History and statistics: past sessions retained, progression computed server-side | 2, 3 |

Increment 0 succeeds when the backend boots, reaches Postgres, reports it, and is covered by a test
that runs in CI — while the deployed frontend stays byte-for-byte unchanged.

## Approach: two independent projects
Frontend and backend keep separate builds and separate deployments. The frontend continues to go to
GitHub Pages exactly as today; the backend will be deployed wherever hosting lands later. In
development an Angular proxy forwards to the backend, so CORS never comes up locally.

The alternative — packaging the built frontend into the backend jar — was rejected for this
increment because it takes the live app offline until a host is chosen. Nothing here prevents that
later; it is a packaging decision, not an architectural one.

## Repository restructuring

### Target layout
```
training-app/
├── front-end/            all of the current Angular project, moved verbatim
│   ├── src/  public/
│   ├── angular.json  proxy.conf.json
│   ├── package.json  package-lock.json
│   └── tsconfig.json  tsconfig.app.json  tsconfig.spec.json
├── back-end/
│   ├── mvnw  mvnw.cmd  .mvn/wrapper/
│   ├── pom.xml
│   └── src/main/java  src/main/resources  src/test/java  src/test/resources
├── docs/                 unchanged, covers both projects
├── .github/workflows/    updated
└── .editorconfig  .gitignore  README.md  .vscode/
```

`docs/`, `.github/`, `.editorconfig`, `.gitignore`, `.vscode/` and `README.md` stay at the root: they
describe the repository, not one project inside it.

### The move
`git mv` per entry, in a single commit containing no other change, so rename detection stays clean
and `git log --follow` keeps working across the 30 commits of history.

Every path inside `angular.json` and the `tsconfig` files is relative to the project directory
(`src`, `public`, `./tsconfig.json`, `dist/training-app`). Moving the whole block therefore requires
**no edit to any of those files**. This was verified against their current contents before writing
this design.

### What breaks, and the fix
This is the actual work of the restructuring.

| File | Breakage | Fix |
|---|---|---|
| `.github/workflows/deploy.yml` | `npm ci` and `ng build` run at the root, where there is no longer a `package.json`; `publish_dir` points at `./dist/…`; `setup-node`'s `cache: npm` looks for a lock file at the root and fails | `working-directory: front-end` on the npm steps, `cache-dependency-path: front-end/package-lock.json` on `setup-node`, and every `dist` path prefixed with `front-end/` |
| `.gitignore` | `/dist`, `/node_modules`, `/.angular/cache`, `/out-tsc`, `/tmp` are root-anchored and now ignore nothing | Re-prefix those entries with `front-end/`, and add `back-end/target/` |
| `.vscode/tasks.json` | The two `"type": "npm"` tasks look for `package.json` at the root | Add `"path": "front-end/"` to both |
| `.editorconfig` | `indent_size = 2` applies to every file, Java included | Add a `[*.java]` section with `indent_size = 4` |
| `README.md` | Describes a single Angular CLI project | Rewrite: two projects, how to run each, prerequisites |

`.vscode/launch.json` needs no change — it holds only URLs and references to task labels that are
not changing.

## The backend skeleton

### Build
| Choice | Value | Reason |
|---|---|---|
| Tool | Maven with the wrapper (`mvnw`) | The installed Maven is 3.5.3 (2018), below Spring Boot's 3.6.3 minimum. The wrapper fetches its own version, so nothing needs installing |
| Java | 25 | Required. `maven.compiler.release` set to 25 |
| Spring Boot | 4.0.x | The line that targets Java 25 natively. 3.5 also runs on 25 but is the final 3.x line, so a new project starting there begins in debt. The exact patch version is resolved from Maven Central when the `pom.xml` is generated, not guessed here |
| Root package | `com.trainingapp` | |

### Dependencies
`spring-boot-starter-web`, `spring-boot-starter-jdbc`, `spring-boot-starter-actuator`,
`spring-boot-starter-validation`, the `postgresql` driver, `flyway-core`,
`flyway-database-postgresql`, and `spring-boot-starter-test`.

**No JPA in this increment.** There is no business entity to map before increment 1's `users` table.
Flyway plus a `DataSource` already proves the database path end to end; adding the JPA starter later
costs three lines. Including it now would mean configuring Hibernate against a schema with no tables.

### Contents
Genuinely small, because this is infrastructure:

- `com.trainingapp.TrainingAppApplication` — the boot class, nothing else in it
- `src/main/resources/application.yml`
- `src/main/resources/db/migration/` with a `.gitkeep`, so the location exists on the classpath and
  Flyway does not warn about a missing one. **No `V1` migration**: there is nothing to create yet.
  Flyway is configured and runs; it simply finds nothing to apply
- `/actuator/health` with the database indicator — the visible proof that everything is wired

Running via `./mvnw spring-boot:run` activates the `local` profile, so the health response includes
its components during development.

No controller. Actuator provides the only endpoint this increment needs.

## Configuration
The database connection comes entirely from environment variables, with localhost defaults:

```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/training_app}
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD}
```

`DB_PASSWORD` has **no default on purpose**: an unset password fails startup immediately with a clear
message instead of producing a confusing authentication error later. No credential is ever committed.

Health detail exposure is `never` by default and `always` under the `local` profile. Increment 1
revisits this once authorisation exists, since an unauthenticated health endpoint that names the
database is not something to deploy.

## Front-to-back plumbing
`front-end/proxy.conf.json` forwards `/api` and `/actuator` to `http://localhost:8080`, wired into
`angular.json`'s serve target via `proxyConfig`. Backend controllers will live under `/api/**`
natively, so no path rewriting is needed, now or later.

**Revised from the discussion:** the per-environment API base URL is *not* part of this increment.
Production hosting is undecided, so any production URL written today would be a placeholder, and
nothing in the frontend calls the API yet. It belongs to increment 1, alongside the first real call
and the CORS configuration that call requires.

## Testing

| Level | Content |
|---|---|
| Backend | One `@SpringBootTest` with `@ActiveProfiles("test")` against a separate `training_app_test` database configured in `src/test/resources/application-test.yml`. It asserts the context loads, the `Flyway` bean is present (so migration ran without error), and `SELECT 1` succeeds through the `DataSource` |
| Frontend | The existing Karma suite must pass unchanged. It is the regression check on the move: any broken path surfaces here |

The test deliberately does **not** assert that `flyway_schema_history` exists. Whether Flyway creates
its history table when it finds zero migrations is not something this design verified, and a test
resting on it could fail for a reason unrelated to what it is meant to prove. If the table does turn
out to be created, the assertion can be tightened during implementation.

No Testcontainers: it requires Docker, which is not installed. Tests run against the local Postgres
instance on a dedicated database.

## Continuous integration
A new `.github/workflows/ci.yml` with one backend job: `actions/setup-java` for Temurin 25 with Maven
caching, then `./mvnw verify`. Postgres 16 is supplied as a GitHub Actions service container with a
`pg_isready` health check, which works in CI regardless of Docker being absent locally.

`deploy.yml` stays dedicated to the frontend, with its paths corrected as described above.

## Verification
Increment 0 is done when all of the following hold, each having been run and its output read:

```
cd back-end   && ./mvnw verify                       # test passes
cd back-end   && ./mvnw spring-boot:run              # then:
curl localhost:8080/actuator/health                  # {"status":"UP"}, db component UP
cd front-end  && npm ci && npm test && npx ng build  # unchanged from before the move
curl localhost:4200/actuator/health                  # through the Angular proxy, with ng serve up
```

Plus: `deploy.yml` re-read line by line against the new layout, and the GitHub Pages deploy observed
to succeed with the live site unchanged.

## Prerequisites (manual, outside the implementation)
1. **Install a JDK 25** — the machine currently has 21. Temurin is the assumed distribution
2. **Create the `training_app` and `training_app_test` databases** on the running Postgres 16.4
   instance, and set `DB_USERNAME` / `DB_PASSWORD` in the environment. These credentials need not be
   shared with anyone; the configuration only reads them

## Decisions recorded
- **Postgres over MongoDB.** MongoDB was the stronger technical fit for the programme data — three
  levels of nesting, always read as a whole, mapping 1:1 to the existing TypeScript interfaces — and
  Atlas would have removed the local-database question entirely. Postgres was chosen anyway. The
  accepted cost lands in increment 2: the programme must be decomposed into roughly six to eight
  tables plus code to reassemble the JSON the frontend already consumes. The benefit lands in
  increment 4, where progression and volume aggregates are far easier in SQL, and throughout in
  schema constraints that reject malformed data instead of storing it.
- **Two independent projects** rather than one artefact, so the deployed app never goes dark during
  the build-out.
- **No JPA, no Testcontainers, no `V1` migration, no API base URL** in this increment. Each is YAGNI
  until the increment that needs it.

## Out of scope
Everything with user-visible behaviour: login, roles, any endpoint under `/api`, CORS, moving
programme data out of TypeScript, touching `TrackingService`, and choosing a host. Increment 0 is
finished when the foundation is provably working and the app looks exactly as it did before.
