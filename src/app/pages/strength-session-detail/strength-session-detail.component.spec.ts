import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { StrengthSessionDetailComponent } from './strength-session-detail.component';
import { TrackingService } from '../../services/tracking.service';

function activatedRouteStub(sessionId: string) {
  return {
    snapshot: { paramMap: convertToParamMap({ sessionId }) },
    paramMap: of(convertToParamMap({ sessionId })),
  };
}

async function setup(sessionId: string) {
  await TestBed.configureTestingModule({
    imports: [StrengthSessionDetailComponent],
    providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: activatedRouteStub(sessionId) },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(StrengthSessionDetailComponent);
  fixture.detectChanges();
  return fixture;
}

describe('StrengthSessionDetailComponent', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());
  it('renders the session name and exercises for a known id', async () => {
    await TestBed.configureTestingModule({
      imports: [StrengthSessionDetailComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteStub('pecs-triceps') },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(StrengthSessionDetailComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Pecs + Triceps');
    expect(compiled.textContent).toContain('Dév. couché barre');
  });

  it('links back to the full strength program overview', async () => {
    await TestBed.configureTestingModule({
      imports: [StrengthSessionDetailComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteStub('dos-biceps') },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(StrengthSessionDetailComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('a.overview-link')?.getAttribute('href')).toBe('/strength');
  });

  it('asks for confirmation before unticking, so one stray tap changes nothing', async () => {
    const fixture = await setup('pecs-triceps');
    const tracking = TestBed.inject(TrackingService);
    const checkbox: HTMLInputElement = fixture.nativeElement.querySelector(
      '.cell__planned input[type="checkbox"]'
    );
    checkbox.click();
    fixture.detectChanges();
    expect(checkbox.checked).toBeTrue();

    const reset: HTMLButtonElement = fixture.nativeElement.querySelector('.reset-done');
    reset.click();
    fixture.detectChanges();

    expect(checkbox.checked).toBeTrue();
    expect(fixture.nativeElement.querySelector('.reset-done').textContent).toContain('Confirmer');
    expect(tracking).toBeTruthy();
  });

  it('unticks every box of the session on the second tap', async () => {
    const fixture = await setup('pecs-triceps');
    const boxes: HTMLInputElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.cell__planned input[type="checkbox"]')
    );
    boxes[0].click();
    boxes[1].click();
    fixture.detectChanges();
    expect(boxes.filter((b) => b.checked).length).toBe(2);

    fixture.nativeElement.querySelector('.reset-done').click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.reset-done').click();
    fixture.detectChanges();

    expect(boxes.filter((b) => b.checked).length).toBe(0);
    expect(fixture.nativeElement.querySelector('.reset-done').textContent).toContain('Décocher');
  });

  it('leaves another session untouched', async () => {
    const fixture = await setup('pecs-triceps');
    const tracking = TestBed.inject(TrackingService);
    tracking.setDone('strength:jambes:squat-barre:S1', true);

    fixture.nativeElement.querySelector('.reset-done').click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.reset-done').click();
    fixture.detectChanges();

    expect(tracking.entry('strength:jambes:squat-barre:S1').done).toBeTrue();
  });
});
