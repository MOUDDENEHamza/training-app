function toSeconds(hours: number, minutes: number, seconds: number): number | null {
  if (minutes > 59 || seconds > 59) {
    return null;
  }
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Reads a race time into seconds. Accepts the notation the app displays — 41'10, 1h01'45 — plus
 * 1h26 (no seconds, how the target time is written) and colon forms like 41:10 and 1:01:45.
 *
 * A bare number is rejected on purpose: "42" could mean minutes or seconds, and guessing wrong
 * would silently produce a nonsense gap.
 */
export function parseRaceTime(input: string): number | null {
  const value = input.trim();
  if (!value) {
    return null;
  }

  const withHour = value.match(/^(\d+)\s*h\s*(\d{1,2})(?:\s*['´:]\s*(\d{1,2}))?$/i);
  if (withHour) {
    const [, hours, minutes, seconds] = withHour;
    return toSeconds(Number(hours), Number(minutes), seconds ? Number(seconds) : 0);
  }

  const separated = value.match(/^(\d+)\s*['´:]\s*(\d{1,2})(?:\s*['´:]\s*(\d{1,2}))?$/);
  if (separated) {
    const [, first, second, third] = separated;
    return third === undefined
      ? toSeconds(0, Number(first), Number(second))
      : toSeconds(Number(first), Number(second), Number(third));
  }

  return null;
}

/** Writes seconds back as 41'10 below an hour, 1h27'55 above. */
export function formatRaceTime(seconds: number): string {
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return hours > 0 ? `${hours}h${pad(minutes)}'${pad(rest)}` : `${minutes}'${pad(rest)}`;
}
