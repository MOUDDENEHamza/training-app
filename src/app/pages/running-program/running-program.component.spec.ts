import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RunningProgramComponent } from './running-program.component';
import { RUNNING_PROGRAM } from '../../data/running-program.data';
import { guessCurrentRunningWeekId } from '../../utils/date-guess';

describe('RunningProgramComponent', () => {
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
});
