import { type Entry } from "@/stores/store";

import { getDayKey, toLocalDayKey } from "./dateUtils";

/** Returns a Set of YYYY-MM-DD dayKeys where daily total >= dailyGoal */
export function getGoalMetDates(
  entries: Entry[],
  dailyGoal: number,
  lockedDayStatuses: Record<string, boolean> = {},
): Set<string> {
  const todayKey = toLocalDayKey(new Date());
  const dailyTotals = new Map<string, number>();
  for (const entry of entries) {
    const key = getDayKey(entry);
    if (!key) continue;
    dailyTotals.set(key, (dailyTotals.get(key) ?? 0) + entry.amount);
  }
  const result = new Set<string>();

  for (const [dayKey, isMet] of Object.entries(lockedDayStatuses)) {
    if (dayKey < todayKey && isMet) {
      result.add(dayKey);
    }
  }

  for (const [dayKey, total] of dailyTotals) {
    if (dayKey === todayKey) {
      if (total >= dailyGoal) result.add(dayKey);
      continue;
    }

    if (dayKey < todayKey) {
      if (Object.prototype.hasOwnProperty.call(lockedDayStatuses, dayKey)) {
        continue;
      }
      if (total >= dailyGoal) result.add(dayKey);
      continue;
    }

    if (total >= dailyGoal) result.add(dayKey);
  }
  return result;
}

/** Subtracts one day from a YYYY-MM-DD string, returns new YYYY-MM-DD */
function prevDay(dayKey: string): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  const date = new Date(y, m - 1, d - 1);
  return toLocalDayKey(date);
}

/**
 * Current streak with pending state.
 * - Goal met today → count includes today + consecutive prior days, pending: false
 * - Goal NOT met today but met yesterday → count from yesterday backward, pending: true
 * - Neither → count: 0, pending: false
 */
export function getCurrentStreak(goalMetDates: Set<string>): {
  count: number;
  pending: boolean;
} {
  const today = toLocalDayKey(new Date());
  const metToday = goalMetDates.has(today);

  let current = metToday ? today : prevDay(today);
  let count = 0;

  while (goalMetDates.has(current)) {
    count++;
    current = prevDay(current);
  }

  // If we didn't meet today but have a streak from yesterday, it's pending
  const pending = !metToday && count > 0;

  return { count, pending };
}

/** Longest consecutive run across all goal-met dates */
export function getBestStreak(goalMetDates: Set<string>): number {
  if (goalMetDates.size === 0) return 0;

  const sorted = [...goalMetDates].sort();
  let best = 1;
  let run = 1;

  for (let i = 1; i < sorted.length; i++) {
    // Check if sorted[i] is exactly one day after sorted[i-1]
    const [y, m, d] = sorted[i - 1].split("-").map(Number);
    const nextExpected = toLocalDayKey(new Date(y, m - 1, d + 1));

    if (sorted[i] === nextExpected) {
      run++;
      if (run > best) best = run;
    } else {
      run = 1;
    }
  }

  return best;
}

/**
 * Weekly summary for the current Monday-start week.
 * Evaluates full Mon→Sun window. totalDays is always 7.
 */
export function getWeeklySummary(goalMetDates: Set<string>): {
  daysHit: number;
  totalDays: 7;
} {
  const now = new Date();
  // getDay(): 0=Sun, 1=Mon, ..., 6=Sat. Convert to Mon=0 offset.
  const dayOfWeek = (now.getDay() + 6) % 7;
  const monday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - dayOfWeek,
  );

  let daysHit = 0;
  for (let i = 0; i < 7; i++) {
    const day = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + i,
    );
    if (goalMetDates.has(toLocalDayKey(day))) {
      daysHit++;
    }
  }

  return { daysHit, totalDays: 7 };
}
