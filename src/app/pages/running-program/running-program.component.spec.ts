import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RunningProgramComponent } from './running-program.component';
import { RUNNING_PROGRAM } from '../../data/running-program.data';
import { guessCurrentRunningWeekId } from '../../utils/date-guess';

describe('RunningProgramComponent', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  async function setup() {
    await TestBed.configureTestingModule({
      imports: [RunningProgramComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(RunningProgramComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the pace table and first phase by default', async () => {
    const fixture = await setup();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Allures de référence');
    expect(compiled.textContent).toContain('1 – Base aérobie');
  });

  it('switches phases when a tab is clicked', async () => {
    const fixture = await setup();
    const tabs: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.phase-tab')
    );
    tabs[2].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('3 – Prépa spécifique');
  });

  it("opens on the phase containing today's guessed week, and highlights that row", async () => {
    const fixture = await setup();
    const currentWeekId = guessCurrentRunningWeekId(RUNNING_PROGRAM);
    const phase = RUNNING_PROGRAM.phases.find((p) => p.weeks.some((w) => w.id === currentWeekId))!;

    const activeTab = fixture.nativeElement.querySelector('.phase-tab.is-active');
    expect(activeTab.textContent).toContain(phase.title);

    const currentRow = fixture.nativeElement.querySelector('tr.is-current-week');
    expect(currentRow).toBeTruthy();
    expect(currentRow.textContent).toContain(currentWeekId);
    expect(currentRow.textContent).toContain('Actuelle');
  });

  it('counts repetitions through the sheet for an interval session', async () => {
    const fixture = await setup();
    const tabs: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.phase-tab')
    );
    tabs[0].click();
    fixture.detectChanges();

    // Phase 1 / S1 / séance 2 is "6×3 min allure 10 km (3'58) récup 2'" → 6 repetitions.
    // Scoped to the table: the Semaine en cours card reuses the same classes above it.
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.weeks-table button.cell-session'
    );
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

    fixture.nativeElement.querySelector('.weeks-table button.cell-session').click();
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

    const plain = fixture.nativeElement.querySelector('.weeks-table .cell-session--plain');
    expect(plain.textContent).toContain('40 min EF');
    expect(plain.tagName).toBe('SPAN');
  });

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

  it('still marks today in the current-week card without opening the counter', async () => {
    const fixture = await setup();
    expect(fixture.nativeElement.querySelector('app-rep-counter-sheet')).toBeNull();
    expect(fixture.nativeElement.querySelector('.week-card')).toBeTruthy();
  });
});
