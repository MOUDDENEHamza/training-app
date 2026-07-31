# Interval Rep Counter (Running) — Design

## Purpose
During an interval session (e.g. `5×1000 m à 4'00 récup 1'30`), the athlete currently opens a
notes app on the phone and tallies each repetition by hand. The goal is **not** to record
performance (times, paces, averages) — it is to **not lose count** mid-session, so no repetition
is skipped or doubled.

Constraints that follow from how it is actually used: entry happens between repetitions, during
a 1-2 minute recovery, out of breath, one-handed. That means large tap targets, no typing, and no
horizontal scrolling.

Explicitly out of scope: recording times or speeds, comparing against target pace, computing
averages. Measurement already happens on a GPS watch or the treadmill display.

## Approach
Tapping an interval session in the running weeks table opens a full-screen sheet showing a large
`3 / 5` counter and one full-width "Répétition faite" button. The sheet is the only place with
large targets; the table stays a read-only overview carrying a small `3/5` progress badge.

Rejected alternatives:
- **Inline counter in the table cell** — the weeks table scrolls horizontally on mobile, so
  targets stay small and require scrolling to aim. That is precisely what fails while out of breath.
- **Dedicated "session of the day" route** — fastest to reach, but the week plan says
  "mercredi/jeudi" for the quality session without saying which of the two, so "today's session"
  cannot be resolved unambiguously from the existing data.

## Components

### `src/app/utils/rep-count.ts`
```ts
export function parseRepCount(content: string): number | null
```
Finds the `N×` pattern in a session's `content` string and returns N, or `null` when absent.
Pure function, no dependencies — matches the style of the existing `date-guess.ts` and
`program-progress.ts` utils. When a string contains more than one `N×` pattern, the first match
wins (does not occur in current data).

The pattern matches the `×` multiplication sign (U+00D7) used throughout
`running-program.data.ts`, and also accepts an ASCII `x` so a future hand-typed session does not
silently lose its counter.

### `TrackingService` (existing, extended)
- `TrackingEntry` gains `reps?: number`.
- New method `setReps(key: string, count: number): void`, persisting through the same
  `safePersist` path as `toggleDone` / `setActual`.

The existing `actual` field is deliberately **not** reused: it already carries a different meaning
on the strength page (the free-text "réel" input), and storing a number as a string there would
conflate two concepts. Entries already in `localStorage` have no `reps` key, so they read as
`undefined` and are treated as 0 — no migration required.

Keys reuse the running page's existing scheme unchanged:
`running:${phaseId}:${weekId}:${label}`. Because `weekId` is part of the key, the counter resets
naturally each week.

### `src/app/shared/rep-counter-sheet/`
A presentational standalone component that does not inject `TrackingService`.

- Inputs: `title` (session label), `detail` (session content), `total` (N), `count` (current).
- Outputs: `increment`, `undo`, `close`.

State lives in the running page, which reads and writes the service. Keeping the sheet dumb makes
it testable in isolation and lets the swimming page reuse it later without changing its code.

Layout: `position: fixed` over a dimmed backdrop; the primary button is full-width and ~56px tall.

### `RunningProgramComponent` (existing, extended)
- New signal `openSession` holding the session currently being counted (`phaseId`, `weekId`,
  `label`, `content`, `total`) or `null`.
- In each weeks-table cell, when `parseRepCount(session.content)` returns a number, the session
  text becomes a tappable button that opens the sheet, and a small `3/5` badge shows progress
  without opening it.
- The existing done checkbox stays as-is.

## Data flow
Tap cell → `openSession.set({...})` → sheet renders → tap "Répétition faite" →
`tracking.setReps(key, count + 1)` → the service signal re-renders the counter. On reaching N,
`done` is also set to true, so finishing the count marks the session complete without an extra
gesture. Closing the sheet sets `openSession` back to `null`.

"annuler" decrements the count by 1, and when that drops it below N it also clears `done` — the
counter and the checkbox never disagree about whether the session is finished.

## Edge cases
- No `N×` pattern (`40 min EF`, `1h20 EF`) → no counter, no badge, cell behaviour unchanged.
- At `N/N` the "Répétition faite" button is disabled; at `0` the "annuler" button is disabled.
  The count cannot exceed N or go below 0.
- `localStorage` unavailable → already handled by the service's try/catch; the counter stays
  in-memory for the session.
- The table cell is currently a `<label>` wrapping the checkbox, so clicking the text would toggle
  the checkbox. The checkbox must be moved out of the label and the text placed in a `<button>`,
  otherwise opening the sheet would also mark the session done.

## Testing
- `rep-count.spec.ts` against real strings from `running-program.data.ts`:
  `5×1000 m à 4'00 récup 1'30` → 5, `2×15 min seuil (4'10) récup 4'` → 2,
  `20 min footing + 4×400 m à 4'07 récup 1'30` → 4, `40 min EF` → `null`,
  `1h30 [1h10 EF + 20 min AM + fin EF]` → `null`.
- `tracking.service.spec.ts` (existing file): `setReps` stores and persists; an entry written
  before `reps` existed still reads back cleanly.
- `rep-counter-sheet.component.spec.ts`: renders `count / total`, emits `increment` and `undo`,
  disables the primary button at N and `undo` at 0.

## Later (not in this change)
Swimming sessions use the same pattern (`8×2L crawl`, `6×4L crawl`) and have the same problem.
Because the sheet is presentational and the parser is a pure function, extending it there is a
matter of wiring only.
