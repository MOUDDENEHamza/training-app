# Interval Rep Counter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the athlete tap a large "Répétition faite" button during an interval session so they never lose count of how many repetitions they have done.

**Architecture:** A pure parser reads the repetition count out of the existing session text (`5×1000 m à 4'00` → 5). `TrackingService` gains a `reps` field alongside the existing `done` flag, persisted to `localStorage` under the running page's existing key scheme. A presentational bottom-sheet component renders the counter and emits intent; the running page owns the state and writes to the service.

**Tech Stack:** Angular 19 standalone components, signals, SCSS, Jasmine + Karma.

## Global Constraints

- Angular 19, standalone components only, no NgModules.
- State via signals; `TrackingService` is the single source of truth for progress.
- Plain SCSS, styled from the CSS custom properties in `src/styles.scss` — no new colors.
- Per-component style budget: 4kB warning / 8kB error (`angular.json`).
- All user-facing copy in French.
- No backend; everything persists to `localStorage` key `training-app:tracking`.
- Test command (single run, headless): `npx ng test --watch=false --browsers=ChromeHeadless`
- Baseline is green: 30 specs pass before this plan starts.

---

### Task 1: Repetition-count parser

**Files:**
- Create: `src/app/utils/rep-count.ts`
- Test: `src/app/utils/rep-count.spec.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `parseRepCount(content: string): number | null` — returns the repetition count found in a session's `content` string, or `null` when the session has no repetitions.

- [ ] **Step 1: Write the failing test**

Create `src/app/utils/rep-count.spec.ts`:

```ts
import { parseRepCount } from './rep-count';

describe('parseRepCount', () => {
  it('reads the count from a distance interval session', () => {
    expect(parseRepCount("5×1000 m à 4'00 récup 1'30")).toBe(5);
  });

  it('reads the count from a time interval session', () => {
    expect(parseRepCount("2×15 min seuil (4'10) récup 4'")).toBe(2);
  });

  it('reads a two-digit count', () => {
    expect(parseRepCount("12×400 m à 3'50 récup 1'")).toBe(12);
  });

  it('finds the pattern after a warm-up prefix', () => {
    expect(parseRepCount("20 min footing + 4×400 m à 4'07 récup 1'30")).toBe(4);
  });

  it('accepts an ASCII x as well as the multiplication sign', () => {
    expect(parseRepCount('8x400 m')).toBe(8);
  });

  it('tolerates spaces around the separator', () => {
    expect(parseRepCount('6 × 1000 m')).toBe(6);
  });

  it('takes the first pattern when several are present', () => {
    expect(parseRepCount('3×1000 m puis 2×400 m')).toBe(3);
  });

  it('returns null for a continuous run', () => {
    expect(parseRepCount('40 min EF')).toBeNull();
  });

  it('returns null for a composite session with no repetitions', () => {
    expect(parseRepCount('1h30 [1h10 EF + 20 min AM + fin EF]')).toBeNull();
  });

  it('returns null when a separator is not followed by a number', () => {
    expect(parseRepCount('45 min EF + 6 lignes droites')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: FAIL — the build cannot resolve `./rep-count`.

- [ ] **Step 3: Write the minimal implementation**

Create `src/app/utils/rep-count.ts`:

```ts
/**
 * Reads the repetition count out of a session's text, e.g. "5×1000 m à 4'00" → 5.
 * Returns null when the session has no repetitions ("40 min EF").
 *
 * The separator must be followed by a digit, so a stray "x" in prose
 * ("6 lignes droites") does not read as a repetition count.
 */
export function parseRepCount(content: string): number | null {
  const match = content.match(/(\d+)\s*[×x]\s*\d/);
  if (!match) {
    return null;
  }
  const count = Number(match[1]);
  return count > 0 ? count : null;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: PASS — 40 specs total, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add src/app/utils/rep-count.ts src/app/utils/rep-count.spec.ts
git commit -m "Add a parser for repetition counts in session text"
```

---

### Task 2: Store the rep count in TrackingService

**Files:**
- Modify: `src/app/services/tracking.service.ts`
- Test: `src/app/services/tracking.service.spec.ts` (existing file, add cases)

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces:
  - `TrackingEntry` gains `reps?: number`.
  - `setReps(key: string, reps: number): void`
  - `setDone(key: string, done: boolean): void` — needed because the counter must set `done` to a specific value, which the existing `toggleDone` cannot do.
  - `toggleDone(key: string): void` keeps its current behaviour and signature.

- [ ] **Step 1: Write the failing tests**

Add these cases inside the existing `describe('TrackingService', ...)` block in `src/app/services/tracking.service.spec.ts`, after the `'stores an actual value without affecting the done state'` test:

```ts
  it('stores a rep count without affecting the done state', () => {
    service.setReps('running:developpement:S5:Séance 2', 3);
    const entry = service.entry('running:developpement:S5:Séance 2');
    expect(entry.reps).toBe(3);
    expect(entry.done).toBeFalse();
  });

  it('sets the done state explicitly in both directions', () => {
    service.setDone('running:developpement:S5:Séance 2', true);
    expect(service.entry('running:developpement:S5:Séance 2').done).toBeTrue();

    service.setDone('running:developpement:S5:Séance 2', false);
    expect(service.entry('running:developpement:S5:Séance 2').done).toBeFalse();
  });

  it('persists the rep count across service instances', () => {
    service.setReps('running:developpement:S5:Séance 2', 4);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const reloaded = TestBed.inject(TrackingService);
    expect(reloaded.entry('running:developpement:S5:Séance 2').reps).toBe(4);
  });

  it('reads an entry stored before reps existed as having no reps', () => {
    localStorage.setItem(
      'training-app:tracking',
      JSON.stringify({ 'legacy:key': { done: true, actual: '42 min' } })
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const reloaded = TestBed.inject(TrackingService);
    const entry = reloaded.entry('legacy:key');
    expect(entry.done).toBeTrue();
    expect(entry.actual).toBe('42 min');
    expect(entry.reps).toBeUndefined();
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: FAIL — TypeScript compile error, `setReps` and `setDone` do not exist on `TrackingService`.

- [ ] **Step 3: Write the minimal implementation**

In `src/app/services/tracking.service.ts`, add `reps` to the interface:

```ts
export interface TrackingEntry {
  done: boolean;
  actual?: string;
  reps?: number;
}
```

Then replace the existing `toggleDone` method with these three methods (leave `entry` and `setActual` untouched):

```ts
  toggleDone(key: string): void {
    this.setDone(key, !this.entry(key).done);
  }

  setDone(key: string, done: boolean): void {
    const current = this.entry(key);
    this.state.update((s) => ({ ...s, [key]: { ...current, done } }));
    safePersist(this.state());
  }

  setReps(key: string, reps: number): void {
    const current = this.entry(key);
    this.state.update((s) => ({ ...s, [key]: { ...current, reps } }));
    safePersist(this.state());
  }
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: PASS — 44 specs total, 0 failures. The pre-existing `toggleDone` test must still pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/services/tracking.service.ts src/app/services/tracking.service.spec.ts
git commit -m "Track a per-session repetition count"
```

---

### Task 3: Rep counter sheet component

**Files:**
- Create: `src/app/shared/rep-counter-sheet/rep-counter-sheet.component.ts`
- Create: `src/app/shared/rep-counter-sheet/rep-counter-sheet.component.html`
- Create: `src/app/shared/rep-counter-sheet/rep-counter-sheet.component.scss`
- Test: `src/app/shared/rep-counter-sheet/rep-counter-sheet.component.spec.ts`

**Interfaces:**
- Consumes: nothing from Tasks 1-2. This component injects no service.
- Produces: `RepCounterSheetComponent`, selector `app-rep-counter-sheet`.
  - Inputs: `label: string`, `detail: string`, `total: number`, `count: number`.
  - Outputs: `increment: EventEmitter<void>`, `undo: EventEmitter<void>`, `closed: EventEmitter<void>`.
  - Note: the input is named `label` (not `title`) to avoid colliding with the native `title` attribute, and the output is `closed` (not `close`) to avoid colliding with the native `close` event.
  - CSS hooks relied on by Task 4's test: `.sheet__primary`, `.sheet__undo`, `.sheet__count-done`.

- [ ] **Step 1: Write the failing test**

Create `src/app/shared/rep-counter-sheet/rep-counter-sheet.component.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { RepCounterSheetComponent } from './rep-counter-sheet.component';

describe('RepCounterSheetComponent', () => {
  async function setup(count: number, total: number) {
    await TestBed.configureTestingModule({
      imports: [RepCounterSheetComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(RepCounterSheetComponent);
    fixture.componentInstance.label = 'Séance 2 – Qualité (mercredi/jeudi)';
    fixture.componentInstance.detail = "5×1000 m à 4'00 récup 1'30";
    fixture.componentInstance.total = total;
    fixture.componentInstance.count = count;
    fixture.detectChanges();
    return fixture;
  }

  it('renders the label, the detail and the count against the total', async () => {
    const fixture = await setup(3, 5);
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Séance 2 – Qualité (mercredi/jeudi)');
    expect(text).toContain("5×1000 m à 4'00 récup 1'30");
    expect(fixture.nativeElement.querySelector('.sheet__count-done').textContent.trim()).toBe('3');
    expect(text).toContain('/ 5');
  });

  it('emits increment when the primary button is pressed', async () => {
    const fixture = await setup(2, 5);
    let emitted = false;
    fixture.componentInstance.increment.subscribe(() => (emitted = true));
    fixture.nativeElement.querySelector('.sheet__primary').click();
    expect(emitted).toBeTrue();
  });

  it('disables the primary button once every repetition is done', async () => {
    const fixture = await setup(5, 5);
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.sheet__primary');
    expect(button.disabled).toBeTrue();
    expect(button.textContent).toContain('Séance terminée');
  });

  it('emits undo when the undo button is pressed', async () => {
    const fixture = await setup(2, 5);
    let emitted = false;
    fixture.componentInstance.undo.subscribe(() => (emitted = true));
    fixture.nativeElement.querySelector('.sheet__undo').click();
    expect(emitted).toBeTrue();
  });

  it('disables undo when no repetition has been done yet', async () => {
    const fixture = await setup(0, 5);
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.sheet__undo');
    expect(button.disabled).toBeTrue();
  });

  it('emits closed when the backdrop is clicked', async () => {
    const fixture = await setup(1, 5);
    let emitted = false;
    fixture.componentInstance.closed.subscribe(() => (emitted = true));
    fixture.nativeElement.querySelector('.sheet-backdrop').click();
    expect(emitted).toBeTrue();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: FAIL — the build cannot resolve `./rep-counter-sheet.component`.

- [ ] **Step 3: Write the minimal implementation**

Create `src/app/shared/rep-counter-sheet/rep-counter-sheet.component.ts`:

```ts
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-rep-counter-sheet',
  standalone: true,
  templateUrl: './rep-counter-sheet.component.html',
  styleUrl: './rep-counter-sheet.component.scss',
})
export class RepCounterSheetComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) detail!: string;
  @Input({ required: true }) total!: number;
  @Input({ required: true }) count!: number;

  @Output() increment = new EventEmitter<void>();
  @Output() undo = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  get isComplete(): boolean {
    return this.count >= this.total;
  }
}
```

Create `src/app/shared/rep-counter-sheet/rep-counter-sheet.component.html`:

```html
<div class="sheet-backdrop" (click)="closed.emit()"></div>

<div class="sheet" role="dialog" aria-modal="true" [attr.aria-label]="label">
  <button type="button" class="sheet__close" (click)="closed.emit()" aria-label="Fermer">
    &times;
  </button>

  <p class="sheet__label">{{ label }}</p>
  <p class="sheet__detail">{{ detail }}</p>

  <div class="sheet__count" aria-live="polite">
    <span class="sheet__count-done">{{ count }}</span>
    <span class="sheet__count-total">/ {{ total }}</span>
  </div>

  <button type="button" class="sheet__primary" [disabled]="isComplete" (click)="increment.emit()">
    {{ isComplete ? 'Séance terminée' : 'Répétition faite' }}
  </button>

  <button type="button" class="sheet__undo" [disabled]="count === 0" (click)="undo.emit()">
    Annuler la dernière
  </button>
</div>
```

Create `src/app/shared/rep-counter-sheet/rep-counter-sheet.component.scss`:

```scss
.sheet-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: rgba(20, 22, 26, 0.55);
}

.sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 21;
  max-width: 520px;
  margin: 0 auto;
  padding: 26px 20px calc(22px + env(safe-area-inset-bottom));
  background: var(--color-surface);
  border-top-left-radius: var(--radius-lg);
  border-top-right-radius: var(--radius-lg);
  box-shadow: 0 -8px 40px rgba(20, 22, 26, 0.18);

  &__close {
    position: absolute;
    top: 8px;
    right: 12px;
    border: none;
    background: none;
    font-size: 1.6rem;
    line-height: 1;
    color: var(--color-text-faint);
    cursor: pointer;
  }

  &__label {
    margin: 0;
    font-weight: 600;
    font-size: 0.95rem;
  }

  &__detail {
    margin: 4px 0 20px;
    color: var(--color-text-muted);
    font-size: 0.88rem;
  }

  &__count {
    margin-bottom: 22px;
    text-align: center;
    font-family: var(--font-display);
  }

  &__count-done {
    font-size: 4rem;
    font-weight: 700;
    line-height: 1;
    color: var(--color-running);
  }

  &__count-total {
    margin-left: 6px;
    font-size: 1.5rem;
    color: var(--color-text-faint);
  }

  &__primary {
    width: 100%;
    min-height: 56px;
    border: none;
    border-radius: var(--radius-md);
    background: var(--color-running);
    color: #ffffff;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;

    &:disabled {
      background: var(--color-border);
      color: var(--color-text-faint);
      cursor: default;
    }
  }

  &__undo {
    display: block;
    width: 100%;
    min-height: 44px;
    margin-top: 10px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text-muted);
    font-family: inherit;
    font-size: 0.88rem;
    cursor: pointer;

    &:disabled {
      color: var(--color-text-faint);
      cursor: default;
    }
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: PASS — 50 specs total, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add src/app/shared/rep-counter-sheet/
git commit -m "Add the rep counter bottom sheet component"
```

---

### Task 4: Wire the counter into the running page

**Files:**
- Modify: `src/app/pages/running-program/running-program.component.ts`
- Modify: `src/app/pages/running-program/running-program.component.html:76-87` (the session cell) and the end of the template (mount the sheet)
- Modify: `src/app/pages/running-program/running-program.component.scss`
- Test: `src/app/pages/running-program/running-program.component.spec.ts` (existing file, add cases)

**Interfaces:**
- Consumes: `parseRepCount` (Task 1); `TrackingService.setReps` / `setDone` (Task 2); `RepCounterSheetComponent` with inputs `label`/`detail`/`total`/`count` and outputs `increment`/`undo`/`closed` (Task 3).
- Produces: nothing consumed by later tasks — this is the final task.

- [ ] **Step 1: Write the failing tests**

In `src/app/pages/running-program/running-program.component.spec.ts`, add a `beforeEach` that clears storage so the counter starts from zero, immediately inside the `describe` block and before `setup`:

```ts
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());
```

Then add these cases at the end of the same `describe` block. Both click the first phase tab first, so they do not depend on which phase today's date opens:

```ts
  it('counts repetitions through the sheet for an interval session', async () => {
    const fixture = await setup();
    const tabs: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.phase-tab')
    );
    tabs[0].click();
    fixture.detectChanges();

    // Phase 1 / S1 / séance 2 is "6×3 min allure 10 km (3'58) récup 2'" → 6 repetitions.
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('button.cell-session');
    expect(trigger.textContent).toContain('6×3 min');
    expect(trigger.textContent).toContain('0/6');

    trigger.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-rep-counter-sheet')).toBeTruthy();

    fixture.nativeElement.querySelector('.sheet__primary').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sheet__count-done').textContent.trim()).toBe('1');

    fixture.nativeElement.querySelector('.sheet__undo').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sheet__count-done').textContent.trim()).toBe('0');
  });

  it('marks the session done when the last repetition is counted', async () => {
    const fixture = await setup();
    const tabs: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.phase-tab')
    );
    tabs[0].click();
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button.cell-session').click();
    fixture.detectChanges();

    for (let i = 0; i < 6; i++) {
      fixture.nativeElement.querySelector('.sheet__primary').click();
      fixture.detectChanges();
    }

    const primary: HTMLButtonElement = fixture.nativeElement.querySelector('.sheet__primary');
    expect(primary.disabled).toBeTrue();

    fixture.nativeElement.querySelector('.sheet__close').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-rep-counter-sheet')).toBeNull();

    const checkbox: HTMLInputElement = fixture.nativeElement.querySelectorAll(
      '.cell-check input[type="checkbox"]'
    )[1];
    expect(checkbox.checked).toBeTrue();
  });

  it('shows a continuous session as plain text with no counter', async () => {
    const fixture = await setup();
    const tabs: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.phase-tab')
    );
    tabs[0].click();
    fixture.detectChanges();

    const plain = fixture.nativeElement.querySelector('.cell-session--plain');
    expect(plain.textContent).toContain('40 min EF');
    expect(plain.tagName).toBe('SPAN');
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: FAIL — `button.cell-session` does not exist, so `trigger.textContent` throws on a null reference.

- [ ] **Step 3: Write the minimal implementation**

In `src/app/pages/running-program/running-program.component.ts`, extend the imports at the top of the file:

```ts
import { RunningWeekSession } from '../../data/models';
import { parseRepCount } from '../../utils/rep-count';
import { RepCounterSheetComponent } from '../../shared/rep-counter-sheet/rep-counter-sheet.component';
```

Add this interface just below the existing `phaseIdForWeek` helper:

```ts
interface OpenSession {
  phaseId: string;
  weekId: string;
  label: string;
  content: string;
  total: number;
}
```

Add `RepCounterSheetComponent` to the `imports` array of the `@Component` decorator, so it reads:

```ts
  imports: [RouterLink, IconComponent, RepCounterSheetComponent],
```

Add this field next to the existing `highlightCurrentWeek` signal:

```ts
  readonly openSession = signal<OpenSession | null>(null);
```

Add these methods after the existing `trackingKey` method:

```ts
  repCount(content: string): number | null {
    return parseRepCount(content);
  }

  doneReps(phaseId: string, weekId: string, label: string): number {
    return this.tracking.entry(this.trackingKey(phaseId, weekId, label)).reps ?? 0;
  }

  openCounter(phaseId: string, weekId: string, session: RunningWeekSession): void {
    const total = parseRepCount(session.content);
    if (total === null) {
      return;
    }
    this.openSession.set({
      phaseId,
      weekId,
      label: session.label,
      content: session.content,
      total,
    });
  }

  closeCounter(): void {
    this.openSession.set(null);
  }

  openSessionCount(): number {
    const open = this.openSession();
    return open ? this.doneReps(open.phaseId, open.weekId, open.label) : 0;
  }

  incrementRep(): void {
    this.applyRepDelta(1);
  }

  undoRep(): void {
    this.applyRepDelta(-1);
  }

  /** Moves the open session's rep count by delta, clamped to 0..total, keeping `done` in step. */
  private applyRepDelta(delta: number): void {
    const open = this.openSession();
    if (!open) {
      return;
    }
    const key = this.trackingKey(open.phaseId, open.weekId, open.label);
    const next = Math.min(Math.max(this.openSessionCount() + delta, 0), open.total);
    this.tracking.setReps(key, next);
    this.tracking.setDone(key, next >= open.total);
  }
```

In `src/app/pages/running-program/running-program.component.html`, replace the session cell block (currently lines 76-87) with:

```html
                  @for (session of week.sessions; track session.label) {
                    <td>
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
                            (click)="openCounter(phase.id, week.id, session)"
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
                    </td>
                  }
```

Then mount the sheet by adding this immediately before the final `</div>` that closes `<div class="page">` at the end of the same file:

```html
  @if (openSession(); as open) {
    <app-rep-counter-sheet
      [label]="open.label"
      [detail]="open.content"
      [total]="open.total"
      [count]="openSessionCount()"
      (increment)="incrementRep()"
      (undo)="undoRep()"
      (closed)="closeCounter()"
    />
  }
```

In `src/app/pages/running-program/running-program.component.scss`, append:

```scss
.cell-session {
  display: inline-flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  text-align: left;
  color: var(--color-accent);
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--color-accent) 35%, transparent);
  text-underline-offset: 3px;

  &--plain {
    color: inherit;
    cursor: default;
    text-decoration: none;
  }
}

.rep-badge {
  flex-shrink: 0;
  padding: 1px 7px;
  border-radius: 999px;
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-size: 0.72rem;
  font-weight: 600;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: PASS — 53 specs total, 0 failures.

- [ ] **Step 5: Check it in the real app**

Run: `npx ng build --configuration production`
Expected: build succeeds, no style-budget warning for the new component.

Then start the dev server (`npm start`), open `http://localhost:4200/running`, and in the browser's responsive mode at a phone width: tap an interval session, confirm the sheet opens with a large counter, that "Répétition faite" increments it, that the badge in the table updates after closing, and that reaching the last repetition ticks the session's checkbox.

- [ ] **Step 6: Commit**

```bash
git add src/app/pages/running-program/
git commit -m "Count interval repetitions from the running page"
```

---

## Notes for the implementer

- The session cell was a `<label>` wrapping the checkbox. It becomes a `<div>`: keeping the `<label>` would make a tap on the session text toggle the checkbox as well as open the sheet. The checkbox keeps an explicit `aria-label` since it no longer has a wrapping label to name it.
- `.cell-session--plain` also carries the `.cell-session` class, so tests must select the tappable one with `button.cell-session` rather than `.cell-session`.
- `@if (repCount(...); as total)` treats `null` as falsy and falls through to the plain branch. `parseRepCount` never returns `0`, so no valid count is swallowed by that check.
- Swimming sessions share the `N×` pattern (`8×2L crawl`). Extending the counter there is wiring only — no change to the parser or the sheet — but it is out of scope here.
