/** Returns local YYYY-MM-DD string for a Date */
export function toLocalDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * Returns the YYYY-MM-DD dayKey for an entry.
 * Uses entry.dayKey when available (new entries).
 * Falls back to parsing entry.date for legacy entries stored via toLocaleDateString().
 * NOTE: Legacy fallback is best-effort — entries with unparseable dates return ''
 * and will be excluded from date-based logic (streak counting, daily reset).
 */
export function getDayKey(entry: { dayKey?: string; date: string }): string {
  if (entry.dayKey) return entry.dayKey;
  const parsed = new Date(entry.date);
  if (isNaN(parsed.getTime())) return "";
  return toLocalDayKey(parsed);
}
