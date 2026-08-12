import { RUNNING_PROGRAM } from '../data/running-program.data';
import { resolveTodaysSession } from './todays-session';

describe('resolveTodaysSession', () => {
  it('matches the day named in a phase 1 label', () => {
    const session = resolveTodaysSession(RUNNING_PROGRAM, new Date(2026, 5, 15));
    expect(session?.weekId).toBe('S1');
    expect(session?.phaseId).toBe('base-aerobie');
    expect(session?.label).toBe('Séance 1 – Endurance (lundi)');
    expect(session?.content).toBe('40 min EF');
  });

  it('resolves Wednesday to the quality session', () => {
    const session = resolveTodaysSession(RUNNING_PROGRAM, new Date(2026, 5, 17));
    expect(session?.label).toBe('Séance 2 – Qualité (mercredi/jeudi)');
    expect(session?.content).toBe("6×3 min allure 10 km (3'58) récup 2'");
  });

  it('resolves Thursday to the quality session too, via the alternate day in the label', () => {
    const session = resolveTodaysSession(RUNNING_PROGRAM, new Date(2026, 5, 18));
    expect(session?.label).toBe('Séance 2 – Qualité (mercredi/jeudi)');
  });

  it('resolves Saturday to the long run, via the alternate day in the label', () => {
    const session = resolveTodaysSession(RUNNING_PROGRAM, new Date(2026, 5, 20));
    expect(session?.label).toBe('Séance 3 – Sortie longue (vendredi/samedi)');
  });

  it('returns null on a day with no run', () => {
    expect(resolveTodaysSession(RUNNING_PROGRAM, new Date(2026, 5, 16))).toBeNull();
    expect(resolveTodaysSession(RUNNING_PROGRAM, new Date(2026, 5, 21))).toBeNull();
  });

  it('maps the four-session phase 3 by position, long run on Sunday', () => {
    // S9 runs 10-16 août 2026, starting on a Monday.
    const monday = resolveTodaysSession(RUNNING_PROGRAM, new Date(2026, 7, 10));
    expect(monday?.label).toBe('S1 – Endurance');

    const wednesday = resolveTodaysSession(RUNNING_PROGRAM, new Date(2026, 7, 12));
    expect(wednesday?.label).toBe('S2 – Qualité');

    const friday = resolveTodaysSession(RUNNING_PROGRAM, new Date(2026, 7, 14));
    expect(friday?.label).toBe('S3 – Spécifique semi');

    const sunday = resolveTodaysSession(RUNNING_PROGRAM, new Date(2026, 7, 16));
    expect(sunday?.label).toBe('Sortie longue');
  });


  it('falls back to position for phase 4, whose labels do not name days', () => {
    const monday = resolveTodaysSession(RUNNING_PROGRAM, new Date(2026, 9, 19));
    expect(monday?.weekId).toBe('S19');
    expect(monday?.phaseId).toBe('affutage');
    expect(monday?.label).toBe('Séance 1');
    expect(monday?.content).toBe('45 min EF');
  });

  it('maps Wednesday to the second session by position in phase 4', () => {
    const wednesday = resolveTodaysSession(RUNNING_PROGRAM, new Date(2026, 9, 21));
    expect(wednesday?.label).toBe('Séance 2');
    expect(wednesday?.content).toBe("3×2000 m à 4'00 récup 2'");
  });
});
