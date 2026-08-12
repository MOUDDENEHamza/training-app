import { STRENGTH_SESSIONS } from './strength-sessions.data';

describe('STRENGTH_SESSIONS', () => {
  it('gives every exercise as many set columns as its scheme announces', () => {
    // The columns are sets within one session, with the load climbing set by set. A scheme that
    // opens with "6×" therefore needs six columns, or the athlete cannot tick every set off.
    //
    // Only schemes written as "N×…" are checked. Two exercises spell it out in words instead
    // ("4 séries"): "Chaise roumaine" already matches, and "Obliques – 4 séries" is deliberately
    // modelled as a single cell reading "4 s." pending a decision on whether to split it.
    for (const session of STRENGTH_SESSIONS) {
      for (const group of session.groups) {
        for (const exercise of group.exercises) {
          const declared = exercise.scheme.match(/^\s*(\d+)\s*[×x]/);
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
