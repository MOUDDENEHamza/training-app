import { RunningProgram, SwimmingProgram } from '../data/models';

const MONTH_NUMBERS: Record<string, number> = {
  juin: 6,
  juillet: 7,
  juil: 7,
  aout: 8,
  août: 8,
  septembre: 9,
  sept: 9,
  octobre: 10,
  oct: 10,
  novembre: 11,
  nov: 11,
  decembre: 12,
  décembre: 12,
  dec: 12,
  déc: 12,
};

function monthNumber(token: string): number | null {
  const clean = token
    .trim()
    .toLowerCase()
    .replace(/\.$/, '');
  return MONTH_NUMBERS[clean] ?? null;
}

/** Strips the time-of-day so date comparisons work regardless of what time it is right now. */
function atMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Parses a French date-range label like "16-22 juin" or "30 juin-6 juil." into calendar dates. */
export function parseRunningWeekRange(
  raw: string,
  year: number
): { start: Date; end: Date } | null {
  const cleaned = raw.replace(/\s*\(.*\)\s*$/, '').trim();

  const twoMonths = cleaned.match(/^(\d+)\s+([^\-\s]+)\s*-\s*(\d+)\s+([^\-\s]+)$/);
  if (twoMonths) {
    const [, d1, mon1, d2, mon2] = twoMonths;
    const m1 = monthNumber(mon1);
    const m2 = monthNumber(mon2);
    if (m1 == null || m2 == null) return null;
    return {
      start: new Date(year, m1 - 1, Number(d1)),
      end: new Date(year, m2 - 1, Number(d2)),
    };
  }

  const oneMonth = cleaned.match(/^(\d+)\s*-\s*(\d+)\s+([^\s]+)$/);
  if (oneMonth) {
    const [, d1, d2, mon] = oneMonth;
    const m = monthNumber(mon);
    if (m == null) return null;
    return {
      start: new Date(year, m - 1, Number(d1)),
      end: new Date(year, m - 1, Number(d2)),
    };
  }

  return null;
}

/**
 * Best-guess current running week: the week whose date range contains today, or
 * (when the plan's placeholder dates don't line up with the real calendar) the
 * week whose start date is closest to today.
 */
export function guessCurrentRunningWeekId(
  program: RunningProgram,
  todayInput: Date = new Date()
): string {
  const today = atMidnight(todayInput);
  const year = today.getFullYear();
  const entries = program.phases.flatMap((phase) =>
    phase.weeks.map((week) => ({
      id: week.id,
      range: parseRunningWeekRange(week.dateRange, year),
    }))
  );
  const parsed = entries.filter(
    (e): e is { id: string; range: { start: Date; end: Date } } => e.range !== null
  );

  const containing = parsed.find((e) => today >= e.range.start && today <= e.range.end);
  if (containing) return containing.id;

  let best = parsed[0];
  let bestDistance = Infinity;
  for (const entry of parsed) {
    const distance = Math.abs(entry.range.start.getTime() - today.getTime());
    if (distance < bestDistance) {
      bestDistance = distance;
      best = entry;
    }
  }
  return best?.id ?? program.phases[0]?.weeks[0]?.id ?? '';
}

function firstMonthMentioned(period: string): number | null {
  const lower = period.toLowerCase();
  const order: [RegExp, number][] = [
    [/juin/, 6],
    [/juil/, 7],
    [/ao[uû]t/, 8],
    [/sept/, 9],
    [/oct/, 10],
    [/nov/, 11],
    [/d[ée]c/, 12],
  ];
  for (const [pattern, month] of order) {
    if (pattern.test(lower)) return month;
  }
  return null;
}

/**
 * Best-guess current swimming phase: swim phases only carry a month-level period
 * (no per-week dates), so we pick the last phase whose start month is on or before today.
 */
export function guessCurrentSwimPhaseId(
  program: SwimmingProgram,
  todayInput: Date = new Date()
): string {
  const today = atMidnight(todayInput);
  const year = today.getFullYear();
  const entries = program.phases
    .map((phase) => {
      const month = firstMonthMentioned(phase.period);
      return month == null ? null : { id: phase.id, start: new Date(year, month - 1, 1) };
    })
    .filter((e): e is { id: string; start: Date } => e !== null);

  const eligible = entries.filter((e) => e.start <= today);
  if (eligible.length > 0) {
    return eligible[eligible.length - 1].id;
  }
  return entries[0]?.id ?? program.phases[0]?.id ?? '';
}
