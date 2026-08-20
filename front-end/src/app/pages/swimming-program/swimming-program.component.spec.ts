import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SwimmingProgramComponent } from './swimming-program.component';
import { SWIMMING_PROGRAM } from '../../data/swimming-program.data';
import { guessCurrentSwimPhaseId } from '../../utils/date-guess';

describe('SwimmingProgramComponent', () => {
  async function setup() {
    await TestBed.configureTestingModule({
      imports: [SwimmingProgramComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(SwimmingProgramComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders equipment, technique keys, and all 4 phases', async () => {
    const fixture = await setup();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Pull-buoy');
    expect(compiled.textContent).toContain('Alignement horizontal');
    expect(compiled.querySelectorAll('.phase-block').length).toBe(4);
  });

  it("highlights today's guessed current phase", async () => {
    const fixture = await setup();
    const currentPhaseId = guessCurrentSwimPhaseId(SWIMMING_PROGRAM);
    const phase = SWIMMING_PROGRAM.phases.find((p) => p.id === currentPhaseId)!;

    const current = fixture.nativeElement.querySelector('.phase-block.is-current-phase');
    expect(current).toBeTruthy();
    expect(current.textContent).toContain(phase.title);
    expect(current.textContent).toContain('Actuelle');
  });
});
