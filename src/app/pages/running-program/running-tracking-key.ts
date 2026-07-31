/**
 * Storage key for one running session's progress. Shared by the page and the two
 * components that render sessions, so they cannot drift apart.
 */
export function runningTrackingKey(phaseId: string, weekId: string, label: string): string {
  return `running:${phaseId}:${weekId}:${label}`;
}
