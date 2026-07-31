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
 * Session index for a day, used only when a phase has exactly three sessions in the
 * usual order: endurance, qualité, sortie longue.
 */
const POSITION_BY_DAY: Record<string, number> = {
  lundi: 0,
  mercredi: 1,
  jeudi: 1,
  vendredi: 2,
  samedi: 2,
};

function toResult(phaseId: string, weekId: string, session: RunningWeekSession): TodaysSession {
  return { phaseId, weekId, label: session.label, content: session.content };
}

/**
 * Today's running session, or null when it cannot be determined without guessing.
 *
 * Two rules, in order: the day named in the session label (phases 1-2, which also spell out
 * the alternate days), then position within a three-session phase (phase 4, whose labels are
 * silent). Phase 3 has four sessions in a different order, so it resolves to null rather than
 * risk opening the wrong session mid-effort — as do days with no run.
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

  const position = POSITION_BY_DAY[day];
  if (week.sessions.length === 3 && position !== undefined) {
    return toResult(phase.id, week.id, week.sessions[position]);
  }

  return null;
}
