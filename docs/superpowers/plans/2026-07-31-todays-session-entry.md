# Today's Session Quick Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Get from app launch to the rep counter for today's running session in one tap, with a "Semaine en cours" card as the fallback when today's session cannot be resolved.

**Architecture:** A pure function resolves today's session from the programme data using two rules (day name in the label, then position within a three-session phase). The running page reads a `?session=today` query parameter and opens the counter sheet directly; a card at the top of the page lists the current week's sessions as the fallback.

**Tech Stack:** Angular 19 standalone components, signals, SCSS, Jasmine + Karma.

## Global Constraints

- Angular 19, standalone components only, no NgModules.
- State via signals; `TrackingService` is the single source of truth for progress.
- Plain SCSS from the CSS custom properties in `src/styles.scss` — no new colors.
- Per-component style budget: 4kB warning / 8kB error (`angular.json`).
- All user-facing copy in French.
- Functions that depend on the current date take an optional `Date` last parameter defaulting to
  `new Date()`, matching `daysUntil` and `guessCurrentRunningWeekId`. Tests must pass a fixed date
  rather than depending on the day they run.
- Test command (single run, headless): `npx ng test --watch=false --browsers=ChromeHeadless`
- Baseline is green: 53 specs pass before this plan starts.
- Work happens on the existing `feature/interval-rep-counter` branch.

---

### Task 1: Resolve today's session

**Files:**
- Create: `src/app/utils/todays-session.ts`
- Test: `src/app/utils/todays-session.spec.ts`

**Interfaces:**
- Consumes: `guessCurrentRunningWeekId(program, todayInput?)` from `src/app/utils/date-guess.ts`; the `RunningProgram` and `RunningWeekSession` types from `src/app/data/models.ts`.
- Produces:
  - `interface TodaysSession { phaseId: string; weekId: string; label: string; content: string; }`
  - `resolveTodaysSession(program: RunningProgram, todayInput?: Date): TodaysSession | null`

Reference dates used below — 2026-07-12 is a Sunday, so every plan week starts on a Monday:
`2026-06-15` Mon and `2026-06-20` Sat are in S1 (phase 1, three sessions whose labels name days);
`2026-08-10` Mon is in S9 (phase 3, four sessions, labels without day names);
`2026-10-19` Mon and `2026-10-21` Wed are in S19 (phase 4, three sessions, labels without day names).

- [ ] **Step 1: Write the failing test**

Create `src/app/utils/todays-session.spec.ts`:

```ts
import { RUNNING_PROGRAM } from '../data/running-program.data';
import { resolveTodaysSession } from './todays-session';

describe('resolveTodaysSession', () => {
  it('matches the day named in a phase 1 label', () => {
    const session = resolveTodaysSession(RUNNING_PROGRAM, new Date(2026, 5, 15));
    expect(session?.weekId).toBe('S1');
    expect(session?.phaseId).toBe('base-aerobie');
    expect(session?.label).toBe('Séance 1 – Endurance (lundi)');
    expect(session?.content).toBe('40 min EF');
  });

  it('resolves Wednesday to the quality session', () => {
    const session = resolveTodaysSession(RUNNING_PROGRAM, new Date(2026, 5, 17));
    expect(session?.label).toBe('Séance 2 – Qualité (mercredi/jeudi)');
    expect(session?.content).toBe("6×3 min allure 10 km (3'58) récup 2'");
  });

  it('resolves Thursday to the quality session too, via the alternate day in the label', () => {
    const session = resolveTodaysSession(RUNNING_PROGRAM, new Date(2026, 5, 18));
    expect(session?.label).toBe('Séance 2 – Qualité (mercredi/jeudi)');
  });

  it('resolves Saturday to the long run, via the alternate day in the label', () => {
    const session = resolveTodaysSession(RUNNING_PROGRAM, new Date(2026, 5, 20));
    expect(session?.label).toBe('Séance 3 – Sortie longue (vendredi/samedi)');
  });

  it('returns null on a day with no run', () => {
    expect(resolveTodaysSession(RUNNING_PROGRAM, new Date(2026, 5, 16))).toBeNull();
    expect(resolveTodaysSession(RUNNING_PROGRAM, new Date(2026, 5, 21))).toBeNull();
  });

  it('returns null in phase 3, where four sessions run in a different order', () => {
    expect(resolveTodaysSession(RUNNING_PROGRAM, new Date(2026, 7, 10))).toBeNull();
  });

  it('falls back to position for phase 4, whose labels do not name days', () => {
    const monday = resolveTodaysSession(RUNNING_PROGRAM, new Date(2026, 9, 19));
    expect(monday?.weekId).toBe('S19');
    expect(monday?.phaseId).toBe('affutage');
    expect(monday?.label).toBe('Séance 1');
    expect(monday?.content).toBe('45 min EF');
  });

  it('maps Wednesday to the second session by position in phase 4', () => {
    const wednesday = resolveTodaysSession(RUNNING_PROGRAM, new Date(2026, 9, 21));
    expect(wednesday?.label).toBe('Séance 2');
    expect(wednesday?.content).toBe("3×2000 m à 4'00 récup 2'");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: FAIL — the build cannot resolve `./todays-session`.

- [ ] **Step 3: Write the minimal implementation**

Create `src/app/utils/todays-session.ts`:

```ts
import { RunningProgram, RunningWeekSession } from '../data/models';
import { guessCurrentRunningWeekId } from './date-guess';

export interface TodaysSession {
  phaseId: string;
  weekId: string;
  label: string;
  content: string;
}

/** Lowercase French day names indexed by Date#getDay(), for matching against session labels. */
const DAY_NAMES = [
  'dimanche',
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
] as const;

/**
 * Session index for a day, used only when a phase has exactly three sessions in the
 * usual order: endurance, qualité, sortie longue.
 */
const POSITION_BY_DAY: Record<string, number> = {
  lundi: 0,
  mercredi: 1,
  jeudi: 1,
  vendredi: 2,
  samedi: 2,
};

function toResult(
  phaseId: string,
  weekId: string,
  session: RunningWeekSession
): TodaysSession {
  return { phaseId, weekId, label: session.label, content: session.content };
}

/**
 * Today's running session, or null when it cannot be determined without guessing.
 *
 * Two rules, in order: the day named in the session label (phases 1-2, which also spell out
 * the alternate days), then position within a three-session phase (phase 4, whose labels are
 * silent). Phase 3 has four sessions in a different order, so it resolves to null rather than
 * risk opening the wrong session mid-effort — as do days with no run.
 */
export function resolveTodaysSession(
  program: RunningProgram,
  todayInput: Date = new Date()
): TodaysSession | null {
  const day = DAY_NAMES[todayInput.getDay()];
  const weekId = guessCurrentRunningWeekId(program, todayInput);
  const phase = program.phases.find((p) => p.weeks.some((w) => w.id === weekId));
  const week = phase?.weeks.find((w) => w.id === weekId);
  if (!phase || !week) {
    return null;
  }

  const byLabel = week.sessions.find((s) => s.label.toLowerCase().includes(day));
  if (byLabel) {
    return toResult(phase.id, week.id, byLabel);
  }

  const position = POSITION_BY_DAY[day];
  if (week.sessions.length === 3 && position !== undefined) {
    return toResult(phase.id, week.id, week.sessions[position]);
  }

  return null;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: PASS — 61 specs total, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add src/app/utils/todays-session.ts src/app/utils/todays-session.spec.ts
git commit -m "Resolve today's running session from the programme data"
```

---

### Task 2: Quick entry and the current-week card

**Files:**
- Modify: `src/app/pages/running-program/running-program.component.ts`
- Modify: `src/app/pages/running-program/running-program.component.html` (add the card above the `id="phases"` card)
- Modify: `src/app/pages/running-program/running-program.component.scss`
- Modify: `src/app/pages/weekly-overview/weekly-overview.component.html` (the running day tag)
- Test: `src/app/pages/running-program/running-program.component.spec.ts` (existing file, add cases)

**Interfaces:**
- Consumes: `resolveTodaysSession(program, todayInput?)` and `TodaysSession` (Task 1); the existing `parseRepCount`, `openCounter(phaseId, weekId, session)`, `repCount(content)`, `doneReps(phaseId, weekId, label)`, `trackingKey(...)` and `openSession` signal on the component; the `.cell-session`, `.cell-session--plain`, `.rep-badge` and `.current-chip` CSS classes already defined.
- Produces: nothing consumed by later tasks — this is the final task.

Note on testability: `openTodaysSession(todayInput?: Date)` is public and takes an optional date. It is a genuine user-facing action, and the optional date keeps its test independent of the day it runs — today (Friday) resolves to a long run with no repetitions, so a test relying on the real clock would assert the opposite of what it does on a Wednesday. The one-line query-parameter read in the constructor is covered by the browser check in Step 5.

- [ ] **Step 1: Write the failing tests**

Add these cases at the end of the `describe('RunningProgramComponent', ...)` block in `src/app/pages/running-program/running-program.component.spec.ts`:

```ts
  it('lists the current week sessions in the Semaine en cours card', async () => {
    const fixture = await setup();
    const currentWeekId = guessCurrentRunningWeekId(RUNNING_PROGRAM);
    const phase = RUNNING_PROGRAM.phases.find((p) => p.weeks.some((w) => w.id === currentWeekId))!;
    const week = phase.weeks.find((w) => w.id === currentWeekId)!;

    const card = fixture.nativeElement.querySelector('.week-card');
    expect(card).toBeTruthy();
    expect(card.textContent).toContain(currentWeekId);
    expect(card.textContent).toContain(week.dateRange);
    for (const session of week.sessions) {
      expect(card.textContent).toContain(session.label);
    }
  });

  it('opens the counter from a card row that has repetitions', async () => {
    const fixture = await setup();
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.week-card button.cell-session'
    );
    expect(trigger).toBeTruthy();

    trigger.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-rep-counter-sheet')).toBeTruthy();
  });

  it('renders no sheet on a plain visit', async () => {
    const fixture = await setup();
    expect(fixture.nativeElement.querySelector('app-rep-counter-sheet')).toBeNull();
  });

  it('opens the sheet for today when today has repetitions', async () => {
    const fixture = await setup();
    // Wednesday 2026-06-17 is in S1: "6×3 min allure 10 km (3'58) récup 2'" → 6 repetitions.
    fixture.componentInstance.openTodaysSession(new Date(2026, 5, 17));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-rep-counter-sheet')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.sheet__detail').textContent).toContain('6×3 min');
    expect(fixture.nativeElement.querySelector('.sheet__count-total').textContent).toContain('6');
  });

  it('opens nothing for a day whose session has no repetitions', async () => {
    const fixture = await setup();
    // Monday 2026-06-15 is in S1: "40 min EF" — nothing to count.
    fixture.componentInstance.openTodaysSession(new Date(2026, 5, 15));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-rep-counter-sheet')).toBeNull();
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: FAIL — `.week-card` does not exist, and `openTodaysSession` is not a function on the component.

- [ ] **Step 3: Write the minimal implementation**

In `src/app/pages/running-program/running-program.component.ts`, add to the imports at the top:

```ts
import { resolveTodaysSession } from '../../utils/todays-session';
```

Add this module-level helper just below the existing `phaseIdForWeek` function:

```ts
function weekById(program: typeof RUNNING_PROGRAM, weekId: string) {
  const phase = program.phases.find((p) => p.weeks.some((w) => w.id === weekId));
  const week = phase?.weeks.find((w) => w.id === weekId);
  return phase && week ? { phaseId: phase.id, week } : null;
}
```

Add these two fields immediately after the existing `openSession` signal:

```ts
  readonly currentWeek = weekById(this.program, this.currentWeekId);
  readonly todaysSessionLabel = resolveTodaysSession(this.program)?.label ?? null;
```

Replace the existing constructor with:

```ts
  constructor() {
    if (this.route.snapshot.fragment === 'phases') {
      this.highlightCurrentWeek.set(true);
      setTimeout(() => this.highlightCurrentWeek.set(false), 2200);
    }
    if (this.route.snapshot.queryParamMap.get('session') === 'today') {
      this.openTodaysSession();
    }
  }
```

Add this method after the existing `openCounter` method:

```ts
  /** Opens the counter for today's session, when it can be resolved and has repetitions. */
  openTodaysSession(todayInput: Date = new Date()): void {
    const today = resolveTodaysSession(this.program, todayInput);
    if (!today) {
      return;
    }
    const total = parseRepCount(today.content);
    if (total === null) {
      return;
    }
    this.openSession.set({
      phaseId: today.phaseId,
      weekId: today.weekId,
      label: today.label,
      content: today.content,
      total,
    });
  }
```

In `src/app/pages/running-program/running-program.component.html`, insert this card immediately before the line `<div class="card" id="phases">`:

```html
  @if (currentWeek; as current) {
    <div class="card week-card">
      <h2>Semaine en cours — {{ current.week.id }}</h2>
      <p class="week-card__range">{{ current.week.dateRange }}</p>

      <ul class="week-card__list">
        @for (session of current.week.sessions; track session.label) {
          <li class="week-card__item" [class.is-today]="session.label === todaysSessionLabel">
            <div class="week-card__label">
              {{ session.label }}
              @if (session.label === todaysSessionLabel) {
                <span class="current-chip">Aujourd'hui</span>
              }
            </div>
            @if (repCount(session.content); as total) {
              <button
                type="button"
                class="cell-session"
                (click)="openCounter(current.phaseId, current.week.id, session)"
              >
                {{ session.content }}
                <span class="rep-badge"
                  >{{ doneReps(current.phaseId, current.week.id, session.label) }}/{{ total }}</span
                >
              </button>
            } @else {
              <span class="cell-session cell-session--plain">{{ session.content }}</span>
            }
          </li>
        }
      </ul>
    </div>
  }
```

In `src/app/pages/running-program/running-program.component.scss`, append:

```scss
.week-card {
  &__range {
    margin: -6px 0 16px;
    color: var(--color-text-muted);
    font-size: 0.85rem;
  }

  &__list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__item {
    padding: 12px 0;
    border-bottom: 1px solid var(--color-border-subtle);

    &:last-child {
      border-bottom: none;
    }

    &.is-today {
      padding-left: 12px;
      box-shadow: inset 3px 0 0 var(--color-current-border);
    }
  }

  &__label {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 4px;
    font-weight: 600;
    font-size: 0.84rem;
    color: var(--color-text-muted);
  }
}
```

In `src/app/pages/weekly-overview/weekly-overview.component.html`, add the query parameter to the running day tag, so it reads:

```html
              <a
                class="tag tag--block tag--running"
                routerLink="/running"
                fragment="phases"
                [queryParams]="{ session: 'today' }"
              >
                <app-icon name="running" [size]="13" />
                Course
              </a>
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: PASS — 66 specs total, 0 failures.

- [ ] **Step 5: Check it in the real app**

Run: `npx ng build --configuration production`
Expected: build succeeds with no style-budget warning.

Then with the dev server running (`npm start`), at a phone width in the browser's responsive mode:
1. On the dashboard, tap "Course" on a day that has one. The running page opens with the
   "Semaine en cours" card at the top; if today is Wednesday or Thursday the counter sheet opens
   straight away, and on other days it does not (today, Friday, is a long run with nothing to count).
2. Navigate to `/running` directly from the nav bar — no sheet should open.
3. Tap a card row that shows a badge and confirm the counter opens and increments.

- [ ] **Step 6: Commit**

```bash
git add src/app/pages/
git commit -m "Open today's session counter in one tap from the dashboard"
```

---

## Notes for the implementer

- `weekById` returns `null` only if `guessCurrentRunningWeekId` yields an id absent from the
  programme, which cannot happen with the current data — the guard exists so the template can use
  `@if (currentWeek; as current)` without non-null assertions.
- The card reuses `.cell-session`, `.cell-session--plain` and `.rep-badge` from the rep counter work,
  so its rows look and behave exactly like the table cells.
- `todaysSessionLabel` compares labels, not object identity, because the card iterates the week's
  own session objects while `resolveTodaysSession` returns a flattened copy. Labels are unique
  within a week in the current data.
- Do not add a sheet-opening check that runs on every visit to `/running`; the query parameter is
  what distinguishes "I am mid-session" from "I am reading the programme".
