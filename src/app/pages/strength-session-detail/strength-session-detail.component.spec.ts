import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { StrengthSessionDetailComponent } from './strength-session-detail.component';

function activatedRouteStub(sessionId: string) {
  return {
    snapshot: { paramMap: convertToParamMap({ sessionId }) },
    paramMap: of(convertToParamMap({ sessionId })),
  };
}

describe('StrengthSessionDetailComponent', () => {
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
});
