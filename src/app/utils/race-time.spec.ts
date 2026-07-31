import { formatRaceTime, parseRaceTime } from './race-time';

describe('parseRaceTime', () => {
  it('reads minutes and seconds', () => {
    expect(parseRaceTime("41'10")).toBe(2470);
    expect(parseRaceTime("20'35")).toBe(1235);
  });

  it('reads hours, minutes and seconds', () => {
    expect(parseRaceTime("1h01'45")).toBe(3705);
  });

  it('reads hours and minutes with no seconds, as the target time is written', () => {
    expect(parseRaceTime('1h26')).toBe(5160);
  });

  it('tolerates colons, which are the natural thing to type', () => {
    expect(parseRaceTime('41:10')).toBe(2470);
    expect(parseRaceTime('1:01:45')).toBe(3705);
  });

  it('returns null on anything it cannot read', () => {
    expect(parseRaceTime('')).toBeNull();
    expect(parseRaceTime('abc')).toBeNull();
    expect(parseRaceTime("41'")).toBeNull();
    expect(parseRaceTime('42')).toBeNull();
    expect(parseRaceTime("41'70")).toBeNull();
  });
});

describe('formatRaceTime', () => {
  it('writes times back in the notation the app displays', () => {
    expect(formatRaceTime(2470)).toBe("41'10");
    expect(formatRaceTime(1235)).toBe("20'35");
    expect(formatRaceTime(3705)).toBe("1h01'45");
    expect(formatRaceTime(5275)).toBe("1h27'55");
  });
});
