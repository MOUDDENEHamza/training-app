import { TestBed } from '@angular/core/testing';
import { TrackingService } from './tracking.service';

describe('TrackingService', () => {
  let service: TrackingService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrackingService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns a default not-done entry for an unknown key', () => {
    expect(service.entry('unknown')).toEqual({ done: false });
  });

  it('toggles the done state of an entry', () => {
    service.toggleDone('strength:pecs-triceps:dev-couche-barre:S1');
    expect(service.entry('strength:pecs-triceps:dev-couche-barre:S1').done).toBeTrue();

    service.toggleDone('strength:pecs-triceps:dev-couche-barre:S1');
    expect(service.entry('strength:pecs-triceps:dev-couche-barre:S1').done).toBeFalse();
  });

  it('stores an actual value without affecting the done state', () => {
    service.setActual('strength:jambes:squat-barre:S1', '5x82kg');
    const entry = service.entry('strength:jambes:squat-barre:S1');
    expect(entry.actual).toBe('5x82kg');
    expect(entry.done).toBeFalse();
  });

  it('persists entries to localStorage across service instances', () => {
    service.toggleDone('running:base-aerobie:S1:Endurance');
    service.setActual('running:base-aerobie:S1:Endurance', '42 min');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const reloaded = TestBed.inject(TrackingService);
    const entry = reloaded.entry('running:base-aerobie:S1:Endurance');
    expect(entry.done).toBeTrue();
    expect(entry.actual).toBe('42 min');
  });
});
