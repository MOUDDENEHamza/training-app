import { RunningProgram, SwimmingProgram, WeekDay, DayName } from '../data/models';

function atMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Whole days between today and a target date (negative if the target is in the past). */
export function daysUntil(target: Date, todayInput: Date = new Date()): number {
  const today = atMidnight(todayInput);
  const start = atMidnight(target);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((start.getTime() - today.getTime()) / msPerDay);
}

export interface ProgressStat {
  index: number;
  total: number;
  percent: number;
}

/** Position of a given running week within the full 21-week program. */
export function runningWeekProgress(program: RunningProgram, weekId: string): ProgressStat {
  const allWeeks = program.phases.flatMap((phase) => phase.weeks);
  const total = allWeeks.length;
  const index = allWeeks.findIndex((w) => w.id === weekId);
  const position = index === -1 ? 0 : index + 1;
  return { index: position, total, percent: Math.round((position / total) * 100) };
}

/** Position of a given swim phase within the full 4-phase program. */
export function swimPhaseProgress(program: SwimmingProgram, phaseId: string): ProgressStat {
  const total = program.phases.length;
  const index = program.phases.findIndex((p) => p.id === phaseId);
  const position = index === -1 ? 0 : index + 1;
  return { index: position, total, percent: Math.round((position / total) * 100) };
}

export interface NextStrengthSession {
  day: DayName;
  sessionId: string;
  label: string;
  isToday: boolean;
}

/** The next strength day starting from today (today included if it has a session). */
export function nextStrengthSession(
  weekPlan: WeekDay[],
  todayInput: Date = new Date()
): NextStrengthSession | null {
  const mondayFirstIndex = (todayInput.getDay() + 6) % 7;
  for (let offset = 0; offset < 7; offset++) {
    const entry = weekPlan[(mondayFirstIndex + offset) % 7];
    if (entry.strengthSessionId && entry.strengthLabel) {
      return {
        day: entry.day,
        sessionId: entry.strengthSessionId,
        label: entry.strengthLabel,
        isToday: offset === 0,
      };
    }
  }
  return null;
}
