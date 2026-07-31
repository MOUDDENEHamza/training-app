import { parseRepCount } from './rep-count';

describe('parseRepCount', () => {
  it('reads the count from a distance interval session', () => {
    expect(parseRepCount("5×1000 m à 4'00 récup 1'30")).toBe(5);
  });

  it('reads the count from a time interval session', () => {
    expect(parseRepCount("2×15 min seuil (4'10) récup 4'")).toBe(2);
  });

  it('reads a two-digit count', () => {
    expect(parseRepCount("12×400 m à 3'50 récup 1'")).toBe(12);
  });

  it('finds the pattern after a warm-up prefix', () => {
    expect(parseRepCount("20 min footing + 4×400 m à 4'07 récup 1'30")).toBe(4);
  });

  it('accepts an ASCII x as well as the multiplication sign', () => {
    expect(parseRepCount('8x400 m')).toBe(8);
  });

  it('tolerates spaces around the separator', () => {
    expect(parseRepCount('6 × 1000 m')).toBe(6);
  });

  it('takes the first pattern when several are present', () => {
    expect(parseRepCount('3×1000 m puis 2×400 m')).toBe(3);
  });

  it('returns null for a continuous run', () => {
    expect(parseRepCount('40 min EF')).toBeNull();
  });

  it('returns null for a composite session with no repetitions', () => {
    expect(parseRepCount('1h30 [1h10 EF + 20 min AM + fin EF]')).toBeNull();
  });

  it('returns null when a separator is not followed by a number', () => {
    expect(parseRepCount('45 min EF + 6 lignes droites')).toBeNull();
  });
});
