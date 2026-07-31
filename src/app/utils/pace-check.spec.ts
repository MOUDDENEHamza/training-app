import { RUNNING_PROGRAM } from '../data/running-program.data';
import { paceCheckFor, paceChecks } from './pace-check';
import { formatRaceTime } from './race-time';

const TEST_10K = "10 km allure semi (4'07) – test";
const TEST_5K = "5 km allure semi (4'07) – test";

describe('paceCheckFor', () => {
  it('compares the 10 km benchmark to its target split', () => {
    const check = paceCheckFor(TEST_10K, "42'05", RUNNING_PROGRAM)!;
    expect(check.distanceKm).toBe(10);
    expect(check.targetSeconds).toBe(2470);
    expect(check.actualSeconds).toBe(2525);
    expect(check.deltaSeconds).toBe(55);
    expect(formatRaceTime(check.halfSeconds)).toBe("1h27'55");
  });

  it('reports no gap when exactly on target', () => {
    const check = paceCheckFor(TEST_5K, "20'35", RUNNING_PROGRAM)!;
    expect(check.distanceKm).toBe(5);
    expect(check.deltaSeconds).toBe(0);
  });

  it('reports a negative gap when faster than target', () => {
    const check = paceCheckFor(TEST_5K, "20'00", RUNNING_PROGRAM)!;
    expect(check.deltaSeconds).toBe(-35);
  });

  it('ignores a session that is not a benchmark, even when it mentions kilometres', () => {
    expect(paceCheckFor('50 min EF', "42'05", RUNNING_PROGRAM)).toBeNull();
    expect(paceCheckFor("2×4 km à 4'07 récup 4'", "42'05", RUNNING_PROGRAM)).toBeNull();
  });

  it('ignores a benchmark whose recorded time cannot be read', () => {
    expect(paceCheckFor(TEST_10K, '', RUNNING_PROGRAM)).toBeNull();
    expect(paceCheckFor(TEST_10K, 'bien passé', RUNNING_PROGRAM)).toBeNull();
  });
});

describe('paceChecks', () => {
  it('lists recorded benchmarks in plan order and skips the unrecorded', () => {
    const recorded: Record<string, string> = {
      'prepa-specifique:S9:S3 – Spécifique semi': "20'35",
      'prepa-specifique:S13:S3 – Spécifique semi': "42'05",
    };
    const checks = paceChecks(
      RUNNING_PROGRAM,
      (phaseId, weekId, label) => recorded[`${phaseId}:${weekId}:${label}`] ?? ''
    );
    expect(checks.map((c) => c.distanceKm)).toEqual([5, 10]);
  });

  it('is empty when nothing has been recorded', () => {
    expect(paceChecks(RUNNING_PROGRAM, () => '')).toEqual([]);
  });
});
