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
