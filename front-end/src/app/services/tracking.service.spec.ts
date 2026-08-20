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

  it('clears done for every key under a prefix, leaving other prefixes alone', () => {
    service.setDone('strength:pecs-triceps:dev-couche:S1', true);
    service.setDone('strength:pecs-triceps:dips:S2', true);
    service.setDone('strength:jambes:squat:S1', true);

    service.clearDone('strength:pecs-triceps:');

    expect(service.entry('strength:pecs-triceps:dev-couche:S1').done).toBeFalse();
    expect(service.entry('strength:pecs-triceps:dips:S2').done).toBeFalse();
    expect(service.entry('strength:jambes:squat:S1').done).toBeTrue();
  });

  it('keeps recorded actuals and rep counts when clearing done', () => {
    service.setDone('strength:pecs-triceps:dev-couche:S1', true);
    service.setActual('strength:pecs-triceps:dev-couche:S1', '5x82kg');
    service.setReps('strength:pecs-triceps:dev-couche:S1', 3);

    service.clearDone('strength:pecs-triceps:');

    const entry = service.entry('strength:pecs-triceps:dev-couche:S1');
    expect(entry.done).toBeFalse();
    expect(entry.actual).toBe('5x82kg');
    expect(entry.reps).toBe(3);
  });

  it('persists a cleared prefix across service instances', () => {
    service.setDone('strength:pecs-triceps:dev-couche:S1', true);
    service.clearDone('strength:pecs-triceps:');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const reloaded = TestBed.inject(TrackingService);
    expect(reloaded.entry('strength:pecs-triceps:dev-couche:S1').done).toBeFalse();
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
