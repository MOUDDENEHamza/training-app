# Today's Running Session — Quick Entry Design

## Purpose
Reaching the rep counter mid-session currently costs: open the app → Course → pick the phase tab →
find the week row → scroll the table horizontally → tap the session. Since the screen locks between
repetitions (a wake lock was considered and declined), this navigation is repeated several times
within a single session. The goal is to get from app launch to the counter in one tap.

## Approach
The dashboard's "Course" day tag carries a `?session=today` query parameter. On arrival the running
page resolves today's session and opens the counter sheet directly. When resolution is not possible,
the page falls back to a "Semaine en cours" card at the top listing the current week's sessions,
each tappable.

Resolution deliberately returns nothing rather than guessing wrong: opening the wrong session
mid-effort is worse than one extra tap.

## Resolving today's session

`src/app/utils/todays-session.ts` — a pure function:

```ts
export interface TodaysSession {
  phaseId: string;
  weekId: string;
  label: string;
  content: string;
}

export function resolveTodaysSession(
  program: RunningProgram,
  today?: Date
): TodaysSession | null
```

The week comes from the existing `guessCurrentRunningWeekId`. Within that week, two rules apply in
order:

**Rule 1 — by label.** If a session label contains today's day name, that is today's session. Phase 1
and 2 labels name their days: `Séance 1 – Endurance (lundi)`, `Séance 2 – Qualité (mercredi/jeudi)`,
`Séance 3 – Sortie longue (vendredi/samedi)`. This picks up the alternate days the data already
allows — Thursday resolves to the quality session, Saturday to the long run.

**Rule 2 — by position.** Otherwise, if the phase has exactly three sessions, map
lundi→1st, mercredi/jeudi→2nd, vendredi/samedi→3rd. This covers phase 4, whose labels are silent
(`Séance 1`, `Séance 2`, `Séance 3`) but whose sessions are in the same order: endurance, quality,
long run.

**Otherwise `null`.** Two cases reach this:
- Phase 3 (`prepa-specifique`) has four sessions in a different order — its third is
  `S3 – Spécifique semi`, not the long run — so position mapping would resolve Friday to the wrong
  session.
- Days with no run: mardi and dimanche.

Day names are matched lowercase. The util defines its own lowercase day-name list; the display-cased
list in `weekly-overview.component.ts` serves a different purpose and stays where it is.

## Automatic opening
`weekly-overview.component.html` adds `[queryParams]="{ session: 'today' }"` to the running day tag,
keeping its existing `fragment="phases"`.

`RunningProgramComponent` reads `session` from the route snapshot's query params. When it equals
`today` and `resolveTodaysSession` returns a session, the component sets `openSession` so the sheet
renders immediately. Without the parameter nothing opens — browsing the programme must stay calm.

`resolveTodaysSession` returns no repetition count; the component derives it with the existing
`parseRepCount` when building the `OpenSession` value, exactly as `openCounter` already does.

When the resolved session has no repetitions (a plain `50 min EF` on a Monday), no sheet opens: there
is nothing to count. The card still highlights it.

## "Semaine en cours" card
Rendered at the top of the running page, above the "Phases d'entraînement" card, inside the page
template rather than as its own component — it is a fifteen-line list specific to this page. The
resolution logic is what earns a separate unit, and it is a pure function.

Each row shows the session label, its content, and a `3/6` badge when the session has repetitions.
Rows with repetitions are tappable and open the counter; rows without are plain text. When resolution
succeeded, today's row carries an "Aujourd'hui" chip, reusing the existing `.current-chip` class
already used for the current week and the current day.

## Testing
`todays-session.spec.ts` against real dates (2026-07-12 is a Sunday, so plan weeks start on Mondays):
- Monday 2026-06-15 (S1, phase 1) → `Séance 1 – Endurance (lundi)`
- Wednesday 2026-06-17 → `Séance 2 – Qualité (mercredi/jeudi)`
- Thursday 2026-06-18 → the same quality session, via the alternate day in the label
- Saturday 2026-06-20 → `Séance 3 – Sortie longue (vendredi/samedi)`
- Tuesday 2026-06-16 → `null`
- Monday 2026-08-10 (S9, phase 3) → `null`, four sessions and no day names
- Monday 2026-10-19 (S19, phase 4) → `Séance 1`, resolved by position
- Wednesday 2026-10-21 (S19, phase 4) → `Séance 2`, resolved by position

`running-program.component.spec.ts`:
- `openTodaysSession(date)` on a Wednesday renders the sheet with six repetitions
- `openTodaysSession(date)` on a Monday, whose session is `40 min EF`, renders no sheet
- a plain visit renders no sheet
- the "Semaine en cours" card lists the current week's sessions and its rows open the counter

`openTodaysSession` is public and takes an optional date, following the convention of `daysUntil`
and `guessCurrentRunningWeekId`. Two reasons: stubbing `ActivatedRoute` well enough for `RouterLink`
to keep working is brittle, and a test relying on the real clock would flip with the weekday — today
is a Friday, which resolves to a long run with nothing to count. The one-line query-parameter read in
the constructor is verified in the browser instead.

## Known debt (not addressed here)
`RunningProgramComponent` now carries tracking, phase tabs, row highlighting, the rep counter, and
this card. It is at the edge of doing too much. Splitting it is out of scope for this change, but the
next feature added to this page should start by breaking it up.
