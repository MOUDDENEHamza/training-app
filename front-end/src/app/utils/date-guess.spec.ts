import { RUNNING_PROGRAM } from '../data/running-program.data';
import { SWIMMING_PROGRAM } from '../data/swimming-program.data';
import {
  guessCurrentRunningWeekId,
  guessCurrentSwimPhaseId,
  parseRunningWeekRange,
} from './date-guess';

describe('parseRunningWeekRange', () => {
  it('parses a same-month range', () => {
    const range = parseRunningWeekRange('16-22 juin', 2026);
    expect(range?.start).toEqual(new Date(2026, 5, 16));
    expect(range?.end).toEqual(new Date(2026, 5, 22));
  });

  it('parses a cross-month range', () => {
    const range = parseRunningWeekRange('30 juin-6 juil.', 2026);
    expect(range?.start).toEqual(new Date(2026, 5, 30));
    expect(range?.end).toEqual(new Date(2026, 6, 6));
  });

  it('strips trailing parenthetical notes', () => {
    const range = parseRunningWeekRange('20-26 oct. (J-3 sem.)', 2026);
    expect(range?.start).toEqual(new Date(2026, 9, 20));
    expect(range?.end).toEqual(new Date(2026, 9, 26));
  });
});

describe('guessCurrentRunningWeekId', () => {
  it('picks the week whose range contains today', () => {
    expect(guessCurrentRunningWeekId(RUNNING_PROGRAM, new Date(2026, 6, 12))).toBe('S4');
  });

  it('picks the first week of phase 2 once mid-July is reached', () => {
    expect(guessCurrentRunningWeekId(RUNNING_PROGRAM, new Date(2026, 6, 14))).toBe('S5');
  });

  it('falls back to the nearest week when the date matches no exact range', () => {
    // A date long before the plan starts should resolve to the very first week.
    expect(guessCurrentRunningWeekId(RUNNING_PROGRAM, new Date(2026, 0, 1))).toBe('S1');
  });

  it('still picks the containing week on the last day of that week, regardless of time of day', () => {
    // Regression test: a real `new Date()` carries the current clock time, not midnight.
    // S4 ends on 12 juil.; at 23:00 on the 12th we must still be "in" S4, not fall through
    // to the nearest-start fallback (which would wrongly favor S5 starting the next day).
    expect(guessCurrentRunningWeekId(RUNNING_PROGRAM, new Date(2026, 6, 12, 23, 0))).toBe('S4');
    expect(guessCurrentRunningWeekId(RUNNING_PROGRAM, new Date(2026, 6, 6, 0, 1))).toBe('S4');
  });
});

describe('guessCurrentSwimPhaseId', () => {
  it('falls back to the first phase before the program starts', () => {
    // Swimming starts in July, so June is ahead of every phase.
    expect(guessCurrentSwimPhaseId(SWIMMING_PROGRAM, new Date(2026, 5, 20))).toBe('decouverte');
  });

  it('picks "decouverte" in July', () => {
    expect(guessCurrentSwimPhaseId(SWIMMING_PROGRAM, new Date(2026, 6, 12))).toBe('decouverte');
  });

  it('picks "base-technique" in August', () => {
    expect(guessCurrentSwimPhaseId(SWIMMING_PROGRAM, new Date(2026, 7, 10))).toBe(
      'base-technique'
    );
  });

  it('picks "developpement" in September', () => {
    expect(guessCurrentSwimPhaseId(SWIMMING_PROGRAM, new Date(2026, 8, 5))).toBe('developpement');
  });

  it('picks "prepa-ironman" in November', () => {
    expect(guessCurrentSwimPhaseId(SWIMMING_PROGRAM, new Date(2026, 10, 5))).toBe(
      'prepa-ironman'
    );
  });
});
