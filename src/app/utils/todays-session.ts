import { RunningProgram, RunningWeekSession } from '../data/models';
import { guessCurrentRunningWeekId } from './date-guess';

export interface TodaysSession {
  phaseId: string;
  weekId: string;
  label: string;
  content: string;
}

/** Lowercase French day names indexed by Date#getDay(), for matching against session labels. */
const DAY_NAMES = [
  'dimanche',
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
] as const;

/**
 * Session index for a day in a three-session phase: endurance, qualité, sortie longue.
 * Sunday is absent — those phases have no fourth run.
 */
const POSITION_BY_DAY: Record<string, number> = {
  lundi: 0,
  mercredi: 1,
  jeudi: 1,
  vendredi: 2,
  samedi: 2,
};

/**
 * Same for a four-session phase: endurance, qualité, spécifique semi, sortie longue —
 * the weekly plan puts that fourth run on Sunday.
 */
const POSITION_BY_DAY_FOUR: Record<string, number> = {
  lundi: 0,
  mercredi: 1,
  jeudi: 1,
  vendredi: 2,
  samedi: 2,
  dimanche: 3,
};

function toResult(phaseId: string, weekId: string, session: RunningWeekSession): TodaysSession {
  return { phaseId, weekId, label: session.label, content: session.content };
}

/**
 * Today's running session, or null when it cannot be determined without guessing.
 *
 * Two rules, in order: the day named in the session label (phases 1-2, which also spell out
 * the alternate days), then position within the phase for the silent labels of phases 3 and 4.
 * Position depends on how many sessions the phase holds — three run Mon/Wed/Fri, four add the
 * long run on Sunday, matching the weekly plan. Days with no run resolve to null.
 */
export function resolveTodaysSession(
  program: RunningProgram,
  todayInput: Date = new Date()
): TodaysSession | null {
  const day = DAY_NAMES[todayInput.getDay()];
  const weekId = guessCurrentRunningWeekId(program, todayInput);
  const phase = program.phases.find((p) => p.weeks.some((w) => w.id === weekId));
  const week = phase?.weeks.find((w) => w.id === weekId);
  if (!phase || !week) {
    return null;
  }

  const byLabel = week.sessions.find((s) => s.label.toLowerCase().includes(day));
  if (byLabel) {
    return toResult(phase.id, week.id, byLabel);
  }

  const byPosition =
    week.sessions.length === 3
      ? POSITION_BY_DAY[day]
      : week.sessions.length === 4
        ? POSITION_BY_DAY_FOUR[day]
        : undefined;
  if (byPosition !== undefined) {
    return toResult(phase.id, week.id, week.sessions[byPosition]);
  }

  return null;
}
