import * as Haptics from "expo-haptics";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { useAppConfigStore } from "@/stores/appConfig";
import { getDayKey, toLocalDayKey } from "@/lib/dateUtils";
import { zustandStorage } from "@/lib/storage";

export type Entry = {
  /** Stable identifier for selection/deletion. */
  id?: string;
  date: string;
  time: string;
  amount: number;
  /** Local YYYY-MM-DD key. Present on new entries; legacy entries may lack it. */
  dayKey?: string;
};

type IntakeState = {
  entries: Entry[];
  lockedDayStatuses: Record<string, boolean>;
  lockPastDays: () => void;
  resetDailyEntries: () => void;
  addEntry: (entry: Entry) => void;
  removeEntries: (keys: string[]) => void;
};

function withLockedPastDays(
  entries: Entry[],
  lockedDayStatuses: Record<string, boolean>,
  dailyGoal: number,
): Record<string, boolean> {
  const todayKey = toLocalDayKey(new Date());
  const next = { ...lockedDayStatuses };
  const dailyTotals = new Map<string, number>();

  for (const entry of entries) {
    const key = getDayKey(entry);
    if (!key || key >= todayKey) continue;
    dailyTotals.set(key, (dailyTotals.get(key) ?? 0) + entry.amount);
  }

  for (const [dayKey, total] of dailyTotals) {
    if (Object.prototype.hasOwnProperty.call(next, dayKey)) continue;
    next[dayKey] = total >= dailyGoal;
  }

  return next;
}

export const useIntakeStore = create<IntakeState>()(
  persist(
    (set) => ({
      entries: [],
      lockedDayStatuses: {},
      lockPastDays: () => {
        const dailyGoal = useAppConfigStore.getState().dailyGoal;
        set((state) => ({
          lockedDayStatuses: withLockedPastDays(
            state.entries,
            state.lockedDayStatuses,
            dailyGoal,
          ),
        }));
      },
      resetDailyEntries: () => {
        const todayKey = toLocalDayKey(new Date());
        const dailyGoal = useAppConfigStore.getState().dailyGoal;
        set((state) => ({
          lockedDayStatuses: withLockedPastDays(
            state.entries,
            state.lockedDayStatuses,
            dailyGoal,
          ),
          entries: state.entries.filter(
            (entry) => getDayKey(entry) !== todayKey,
          ),
        }));
      },
      addEntry: (entry) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const dailyGoal = useAppConfigStore.getState().dailyGoal;
        set((state) => ({
          lockedDayStatuses: withLockedPastDays(
            state.entries,
            state.lockedDayStatuses,
            dailyGoal,
          ),
          entries: [
            ...state.entries,
            { ...entry, id, dayKey: toLocalDayKey(new Date()) },
          ],
        }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
      removeEntries: (keys) => {
        const dailyGoal = useAppConfigStore.getState().dailyGoal;
        set((state) => ({
          lockedDayStatuses: withLockedPastDays(
            state.entries,
            state.lockedDayStatuses,
            dailyGoal,
          ),
          entries: state.entries.filter(
            (entry) =>
              !keys.includes(entry.id ?? `${entry.date}-${entry.time}`),
          ),
        }));
      },
    }),
    {
      name: "com.cfoster.water",
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
