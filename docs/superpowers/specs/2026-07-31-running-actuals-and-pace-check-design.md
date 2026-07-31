# Running Actuals and Pace Check — Design

## Purpose
The app shows the plan and ticks off completed work, but never answers the question the whole
programme exists for: am I on track for 1h26? There is a target time, a table of target paces, and
two benchmark sessions written into the plan — and no way to record what actually happened.

The strength page already solves the general half of this: every exercise cell has a free-text
"réel" input backed by `TrackingService.setActual`. Running sessions have `done` and a rep count but
no equivalent. This change closes that asymmetry and adds a numeric check on the two sessions where
the plan defines a target.

## Where the input goes
A free-text "réel" input on every running session, in the **weeks table only** — not in the
"Semaine en cours" card. The card is the mid-session tool, reached one-handed and out of breath; the
table is what you read at home. Typing belongs in the second place, not the first.

It writes through `TrackingService.setActual` on the same key as the checkbox and the rep counter
(`runningTrackingKey(phaseId, weekId, label)`), exactly as the strength page does.

## The two test sessions
The plan contains exactly two, both in phase 3, both labelled `S3 – Spécifique semi`:

- S9 — `5 km allure semi (4'07) – test`
- S13 — `10 km allure semi (4'07) – test`

They are recognised by `– test` in the content. The distance is read from the same string, and
`splitTargets` already holds the matching target: `5 km → 20'35`, `10 km → 41'10`.

On those two rows only, once a time is entered, the row shows the gap and what that pace implies for
the half:

```
10 km en 42'05 — +55 s sur la cible · à cette allure : 1h27'55
```

## How the half time is derived
This is the one real judgement call, so it is recorded here.

The standard cross-distance equivalence formula (Riegel, `T₂ = T₁ × (D₂/D₁)^1.06`) would turn
10 km in 42'05 into a half of **1h32'51**. Scaling the pace gives **1h27'55**. Nearly five minutes
apart, so the choice matters.

This design scales the pace. The session is not a 10 km time trial — its own label says
`10 km allure semi`. It asks "can I hold 4'07/km?", not "how fast can I race 10 km?". So the honest
answer is "at this pace the half comes to 1h27'55", which is arithmetic on a held pace, not a
performance prediction. Riegel answers a question this session does not ask.

The wording in the UI is deliberately **"à cette allure"** rather than "projection", so it does not
promise more than it knows.

## Components

### `src/app/utils/race-time.ts`
```ts
export function parseRaceTime(input: string): number | null   // → seconds
export function formatRaceTime(seconds: number): string       // → "41'10" / "1h27'55"
```
Accepts the notation the app already displays — `41'10`, `1h01'45` — and tolerates `41:10` and
`1:01:45`, since a colon is the natural thing to type. It must also accept `1h26`, hours and minutes
with no seconds, because that is how the target time is written; without it the whole feature fails on
its own reference value. Returns `null` on anything it cannot read, so a half-typed value never
renders as a bogus gap.

`formatRaceTime` omits the hour below 3600 s (`41'10`) and includes it above (`1h27'55`), matching
`splitTargets`.

### `src/app/utils/pace-check.ts`
```ts
export interface PaceCheck {
  distanceKm: number;
  targetSeconds: number;
  actualSeconds: number;
  deltaSeconds: number;    // positive = slower than target
  halfSeconds: number;     // the half time implied by the actual pace
}

export function paceCheckFor(
  content: string,
  actual: string,
  program: RunningProgram
): PaceCheck | null
```
Returns `null` unless the content contains `– test`, a distance in km can be read from it (the first
`<number> km` in the string), a matching entry exists in `splitTargets`, and `actual` parses as a
time. The distance is only read when `– test` is present, so `2×4 km à 4'07` — a regular session that
also mentions kilometres — is never mistaken for a benchmark. Any of those missing means
no check is shown — the session simply keeps its plain "réel" value.

`halfSeconds = actualSeconds × (halfTargetSeconds / targetSeconds)`.

### Data
`RunningProgram` gains `targetTime: string` (`"1h26"`). The objective currently exists only inside a
prose sentence in `season-overview.data.ts`, which no code can use.

### UI
- `PhaseWeeksTableComponent` renders the "réel" input per session cell, and the pace-check line on
  the two test rows.
- The running page's stats row gains a tile showing the most recent test result and its implied half
  time, so the feedback is not buried in a table the user has to scroll sideways. The tile is absent
  until a test has been recorded.

## Testing
`race-time.spec.ts` — round-trips and rejections: `41'10` → 2470, `1h01'45` → 3705, `41:10` → 2470,
`1:01:45` → 3705, `20'35` → 1235; `formatRaceTime(2470)` → `41'10`, `formatRaceTime(5275)` →
`1h27'55`; `''`, `abc`, `41'` → `null`.

`pace-check.spec.ts` — using the real programme data: the S13 content with `42'05` gives
`distanceKm 10`, `targetSeconds 2470`, `deltaSeconds 55`, and a `halfSeconds` that formats to
`1h27'55`; the S9 content with `20'35` gives `deltaSeconds 0`; a faster time gives a negative delta;
a non-test session (`50 min EF`) returns `null`; a test session with unparseable actual returns
`null`.

`phase-weeks-table.component.spec.ts` — typing into a session's "réel" input persists through
`TrackingService`; a test row with a recorded time renders the gap and the implied half time; a
non-test row renders no pace-check line.

## Out of scope
Weekly adherence ("2/3 courses cette semaine") was raised alongside this and left undecided, so it
is not part of this change.
