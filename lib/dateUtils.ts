/** Returns local YYYY-MM-DD string for a Date */
export function toLocalDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseLegacyDateToDayKey(dateString: string): string {
  const trimmed = dateString.trim();

  // Handles common legacy formats from toLocaleDateString, such as:
  // M/D/YYYY, MM/DD/YYYY, D/M/YYYY, YYYY-M-D, YYYY/MM/DD.
  const match = trimmed.match(/^(\d{1,4})[./-](\d{1,2})[./-](\d{1,4})$/);
  if (!match) return "";

  let year = 0;
  let month = 0;
  let day = 0;

  const a = Number(match[1]);
  const b = Number(match[2]);
  const c = Number(match[3]);

  if (match[1].length === 4) {
    year = a;
    month = b;
    day = c;
  } else if (match[3].length === 4) {
    year = c;
    // If first segment is >12, treat as D/M/YYYY; otherwise default to M/D/YYYY.
    if (a > 12) {
      day = a;
      month = b;
    } else {
      month = a;
      day = b;
    }
  } else {
    return "";
  }

  const parsed = new Date(year, month - 1, day);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return "";
  }

  return toLocalDayKey(parsed);
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

  const fromLegacyFormat = parseLegacyDateToDayKey(entry.date);
  if (fromLegacyFormat) return fromLegacyFormat;

  const parsed = new Date(entry.date);
  if (isNaN(parsed.getTime())) return "";
  return toLocalDayKey(parsed);
}
