import { RunningProgram } from '../data/models';
import { parseRaceTime } from './race-time';

export interface PaceCheck {
  distanceKm: number;
  targetSeconds: number;
  actualSeconds: number;
  /** Positive means slower than the target split. */
  deltaSeconds: number;
  /** The half-marathon time this pace implies, held all the way. */
  halfSeconds: number;
}

/** The plan marks its benchmark sessions with "– test"; dash variants are tolerated. */
const BENCHMARK = /[-–—]\s*test/i;

/**
 * Compares a recorded time against the target split for a benchmark session.
 *
 * Returns null unless the session is a benchmark, a distance can be read from it, a matching split
 * target exists, and the recorded value parses as a time. The distance is only read for benchmarks,
 * so a regular session that mentions kilometres is never mistaken for one.
 */
export function paceCheckFor(
  content: string,
  actual: string,
  program: RunningProgram
): PaceCheck | null {
  if (!BENCHMARK.test(content)) {
    return null;
  }

  const distance = content.match(/(\d+)\s*km/);
  if (!distance) {
    return null;
  }
  const distanceKm = Number(distance[1]);

  const split = program.splitTargets.find((t) => Number.parseInt(t.distance, 10) === distanceKm);
  if (!split) {
    return null;
  }

  const targetSeconds = parseRaceTime(split.time);
  const actualSeconds = parseRaceTime(actual);
  const halfTargetSeconds = parseRaceTime(program.targetTime);
  if (targetSeconds === null || actualSeconds === null || halfTargetSeconds === null) {
    return null;
  }

  return {
    distanceKm,
    targetSeconds,
    actualSeconds,
    deltaSeconds: actualSeconds - targetSeconds,
    halfSeconds: Math.round(actualSeconds * (halfTargetSeconds / targetSeconds)),
  };
}

/** Every recorded benchmark, in the order the plan lists them. */
export function paceChecks(
  program: RunningProgram,
  resolveActual: (phaseId: string, weekId: string, label: string) => string
): PaceCheck[] {
  const checks: PaceCheck[] = [];
  for (const phase of program.phases) {
    for (const week of phase.weeks) {
      for (const session of week.sessions) {
        const check = paceCheckFor(
          session.content,
          resolveActual(phase.id, week.id, session.label),
          program
        );
        if (check) {
          checks.push(check);
        }
      }
    }
  }
  return checks;
}
