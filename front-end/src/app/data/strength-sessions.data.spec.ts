import { STRENGTH_SESSIONS } from './strength-sessions.data';

describe('STRENGTH_SESSIONS', () => {
  it('gives every exercise as many set columns as its scheme announces', () => {
    // The columns are sets within one session, with the load climbing set by set. A scheme that
    // opens with "6×" therefore needs six columns, or the athlete cannot tick every set off.
    // Schemes spelling the count out in words ("4 séries dégressives") count too.
    for (const session of STRENGTH_SESSIONS) {
      for (const group of session.groups) {
        for (const exercise of group.exercises) {
          const declared = exercise.scheme.match(/^\s*(\d+)\s*(?:[×x]|séries?\b)/i);
          if (!declared) {
            continue;
          }
          expect(exercise.weeks.length)
            .withContext(`${session.id} / ${exercise.name} — "${exercise.scheme}"`)
            .toBe(Number(declared[1]));
        }
      }
    }
  });

  it('numbers set columns consecutively from S1, since tracking keys depend on them', () => {
    for (const session of STRENGTH_SESSIONS) {
      for (const group of session.groups) {
        for (const exercise of group.exercises) {
          const ids = exercise.weeks.map((w) => w.week);
          const expected = ids.map((_, i) => `S${i + 1}`);
          expect(ids).withContext(`${session.id} / ${exercise.name}`).toEqual(expected);
        }
      }
    }
  });
});
