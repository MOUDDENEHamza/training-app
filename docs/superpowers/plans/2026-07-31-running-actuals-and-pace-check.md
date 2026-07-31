# Running Actuals and Pace Check Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Record what actually happened on a running session, and on the plan's two benchmark sessions show the gap to target pace and the half-marathon time that pace implies.

**Architecture:** Two pure utils — one that reads and writes race times, one that turns a benchmark session plus a recorded time into a comparison. The weeks table gains a "réel" input per session, mirroring the strength page, and renders the comparison on benchmark rows. The running page shows the most recent comparison as a stat tile.

**Tech Stack:** Angular 19 standalone components, signals, SCSS, Jasmine + Karma.

## Global Constraints

- Angular 19, standalone components only, no NgModules.
- `TrackingService` is the single source of truth for progress; keys come from `runningTrackingKey`.
- Plain SCSS from the CSS custom properties in `src/styles.scss` — no new colors.
- All user-facing copy in French. The implied half time is worded "à cette allure", never "projection".
- Time notation follows what the app already displays: `41'10`, `1h01'45`, `1h26`.
- Test command (single run, headless): `npx ng test --watch=false --browsers=ChromeHeadless`
- Baseline is green: 67 specs pass before this plan starts.
- Work on branch `feature/running-actuals` off `master`.

---

### Task 1: Read and write race times

**Files:**
- Create: `src/app/utils/race-time.ts`
- Test: `src/app/utils/race-time.spec.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `parseRaceTime(input: string): number | null` — seconds, or null when unreadable.
  - `formatRaceTime(seconds: number): string` — `41'10` below an hour, `1h27'55` above.

- [ ] **Step 1: Write the failing test**

Create `src/app/utils/race-time.spec.ts`:

```ts
import { formatRaceTime, parseRaceTime } from './race-time';

describe('parseRaceTime', () => {
  it('reads minutes and seconds', () => {
    expect(parseRaceTime("41'10")).toBe(2470);
    expect(parseRaceTime("20'35")).toBe(1235);
  });

  it('reads hours, minutes and seconds', () => {
    expect(parseRaceTime("1h01'45")).toBe(3705);
  });

  it('reads hours and minutes with no seconds, as the target time is written', () => {
    expect(parseRaceTime('1h26')).toBe(5160);
  });

  it('tolerates colons, which are the natural thing to type', () => {
    expect(parseRaceTime('41:10')).toBe(2470);
    expect(parseRaceTime('1:01:45')).toBe(3705);
  });

  it('returns null on anything it cannot read', () => {
    expect(parseRaceTime('')).toBeNull();
    expect(parseRaceTime('abc')).toBeNull();
    expect(parseRaceTime("41'")).toBeNull();
    expect(parseRaceTime('42')).toBeNull();
    expect(parseRaceTime("41'70")).toBeNull();
  });
});

describe('formatRaceTime', () => {
  it('writes times back in the notation the app displays', () => {
    expect(formatRaceTime(2470)).toBe("41'10");
    expect(formatRaceTime(1235)).toBe("20'35");
    expect(formatRaceTime(3705)).toBe("1h01'45");
    expect(formatRaceTime(5275)).toBe("1h27'55");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: FAIL — the build cannot resolve `./race-time`.

- [ ] **Step 3: Write the minimal implementation**

Create `src/app/utils/race-time.ts`:

```ts
function toSeconds(hours: number, minutes: number, seconds: number): number | null {
  if (minutes > 59 || seconds > 59) {
    return null;
  }
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Reads a race time into seconds. Accepts the notation the app displays — 41'10, 1h01'45 — plus
 * 1h26 (no seconds, how the target time is written) and colon forms like 41:10 and 1:01:45.
 *
 * A bare number is rejected on purpose: "42" could mean minutes or seconds, and guessing wrong
 * would silently produce a nonsense gap.
 */
export function parseRaceTime(input: string): number | null {
  const value = input.trim();
  if (!value) {
    return null;
  }

  const withHour = value.match(/^(\d+)\s*h\s*(\d{1,2})(?:\s*['´:]\s*(\d{1,2}))?$/i);
  if (withHour) {
    const [, hours, minutes, seconds] = withHour;
    return toSeconds(Number(hours), Number(minutes), seconds ? Number(seconds) : 0);
  }

  const separated = value.match(/^(\d+)\s*['´:]\s*(\d{1,2})(?:\s*['´:]\s*(\d{1,2}))?$/);
  if (separated) {
    const [, first, second, third] = separated;
    return third === undefined
      ? toSeconds(0, Number(first), Number(second))
      : toSeconds(Number(first), Number(second), Number(third));
  }

  return null;
}

/** Writes seconds back as 41'10 below an hour, 1h27'55 above. */
export function formatRaceTime(seconds: number): string {
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return hours > 0 ? `${hours}h${pad(minutes)}'${pad(rest)}` : `${minutes}'${pad(rest)}`;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: PASS — 73 specs total, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add src/app/utils/race-time.ts src/app/utils/race-time.spec.ts
git commit -m "Read and write race times"
```

---

### Task 2: Compare a benchmark session to its target

**Files:**
- Create: `src/app/utils/pace-check.ts`
- Modify: `src/app/data/models.ts` (add `targetTime` to `RunningProgram`)
- Modify: `src/app/data/running-program.data.ts` (set `targetTime: '1h26'`)
- Test: `src/app/utils/pace-check.spec.ts`

**Interfaces:**
- Consumes: `parseRaceTime` from Task 1.
- Produces:
  - `interface PaceCheck { distanceKm: number; targetSeconds: number; actualSeconds: number; deltaSeconds: number; halfSeconds: number; }`
  - `paceCheckFor(content: string, actual: string, program: RunningProgram): PaceCheck | null`
  - `paceChecks(program: RunningProgram, resolveActual: (phaseId: string, weekId: string, label: string) => string): PaceCheck[]` — every recorded benchmark, in plan order.

Reference data: the programme holds exactly two benchmark sessions, both labelled
`S3 – Spécifique semi` in phase `prepa-specifique` — S9 `5 km allure semi (4'07) – test` and
S13 `10 km allure semi (4'07) – test`. `splitTargets` holds `5 km → 20'35` and `10 km → 41'10`.
With `targetTime` `1h26` (5160 s), 10 km in `42'05` (2525 s) implies 2525 × 5160 / 2470 = 5275 s,
which formats to `1h27'55`.

- [ ] **Step 1: Write the failing test**

Create `src/app/utils/pace-check.spec.ts`:

```ts
import { RUNNING_PROGRAM } from '../data/running-program.data';
import { paceCheckFor, paceChecks } from './pace-check';
import { formatRaceTime } from './race-time';

const TEST_10K = "10 km allure semi (4'07) – test";
const TEST_5K = "5 km allure semi (4'07) – test";

describe('paceCheckFor', () => {
  it('compares the 10 km benchmark to its target split', () => {
    const check = paceCheckFor(TEST_10K, "42'05", RUNNING_PROGRAM)!;
    expect(check.distanceKm).toBe(10);
    expect(check.targetSeconds).toBe(2470);
    expect(check.actualSeconds).toBe(2525);
    expect(check.deltaSeconds).toBe(55);
    expect(formatRaceTime(check.halfSeconds)).toBe("1h27'55");
  });

  it('reports no gap when exactly on target', () => {
    const check = paceCheckFor(TEST_5K, "20'35", RUNNING_PROGRAM)!;
    expect(check.distanceKm).toBe(5);
    expect(check.deltaSeconds).toBe(0);
  });

  it('reports a negative gap when faster than target', () => {
    const check = paceCheckFor(TEST_5K, "20'00", RUNNING_PROGRAM)!;
    expect(check.deltaSeconds).toBe(-35);
  });

  it('ignores a session that is not a benchmark, even when it mentions kilometres', () => {
    expect(paceCheckFor('50 min EF', "42'05", RUNNING_PROGRAM)).toBeNull();
    expect(paceCheckFor("2×4 km à 4'07 récup 4'", "42'05", RUNNING_PROGRAM)).toBeNull();
  });

  it('ignores a benchmark whose recorded time cannot be read', () => {
    expect(paceCheckFor(TEST_10K, '', RUNNING_PROGRAM)).toBeNull();
    expect(paceCheckFor(TEST_10K, 'bien passé', RUNNING_PROGRAM)).toBeNull();
  });
});

describe('paceChecks', () => {
  it('lists recorded benchmarks in plan order and skips the unrecorded', () => {
    const recorded: Record<string, string> = {
      'prepa-specifique:S9:S3 – Spécifique semi': "20'35",
      'prepa-specifique:S13:S3 – Spécifique semi': "42'05",
    };
    const checks = paceChecks(
      RUNNING_PROGRAM,
      (phaseId, weekId, label) => recorded[`${phaseId}:${weekId}:${label}`] ?? ''
    );
    expect(checks.map((c) => c.distanceKm)).toEqual([5, 10]);
  });

  it('is empty when nothing has been recorded', () => {
    expect(paceChecks(RUNNING_PROGRAM, () => '')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: FAIL — the build cannot resolve `./pace-check`.

- [ ] **Step 3: Write the minimal implementation**

In `src/app/data/models.ts`, add `targetTime` to `RunningProgram`:

```ts
export interface RunningProgram {
  objective: string;
  targetTime: string;
  paces: PaceRow[];
  phases: RunningPhase[];
  raceStrategy: string;
  splitTargets: SplitTarget[];
}
```

In `src/app/data/running-program.data.ts`, add the field immediately after `objective`:

```ts
  targetTime: '1h26',
```

Create `src/app/utils/pace-check.ts`:

```ts
import { RunningProgram } from '../data/models';
import { parseRaceTime } from './race-time';

export interface PaceCheck {
  distanceKm: number;
  targetSeconds: number;
  actualSeconds: number;
  /** Positive means slower than the target split. */
  deltaSeconds: number;
  /** The half-marathon time this pace implies, held all the way. */
  halfSeconds: number;
}

/** The plan marks its benchmark sessions with "– test"; dash variants are tolerated. */
const BENCHMARK = /[-–—]\s*test/i;

/**
 * Compares a recorded time against the target split for a benchmark session.
 *
 * Returns null unless the session is a benchmark, a distance can be read from it, a matching split
 * target exists, and the recorded value parses as a time. The distance is only read for benchmarks,
 * so a regular session that mentions kilometres is never mistaken for one.
 */
export function paceCheckFor(
  content: string,
  actual: string,
  program: RunningProgram
): PaceCheck | null {
  if (!BENCHMARK.test(content)) {
    return null;
  }

  const distance = content.match(/(\d+)\s*km/);
  if (!distance) {
    return null;
  }
  const distanceKm = Number(distance[1]);

  const split = program.splitTargets.find((t) => Number.parseInt(t.distance, 10) === distanceKm);
  if (!split) {
    return null;
  }

  const targetSeconds = parseRaceTime(split.time);
  const actualSeconds = parseRaceTime(actual);
  const halfTargetSeconds = parseRaceTime(program.targetTime);
  if (targetSeconds === null || actualSeconds === null || halfTargetSeconds === null) {
    return null;
  }

  return {
    distanceKm,
    targetSeconds,
    actualSeconds,
    deltaSeconds: actualSeconds - targetSeconds,
    halfSeconds: Math.round(actualSeconds * (halfTargetSeconds / targetSeconds)),
  };
}

/** Every recorded benchmark, in the order the plan lists them. */
export function paceChecks(
  program: RunningProgram,
  resolveActual: (phaseId: string, weekId: string, label: string) => string
): PaceCheck[] {
  const checks: PaceCheck[] = [];
  for (const phase of program.phases) {
    for (const week of phase.weeks) {
      for (const session of week.sessions) {
        const check = paceCheckFor(
          session.content,
          resolveActual(phase.id, week.id, session.label),
          program
        );
        if (check) {
          checks.push(check);
        }
      }
    }
  }
  return checks;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: PASS — 79 specs total, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add src/app/utils/pace-check.ts src/app/utils/pace-check.spec.ts src/app/data/
git commit -m "Compare a benchmark session to its target split"
```

---

### Task 3: Record actuals in the table and surface the check

**Files:**
- Modify: `src/app/pages/running-program/phase-weeks-table/phase-weeks-table.component.ts`
- Modify: `src/app/pages/running-program/phase-weeks-table/phase-weeks-table.component.html`
- Modify: `src/app/pages/running-program/phase-weeks-table/phase-weeks-table.component.scss`
- Modify: `src/app/pages/running-program/running-program.component.ts`
- Modify: `src/app/pages/running-program/running-program.component.html`
- Create: `src/app/pages/running-program/phase-weeks-table/phase-weeks-table.component.spec.ts`

**Interfaces:**
- Consumes: `paceCheckFor`, `paceChecks`, `PaceCheck` (Task 2); `formatRaceTime` (Task 1); the existing `runningTrackingKey`, `TrackingService.setActual`, and the `.cell-session` / `.rep-badge` global classes.
- Produces: nothing consumed later — final task.

The table's `phases` input is replaced by a `program` input: it now needs `splitTargets` and
`targetTime` as well as `phases`, and passing the whole programme is simpler than three inputs.

- [ ] **Step 1: Write the failing test**

Create `src/app/pages/running-program/phase-weeks-table/phase-weeks-table.component.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { PhaseWeeksTableComponent } from './phase-weeks-table.component';
import { RUNNING_PROGRAM } from '../../../data/running-program.data';
import { TrackingService } from '../../../services/tracking.service';
import { runningTrackingKey } from '../running-tracking-key';

describe('PhaseWeeksTableComponent', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  async function setup(phaseId: string) {
    await TestBed.configureTestingModule({
      imports: [PhaseWeeksTableComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(PhaseWeeksTableComponent);
    fixture.componentInstance.program = RUNNING_PROGRAM;
    fixture.componentInstance.currentWeekId = 'S1';
    fixture.componentInstance.initialPhaseId = phaseId;
    fixture.detectChanges();
    return fixture;
  }

  it('persists a typed actual through the tracking service', async () => {
    const fixture = await setup('base-aerobie');
    const input: HTMLInputElement = fixture.nativeElement.querySelector('.cell-actual');
    input.value = '41 min, RPE 6';
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const tracking = TestBed.inject(TrackingService);
    const key = runningTrackingKey('base-aerobie', 'S1', 'Séance 1 – Endurance (lundi)');
    expect(tracking.entry(key).actual).toBe('41 min, RPE 6');
  });

  it('shows the gap and the implied half time on a benchmark row', async () => {
    // Seeded through localStorage, not TestBed.inject: the service reads storage when it is
    // constructed, and injecting before configureTestingModule would throw.
    localStorage.setItem(
      'training-app:tracking',
      JSON.stringify({
        [runningTrackingKey('prepa-specifique', 'S13', 'S3 – Spécifique semi')]: {
          done: false,
          actual: "42'05",
        },
      })
    );

    const fixture = await setup('prepa-specifique');
    const check = fixture.nativeElement.querySelector('.pace-check');
    expect(check).toBeTruthy();
    expect(check.textContent).toContain('+55 s');
    expect(check.textContent).toContain("1h27'55");
    expect(check.textContent).toContain('à cette allure');
  });

  it('shows no pace check on a session that is not a benchmark', async () => {
    const fixture = await setup('base-aerobie');
    expect(fixture.nativeElement.querySelector('.pace-check')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: FAIL — `program` is not a property of the component, and `.cell-actual` does not exist.

- [ ] **Step 3: Write the minimal implementation**

In `phase-weeks-table.component.ts`, replace the imports and the class body's inputs and methods so the file reads:

```ts
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { RunningPhase, RunningProgram, RunningWeekSession } from '../../../data/models';
import { TrackingService } from '../../../services/tracking.service';
import { parseRepCount } from '../../../utils/rep-count';
import { PaceCheck, paceCheckFor } from '../../../utils/pace-check';
import { formatRaceTime } from '../../../utils/race-time';
import { runningTrackingKey } from '../running-tracking-key';

export interface SessionRef {
  phaseId: string;
  weekId: string;
  session: RunningWeekSession;
}

/**
 * The phase tabs and the weeks table beneath them. Which tab is open is local UI
 * state, so it lives here rather than on the page.
 */
@Component({
  selector: 'app-phase-weeks-table',
  standalone: true,
  templateUrl: './phase-weeks-table.component.html',
  styleUrl: './phase-weeks-table.component.scss',
})
export class PhaseWeeksTableComponent {
  @Input({ required: true }) program!: RunningProgram;
  @Input({ required: true }) currentWeekId!: string;
  @Input({ required: true }) initialPhaseId!: string;
  @Input() highlightCurrentWeek = false;

  @Output() count = new EventEmitter<SessionRef>();

  readonly tracking = inject(TrackingService);
  private readonly selectedPhaseId = signal<string | null>(null);

  get phases(): RunningPhase[] {
    return this.program.phases;
  }

  activePhaseId(): string {
    return this.selectedPhaseId() ?? this.initialPhaseId;
  }

  activePhase(): RunningPhase {
    return this.phases.find((p) => p.id === this.activePhaseId()) ?? this.phases[0];
  }

  selectPhase(id: string): void {
    this.selectedPhaseId.set(id);
  }

  trackingKey(phaseId: string, weekId: string, label: string): string {
    return runningTrackingKey(phaseId, weekId, label);
  }

  repCount(content: string): number | null {
    return parseRepCount(content);
  }

  doneReps(phaseId: string, weekId: string, label: string): number {
    return this.tracking.entry(runningTrackingKey(phaseId, weekId, label)).reps ?? 0;
  }

  actualFor(phaseId: string, weekId: string, label: string): string {
    return this.tracking.entry(runningTrackingKey(phaseId, weekId, label)).actual ?? '';
  }

  onActualInput(phaseId: string, weekId: string, label: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.tracking.setActual(runningTrackingKey(phaseId, weekId, label), value);
  }

  paceCheck(content: string, phaseId: string, weekId: string, label: string): PaceCheck | null {
    return paceCheckFor(content, this.actualFor(phaseId, weekId, label), this.program);
  }

  /** "+55 s sur la cible" / "-35 s sur la cible" / "pile sur la cible". */
  deltaLabel(check: PaceCheck): string {
    if (check.deltaSeconds === 0) {
      return 'pile sur la cible';
    }
    const sign = check.deltaSeconds > 0 ? '+' : '-';
    return `${sign}${Math.abs(check.deltaSeconds)} s sur la cible`;
  }

  formatTime(seconds: number): string {
    return formatRaceTime(seconds);
  }
}
```

In `phase-weeks-table.component.html`, replace the session cell block — the `<div class="cell-check">` element and everything inside it — with:

```html
                  <div class="cell-check">
                    <input
                      type="checkbox"
                      [checked]="tracking.entry(trackingKey(phase.id, week.id, session.label)).done"
                      (change)="tracking.toggleDone(trackingKey(phase.id, week.id, session.label))"
                      [attr.aria-label]="'Séance faite : ' + session.content"
                    />
                    @if (repCount(session.content); as total) {
                      <button
                        type="button"
                        class="cell-session"
                        (click)="count.emit({ phaseId: phase.id, weekId: week.id, session })"
                      >
                        {{ session.content }}
                        <span class="rep-badge"
                          >{{ doneReps(phase.id, week.id, session.label) }}/{{ total }}</span
                        >
                      </button>
                    } @else {
                      <span class="cell-session cell-session--plain">{{ session.content }}</span>
                    }
                  </div>
                  <input
                    class="cell-actual"
                    type="text"
                    placeholder="réel…"
                    [value]="actualFor(phase.id, week.id, session.label)"
                    (change)="onActualInput(phase.id, week.id, session.label, $event)"
                  />
                  @if (paceCheck(session.content, phase.id, week.id, session.label); as check) {
                    <div class="pace-check">
                      <span [class.is-behind]="check.deltaSeconds > 0">{{ deltaLabel(check) }}</span>
                      <span class="pace-check__half"
                        >à cette allure : {{ formatTime(check.halfSeconds) }}</span
                      >
                    </div>
                  }
```

Append to `phase-weeks-table.component.scss`:

```scss
.cell-actual {
  width: 100%;
  margin-top: 6px;
  padding: 4px 7px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  font-family: inherit;
  font-size: 0.78rem;
  color: var(--color-text);

  &::placeholder {
    color: var(--color-text-faint);
  }
}

.pace-check {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-top: 5px;
  font-size: 0.74rem;
  color: var(--color-green);

  .is-behind {
    color: var(--color-current);
  }

  &__half {
    color: var(--color-text-muted);
  }
}
```

In `running-program.component.ts`, add these imports:

```ts
import { PaceCheck, paceChecks } from '../../utils/pace-check';
import { formatRaceTime } from '../../utils/race-time';
```

and add these two methods after the existing `openTodaysSession`:

```ts
  /** The most recent recorded benchmark, for the stats tile. */
  latestCheck(): PaceCheck | null {
    const checks = paceChecks(this.program, (phaseId, weekId, label) =>
      this.tracking.entry(runningTrackingKey(phaseId, weekId, label)).actual ?? ''
    );
    return checks.length ? checks[checks.length - 1] : null;
  }

  formatTime(seconds: number): string {
    return formatRaceTime(seconds);
  }
```

In `running-program.component.html`, change the table binding from `[phases]="program.phases"` to:

```html
      [program]="program"
```

and add this tile at the end of the `<div class="stats-row">`, after the "jours avant le semi" tile:

```html
    @if (latestCheck(); as check) {
      <div class="stat-tile stat-tile--running">
        <span class="stat-tile__icon"><app-icon name="trending-up" [size]="16" /></span>
        <div>
          <div class="stat-tile__value">{{ formatTime(check.halfSeconds) }}</div>
          <div class="stat-tile__label">à l'allure du test {{ check.distanceKm }} km</div>
        </div>
      </div>
    }
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: PASS — 82 specs total, 0 failures. The three existing running-page tests that scope
selectors to `.weeks-table` must still pass.

- [ ] **Step 5: Check it in the real app**

Run: `npx ng build --configuration production`
Expected: build succeeds, no style-budget warning.

Then with the dev server running, on `/running`:
1. Type something in a "réel" field, reload the page, confirm it is still there.
2. Open the "3 – Prépa spécifique" tab, find week S13's `10 km allure semi (4'07) – test`, enter
   `42'05`, and confirm the row shows `+55 s sur la cible` and `à cette allure : 1h27'55`.
3. Confirm a stat tile appears at the top showing `1h27'55`.
4. Enter `41'10` instead and confirm it reads `pile sur la cible`.

- [ ] **Step 6: Commit**

```bash
git add src/app/pages/running-program/
git commit -m "Record actuals on running sessions and check benchmark pace"
```

---

## Notes for the implementer

- The table's `phases` input becomes `program`; the `phases` getter keeps the template unchanged
  apart from that one binding.
- `paceCheck()` is called from the template and reads `tracking.entry(...)`, so it re-evaluates when
  a value is recorded — no manual refresh needed.
- The gap is green when on or ahead of target and amber (`--color-current`) when behind, reusing the
  palette rather than introducing new colors.
- `.cell-actual` and `.pace-check` sit inside the table cell but outside `.cell-check`, so the
  checkbox row keeps its own flex layout.
