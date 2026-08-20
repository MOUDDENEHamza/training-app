# Backend Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the repository into `front-end/` and `back-end/`, and stand up a Spring Boot backend that boots, reaches Postgres, and is verified by a test running in CI — with the deployed frontend unchanged.

**Architecture:** Two independent projects with separate builds and deployments. The Angular project moves wholesale into `front-end/` and keeps going to GitHub Pages; a new Maven project in `back-end/` holds a Spring Boot application whose only endpoint is Actuator's health check. In development an Angular proxy forwards `/api` and `/actuator` to `localhost:8080`, so CORS never arises. This increment contains no business behaviour whatsoever.

**Tech Stack:** Java 25, Spring Boot 4.0.7, Maven (via the wrapper), PostgreSQL 16, Flyway, JUnit 5 + AssertJ. Frontend unchanged: Angular 19, Jasmine + Karma.

**Spec:** `docs/superpowers/specs/2026-08-20-backend-foundation-design.md`

## Global Constraints

- **Run every command block in Git Bash**, which is available on this machine. This is why the blocks use `&&`, `rm -rf`, `mkdir -p`, `touch`, `unzip` and backslash line continuations — none of which work in Windows PowerShell 5.1.
- **Invoke Maven as `./mvnw`**, the same as CI. The `mvn` on PATH is 3.5.3 (2018), below Spring Boot's minimum, and must never be used. If `./mvnw` reports a permission error, use `sh ./mvnw` and fix the file mode.
- **Java 25** exactly. `back-end/pom.xml` sets `<java.version>25</java.version>`.
- **Spring Boot 4.0.7.** Verified on 2026-08-20 as an available stable release on Maven Central and offered by Spring Initializr. Initializr's only other stable option is 4.1.0; the 3.5 line is no longer offered at all.
- **Root Java package: `com.trainingapp`.**
- **`psql` is not on PATH.** In Git Bash: `"/c/Program Files/PostgreSQL/16/bin/psql.exe"`.
- **Postgres runs locally already**: service `postgresql-x64-16`, version 16.4, `localhost:5432`.
- **No Docker on this machine** — therefore no Testcontainers, no Docker Compose. Tests hit the local Postgres on a dedicated database.
- **No credential is ever committed.** `DB_PASSWORD` has no default in configuration, so an unset password fails startup loudly.
- **Not in this increment** (YAGNI per the spec): JPA/Hibernate, any `V1` migration, any controller, any endpoint under `/api`, CORS, the per-environment API base URL, host selection.
- **Frontend test command:** `npx ng test --watch=false --browsers=ChromeHeadless`, run from `front-end/`.
- **Frontend baseline is green: 95 specs pass.** Measured on 2026-08-20 before this plan starts. Any task that changes this count has broken something.
- **Commit messages follow this repository's existing style:** a plain imperative English sentence, no `feat:`/`chore:` prefixes. Compare `git log`.
- **Work on branch `feature/backend-foundation`** off `master`.

---

### Task 1: Move the Angular project into `front-end/`

Moving the files is the easy half. Every path inside `angular.json` and the `tsconfig` files is relative to the project directory, so none of them need editing — but four files outside the project hardcode root-relative paths and will silently break.

**Files:**
- Move: `src/`, `public/`, `angular.json`, `package.json`, `package-lock.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json` → under `front-end/`
- Modify: `.gitignore`, `.vscode/tasks.json`, `.editorconfig`, `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: nothing.
- Produces: the `front-end/` directory that every later frontend command runs inside. `back-end/target/` is added to `.gitignore` here so Task 2 does not commit build output.

- [ ] **Step 1: Create the branch**

```bash
git checkout -b feature/backend-foundation
```

- [ ] **Step 2: Confirm the baseline before touching anything**

```bash
npm ci --no-audit --no-fund
npx ng test --watch=false --browsers=ChromeHeadless
```

Expected: `TOTAL: 95 SUCCESS`. If it is not 95, stop and report — the baseline in this plan is wrong, and later tasks would not be able to tell breakage from drift.

- [ ] **Step 3: Remove build artefacts that would end up in the wrong place**

`node_modules/` and `.angular/` are untracked and now belong under `front-end/`. Delete rather than move, so Step 8 proves `npm ci` works from the new location.

```bash
rm -rf node_modules .angular dist
```

- [ ] **Step 4: Move the project, and nothing else**

```bash
mkdir front-end
git mv src public angular.json package.json package-lock.json \
       tsconfig.json tsconfig.app.json tsconfig.spec.json front-end/
git status --short
```

Expected: only renames, covering exactly those eight paths. Nothing else may appear.

- [ ] **Step 5: Commit the move on its own**

A move with no other change keeps rename detection clean, so `git log --follow` keeps working across the repository's history.

```bash
git commit -m "Move the Angular project into front-end/"
```

- [ ] **Step 6: Repoint `.gitignore`**

The Angular entries are root-anchored with a leading `/` and now ignore nothing. Replace the whole file with:

```gitignore
# See https://docs.github.com/get-started/getting-started-with-git/ignoring-files for more about ignoring files.

# Angular build output
front-end/dist
front-end/tmp
front-end/out-tsc
front-end/.angular/cache
front-end/coverage

# Node
front-end/node_modules
npm-debug.log
yarn-error.log

# Java build output
back-end/target

# IDEs and editors
.idea/
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# Visual Studio Code
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
.history/*

# Miscellaneous
.sass-cache/
/connect.lock
/libpeerconnection.log
testem.log
/typings

# System files
.DS_Store
Thumbs.db
```

Two deliberate differences from the old file: `/bazel-out` is dropped, since this project has never used Bazel, and `back-end/target` is added ahead of Task 2. The Eclipse entries (`.project`, `.classpath`, `.settings/`) are kept — they become relevant now that there is a Java project.

- [ ] **Step 7: Add `"path"` to both npm tasks in `.vscode/tasks.json`**

Both tasks are `"type": "npm"` and look for `package.json` at the repository root. Add a `"path"` line immediately after each `"script"` line, so they read:

```json
      "type": "npm",
      "script": "start",
      "path": "front-end/",
```

```json
      "type": "npm",
      "script": "test",
      "path": "front-end/",
```

The trailing slash is required.

- [ ] **Step 8: Give Java its own indentation in `.editorconfig`**

The `[*]` section imposes `indent_size = 2` on every file, Java included. Append:

```ini
[*.java]
indent_size = 4
```

- [ ] **Step 9: Repoint `.github/workflows/deploy.yml`**

Replace the whole file:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: pages-deploy
  cancel-in-progress: true

defaults:
  run:
    working-directory: front-end

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: front-end/package-lock.json

      - run: npm ci

      - run: npx ng build --configuration production --base-href /training-app/

      - name: Add SPA 404 fallback
        run: cp dist/training-app/browser/index.html dist/training-app/browser/404.html

      - name: Disable Jekyll processing
        run: touch dist/training-app/browser/.nojekyll

      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./front-end/dist/training-app/browser
```

Three changes, and why each is needed — the distinction matters and is easy to get wrong:

1. `defaults.run.working-directory: front-end` makes the `run` steps execute inside the project. It applies **only to `run` steps**, never to `uses` steps.
2. `cache-dependency-path: front-end/package-lock.json` — `setup-node` is a `uses` step, so it ignores the default above; without this it looks for a lock file at the root and the step fails. The path is relative to the repository root.
3. `publish_dir: ./front-end/dist/...` — also a `uses` step, so it needs the full path from the repository root. The `cp` and `touch` paths stay relative, because those *are* `run` steps.

- [ ] **Step 10: Verify the frontend behaves exactly as before**

```bash
cd front-end
npm ci --no-audit --no-fund
npx ng test --watch=false --browsers=ChromeHeadless
npx ng build --configuration production --base-href /training-app/
ls dist/training-app/browser/index.html
```

Expected: `TOTAL: 95 SUCCESS`, and `index.html` present. Confirm both before continuing.

- [ ] **Step 11: Re-read the workflow against the new layout**

Read `.github/workflows/deploy.yml` line by line and confirm every path either sits in a `run` step (relative to `front-end`) or is a `uses` input (relative to the repository root). No local command can verify this file, so reading it is the verification.

- [ ] **Step 12: Commit**

```bash
git add .gitignore .vscode/tasks.json .editorconfig .github/workflows/deploy.yml
git commit -m "Point the build, editor and CI config at front-end/"
```

`README.md` is deliberately left stale until Task 6, where it can describe the finished shape once instead of being rewritten twice.

---

### Task 2: Generate the Spring Boot skeleton

Generated from Spring Initializr rather than hand-written, so the `pom.xml`, the Maven wrapper and the layout are all correct for Spring Boot 4.0.7 without guesswork.

**Files:**
- Create: `back-end/pom.xml`, `back-end/mvnw`, `back-end/mvnw.cmd`, `back-end/.mvn/wrapper/maven-wrapper.properties`, `back-end/src/main/java/com/trainingapp/TrainingAppApplication.java`
- Create: `.gitattributes`
- Delete: `back-end/src/test/java/com/trainingapp/TrainingAppApplicationTests.java`, `back-end/src/main/resources/application.properties`

**Interfaces:**
- Consumes: `.gitignore` from Task 1, so `back-end/target` is ignored.
- Produces: `com.trainingapp.TrainingAppApplication`, the `@SpringBootApplication` class that Task 3's `@SpringBootTest` loads. A buildable Maven project rooted at `back-end/`, driven by `./mvnw`.

- [ ] **Step 1: Confirm a JDK 25 is installed**

A prerequisite that cannot be skipped — the machine shipped with Java 21.

```bash
java -version
```

Expected: a version starting with `25`. If it reports 21, stop: install a JDK 25 (Temurin), make it the active JDK, and resume. Nothing else in this task can work otherwise.

- [ ] **Step 2: Generate the project**

From the repository root:

```bash
curl -sS https://start.spring.io/starter.zip \
  -d type=maven-project \
  -d language=java \
  -d bootVersion=4.0.7 \
  -d javaVersion=25 \
  -d groupId=com.trainingapp \
  -d artifactId=back-end \
  -d name=training-app \
  -d packageName=com.trainingapp \
  -d description="Training programme backend" \
  -d dependencies=web,jdbc,actuator,validation,postgresql,flyway \
  -d baseDir=back-end \
  -o back-end.zip
unzip -q back-end.zip && rm back-end.zip
```

All six dependency ids were confirmed present in Initializr's metadata on 2026-08-20. `name=training-app` is what makes the main class `TrainingAppApplication`; `baseDir=back-end` is what makes the archive unpack into `back-end/`.

- [ ] **Step 3: Check what was actually generated**

```bash
ls back-end
grep -E "java.version|<version>4\.0\.7|artifactId" back-end/pom.xml
```

Expected: `mvnw`, `mvnw.cmd`, `.mvn/`, `pom.xml`, `src/` present. In the POM: `<java.version>25</java.version>`, the parent at `4.0.7`, and artifacts for `spring-boot-starter-web`, `-jdbc`, `-actuator`, `-validation`, plus `postgresql` and `flyway-core`.

If the parent version is not 4.0.7, the `bootVersion` value was rejected — retry with `-d bootVersion=4.0.7.RELEASE`, which is the form Initializr's own metadata uses.

- [ ] **Step 4: Remove the two generated placeholders**

The generated test is an empty `contextLoads` that cannot pass until Task 3 configures a datasource, and Task 3 writes a real test in its place. The generated `application.properties` is empty and would sit confusingly beside the `application.yml` Task 3 creates.

```bash
rm back-end/src/test/java/com/trainingapp/TrainingAppApplicationTests.java
rm back-end/src/main/resources/application.properties
```

- [ ] **Step 5: Pin line endings for the wrapper scripts**

This repository has `core.autocrlf = true`. `mvnw` is a shell script that CI runs on Linux; if it ever picks up CRLF endings, Linux fails with `bad interpreter`. Create `.gitattributes` at the repository root:

```gitattributes
* text=auto

mvnw       text eol=lf
*.sh       text eol=lf
mvnw.cmd   text eol=crlf
*.jar      binary
```

- [ ] **Step 6: Make `mvnw` executable in Git's index**

The single most likely cause of a CI failure later. This repository has `core.filemode = false`, so Git records `mvnw` as mode `100644` regardless of the filesystem, and Linux CI then fails with `Permission denied`. The bit has to be set in the index explicitly.

```bash
git add back-end .gitattributes
git update-index --chmod=+x back-end/mvnw
git ls-files --stage back-end/mvnw
```

Expected: the line begins with `100755`. If it shows `100644`, the change did not take and Task 5 will fail.

- [ ] **Step 7: Verify it compiles under Java 25**

```bash
cd back-end && ./mvnw -B -DskipTests package
```

Expected: `BUILD SUCCESS` and a jar under `back-end/target/`. Tests are skipped because there are none yet — Task 3 adds the first. The first run downloads Maven itself plus the dependency tree, so allow several minutes.

- [ ] **Step 8: Commit**

```bash
git add back-end .gitattributes
git commit -m "Add a Spring Boot skeleton for the backend"
git status --short
```

Expected: `git status` clean. If `back-end/target/` shows up, Task 1's `.gitignore` entry is wrong — fix it before continuing.

---

### Task 3: Connect to Postgres and prove it with a test

**Files:**
- Create: `back-end/src/main/resources/application.yml`
- Create: `back-end/src/main/resources/db/migration/.gitkeep`
- Create: `back-end/src/test/resources/application-test.yml`
- Create: `back-end/src/test/java/com/trainingapp/DatabaseConnectionTest.java`
- Modify: `back-end/pom.xml` — the `spring-boot-maven-plugin` element

**Interfaces:**
- Consumes: `com.trainingapp.TrainingAppApplication` from Task 2.
- Produces: an injectable `javax.sql.DataSource` and `org.flywaydb.core.Flyway`. Two Spring profiles: `local` (verbose health details, activated by `spring-boot:run`) and `test` (points at `training_app_test`). Increment 1 puts its `V1` migration in `back-end/src/main/resources/db/migration/`.

- [ ] **Step 1: Create the two databases**

A manual prerequisite. `psql` is not on PATH, so use the full path. Enter the real superuser password when prompted.

```bash
PSQL="/c/Program Files/PostgreSQL/16/bin/psql.exe"
"$PSQL" -U postgres -c "CREATE DATABASE training_app;"
"$PSQL" -U postgres -c "CREATE DATABASE training_app_test;"
"$PSQL" -U postgres -l
```

Expected: both `training_app` and `training_app_test` appear in the listing.

- [ ] **Step 2: Put the credentials in the environment**

Never in a file. In the same Git Bash session that will run Maven:

```bash
export DB_USERNAME=postgres
export DB_PASSWORD='<the real password>'
```

- [ ] **Step 3: Write the failing test**

Create `back-end/src/test/java/com/trainingapp/DatabaseConnectionTest.java`:

```java
package com.trainingapp;

import static org.assertj.core.api.Assertions.assertThat;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import javax.sql.DataSource;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class DatabaseConnectionTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private Flyway flyway;

    @Test
    void theDatabaseAnswers() throws Exception {
        try (Connection connection = dataSource.getConnection();
                Statement statement = connection.createStatement();
                ResultSet rows = statement.executeQuery("select 1")) {
            assertThat(rows.next()).isTrue();
            assertThat(rows.getInt(1)).isEqualTo(1);
        }
    }

    @Test
    void flywayReachesTheDatabaseAndHasNothingToApply() {
        assertThat(flyway.info().applied()).isEmpty();
    }
}
```

The second test is the one that earns its keep. `flyway.info()` has to query the database to answer, so it proves the Flyway wiring end to end — and asserting *zero applied migrations* holds whether or not Flyway creates its history table when it finds no migration files. That behaviour was deliberately not assumed; see the spec's Testing section.

- [ ] **Step 4: Run it and check it fails for the right reason**

```bash
cd back-end && ./mvnw -B test
```

Expected: FAIL, with `Failed to configure a DataSource: 'url' attribute is not specified` — Spring cannot build a `DataSource` because no configuration exists yet. If it instead fails with a connection refused or an authentication error, the problem is Step 1 or Step 2, not the code. Fix that first; a red test for the wrong reason proves nothing.

- [ ] **Step 5: Write the main configuration**

Create `back-end/src/main/resources/application.yml`:

```yaml
spring:
  application:
    name: training-app

  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/training_app}
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD}

  flyway:
    enabled: true
    locations: classpath:db/migration

management:
  endpoints:
    web:
      exposure:
        include: health
  endpoint:
    health:
      show-details: never

---
spring:
  config:
    activate:
      on-profile: local

management:
  endpoint:
    health:
      show-details: always
```

`DB_PASSWORD` has no default on purpose: an unset password stops startup with a clear message rather than producing a confusing authentication failure later. Health details are hidden by default and verbose only under `local`, because an unauthenticated endpoint that names your database is not something to deploy — increment 1 revisits this once authorisation exists.

- [ ] **Step 6: Create the migration directory**

Flyway warns about a location that does not exist on the classpath. There is no migration to write yet, so the directory needs a placeholder file to survive packaging:

```bash
mkdir -p back-end/src/main/resources/db/migration
touch back-end/src/main/resources/db/migration/.gitkeep
```

- [ ] **Step 7: Write the test configuration**

Create `back-end/src/test/resources/application-test.yml`, pointing at the separate database so tests can never touch development data:

```yaml
spring:
  datasource:
    url: ${TEST_DB_URL:jdbc:postgresql://localhost:5432/training_app_test}
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD}
```

- [ ] **Step 8: Run the test to verify it passes**

```bash
cd back-end && ./mvnw -B test
```

Expected: `BUILD SUCCESS` and `Tests run: 2, Failures: 0, Errors: 0, Skipped: 0`.

- [ ] **Step 9: Make `spring-boot:run` activate the `local` profile**

Without this, running the app locally hides the health components and Step 11 cannot show that the database is reachable. In `back-end/pom.xml`, add a `configuration` block inside the existing `spring-boot-maven-plugin` element:

```xml
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
				<configuration>
					<profiles>
						<profile>local</profile>
					</profiles>
				</configuration>
			</plugin>
```

- [ ] **Step 10: Start the application**

```bash
cd back-end && ./mvnw spring-boot:run
```

Expected in the log: `The following 1 profile is active: "local"`, a Flyway line reporting no migration necessary, and `Tomcat started on port 8080`. Leave it running for the next step.

- [ ] **Step 11: Check the health endpoint**

From a second shell:

```bash
curl -s http://localhost:8080/actuator/health
```

Expected: `{"status":"UP","components":{...,"db":{"status":"UP","details":{"database":"PostgreSQL",...}}}}`.

The `db` component reporting `UP` is the point of this whole increment: it is the proof that the application, the driver, the credentials and the running Postgres instance all agree. Stop the application afterwards.

- [ ] **Step 12: Commit**

```bash
git add back-end
git commit -m "Connect the backend to Postgres and check it on startup"
```

---

### Task 4: Proxy the Angular dev server to the backend

Nothing in the frontend calls the API yet, but the proxy is what keeps CORS a non-issue in development for every later increment. Better to wire and verify it now than to discover it is misconfigured while debugging a first real request.

**Files:**
- Create: `front-end/proxy.conf.json`
- Modify: `front-end/angular.json` — the `serve` target

**Interfaces:**
- Consumes: the backend on `localhost:8080` from Task 3.
- Produces: `/api/*` and `/actuator/*` reachable from the Angular dev server's own origin, so increment 1's first HTTP call can use relative URLs.

- [ ] **Step 1: Write the proxy configuration**

Create `front-end/proxy.conf.json`:

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  },
  "/actuator": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

No path rewriting: backend controllers will live under `/api/**` natively, so the prefix the frontend sends is the prefix the backend expects. `/actuator` is included so the health check is reachable through the dev server, which is what makes Step 4 possible.

- [ ] **Step 2: Point the `serve` target at it**

The `serve` target in `front-end/angular.json` has `builder`, `configurations` and `defaultConfiguration` but **no `options` block** — it has to be created. Insert it directly after the `builder` line, so the target reads:

```json
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "options": {
            "proxyConfig": "proxy.conf.json"
          },
          "configurations": {
            "production": {
              "buildTarget": "training-app:build:production"
            },
            "development": {
              "buildTarget": "training-app:build:development"
            }
          },
          "defaultConfiguration": "development"
        },
```

- [ ] **Step 3: Start both sides**

In one shell:

```bash
cd back-end && ./mvnw spring-boot:run
```

In another:

```bash
cd front-end && npx ng serve
```

Expected from `ng serve`: the usual `Local: http://localhost:4200/`, with no warning about an unreadable proxy configuration. A bad path is reported as a warning rather than an error, so read the output instead of assuming.

- [ ] **Step 4: Verify the proxy forwards**

```bash
curl -s http://localhost:4200/actuator/health
```

Expected: the same JSON as Task 3 Step 11, served through port 4200. That is the proof the plumbing works — the browser's origin can reach the backend with no CORS involved. Stop both processes afterwards.

- [ ] **Step 5: Confirm the test suite is unaffected**

```bash
cd front-end && npx ng test --watch=false --browsers=ChromeHeadless
```

Expected: `TOTAL: 95 SUCCESS`. Tests do not use the `serve` target, but `angular.json` was edited and a malformed file surfaces here.

- [ ] **Step 6: Commit**

```bash
git add front-end/proxy.conf.json front-end/angular.json
git commit -m "Proxy the dev server to the backend"
```

---

### Task 5: Build the backend in CI

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: the Maven project from Task 2 and the test from Task 3.
- Produces: a `back-end` job running on every push to `master` and every pull request. Later increments get their tests run here for free.

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [master]
  pull_request:
  workflow_dispatch:

jobs:
  back-end:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: training_app_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    defaults:
      run:
        working-directory: back-end

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 25
          cache: maven

      - run: ./mvnw -B verify
        env:
          DB_USERNAME: postgres
          DB_PASSWORD: postgres
```

The choices, so they are not mistaken for accidents:

- A Postgres **service container** is how CI gets a database. It works even though Docker is not installed locally, because GitHub's runners provide it. Image `postgres:16` matches the local 16.4.
- The `pg_isready` health check makes the job wait for the database rather than race it.
- `POSTGRES_DB: training_app_test` creates exactly the database the `test` profile expects, so no setup step is needed.
- `DB_USERNAME` / `DB_PASSWORD` are throwaway values for an ephemeral container, not secrets.
- `./mvnw`, not `mvnw.cmd`, because the runner is Linux.

- [ ] **Step 2: Confirm the wrapper is executable in the index**

The most likely cause of this job failing. `core.filemode` is `false` on this machine, so the bit exists only if Task 2 Step 6 set it explicitly.

```bash
git ls-files --stage back-end/mvnw
```

Expected: the line starts with `100755`. If it starts with `100644`, fix it now:

```bash
git update-index --chmod=+x back-end/mvnw
```

- [ ] **Step 3: Commit and push**

```bash
git add .github/workflows/ci.yml
git commit -m "Build and test the backend in CI"
git push -u origin feature/backend-foundation
```

- [ ] **Step 4: Watch the run and read the log**

```bash
gh run watch
```

Expected: the `back-end` job succeeds, with `Tests run: 2, Failures: 0` in the log. A workflow cannot be verified locally, so this step is not optional — do not report Task 5 done on the strength of the YAML looking correct.

If it fails, the three likely causes in order: `Permission denied` on `./mvnw` (Step 2 was skipped), `bad interpreter` (the `.gitattributes` from Task 2 Step 5 is missing), or connection refused (the service container block is malformed).

---

### Task 6: Rewrite the README for two projects

The README still describes a single Angular CLI project served from the repository root, which has been wrong since Task 1. It is rewritten last so it can describe the finished shape once, including the prerequisites that a newcomer — or you, in six months — would otherwise rediscover the hard way.

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: everything from Tasks 1-5.
- Produces: nothing code depends on.

- [ ] **Step 1: Replace `README.md` with the content below**

The content is given as an indented block so its own code fences stay intact. Strip four spaces from the start of every line when writing the file.

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

- [ ] **Step 2: Run every command in it**

Documentation that has not been run is a guess. Walk the frontend block and the backend block in a clean shell and confirm each command behaves as written. Correct the README, not the expectation.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "Describe both projects in the README"
```

---

## Definition of done

Each of these has been run and its output read — not inferred:

- [ ] `cd front-end && npx ng test --watch=false --browsers=ChromeHeadless` → `TOTAL: 95 SUCCESS`
- [ ] `cd front-end && npx ng build --configuration production --base-href /training-app/` → succeeds
- [ ] `cd back-end && ./mvnw -B verify` → `Tests run: 2, Failures: 0`
- [ ] `curl http://localhost:8080/actuator/health` → `status: UP`, with the `db` component `UP`
- [ ] `curl http://localhost:4200/actuator/health` → the same, through the Angular proxy
- [ ] `git ls-files --stage back-end/mvnw` → mode `100755`
- [ ] The `back-end` CI job passes on GitHub
- [ ] After merge, the GitHub Pages deploy succeeds and the live site is unchanged
