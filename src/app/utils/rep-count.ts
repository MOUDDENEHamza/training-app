/**
 * Reads the repetition count out of a session's text, e.g. "5×1000 m à 4'00" → 5.
 * Returns null when the session has no repetitions ("40 min EF").
 *
 * The separator must be followed by a digit, so a stray "x" in prose
 * ("6 lignes droites") does not read as a repetition count.
 */
export function parseRepCount(content: string): number | null {
  const match = content.match(/(\d+)\s*[×x]\s*\d/);
  if (!match) {
    return null;
  }
  const count = Number(match[1]);
  return count > 0 ? count : null;
}
