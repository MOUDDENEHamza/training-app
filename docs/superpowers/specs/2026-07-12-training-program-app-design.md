# Training Program App — Design

## Purpose
Turn two static PDF training programs (strength/hypertrophy, and running + swimming) into an
Angular web app. The landing page shows the weekly overview table; strength, running, and
swimming sessions each get a detail page reachable from the landing page.

## Architecture
Angular 19, standalone components, Angular Router, signals for state, plain SCSS for styling.
Pure static frontend (`ng build` output is a deployable static site) — no backend. A
`TrackingService` wraps `localStorage` so users can check off completed work and log actual
weights/paces against the plan, without mutating the source plan data.

## Data (static TypeScript, `src/app/data/`)
- `models.ts` — shared interfaces.
- `week-plan.data.ts` — the 7-day overview driving the landing page.
- `strength-sessions.data.ts` — the 4 sessions (Pecs+Triceps, Dos+Biceps, Épaules, Jambes),
  each with a color theme, exercise groups, and per-week planned loads (S1-S5 columns from the PDF).
- `running-program.data.ts` — pace reference table, the 4 training phases with weekly sessions,
  and the race-day strategy/split targets.
- `swimming-program.data.ts` — equipment table, the 4 technique keys, drill descriptions, and the
  4 phases with séance A/B content.
- `season-overview.data.ts` — the cross-discipline summary table (Running/Natation/Muscu by period).

## Routing & Pages
- `''` → `WeeklyOverviewComponent` — the Jour/Séance/Cardio table. Séance cells link to strength
  detail; Cardio cells show "Course →" / "Natation →" links depending on the day. Season overview
  table below.
- `'strength/:sessionId'` → `StrengthSessionDetailComponent` — exercise tables grouped by
  Force/Hypertrophie/Finisher, colored per session theme; tractions progression table on the
  Dos+Biceps page.
- `'running'` → `RunningProgramComponent` — pace table, 4 phases, race strategy panel.
- `'swimming'` → `SwimmingProgramComponent` — equipment, technique keys, drills, 4 phases.
- Shared top nav (Programme / Course / Natation).

## Tracking
Each prescribed cell gets a checkbox (done) and an editable "actual" field, keyed as
`tracking:<domain>:<sessionId>:<itemId>:<week>` and persisted to `localStorage` on every change.
Plan data itself is never mutated.

## Error handling
Unknown `:sessionId` redirects to the landing page. `localStorage` access is wrapped in
try/catch and fails silently to in-memory-only state.

## Testing
Angular's default Jasmine/Karma: unit tests for `TrackingService`, smoke tests for each page
component. No e2e suite.
