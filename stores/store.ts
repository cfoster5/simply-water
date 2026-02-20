import * as Haptics from "expo-haptics";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
  resetDailyEntries: () => void;
  addEntry: (entry: Entry) => void;
  removeEntries: (keys: string[]) => void;
};

export const useIntakeStore = create<IntakeState>()(
  persist(
    (set) => ({
      entries: [],
      resetDailyEntries: () => {
        const todayKey = toLocalDayKey(new Date());
        set((state) => ({
          entries: state.entries.filter(
            (entry) => getDayKey(entry) !== todayKey,
          ),
        }));
      },
      addEntry: (entry) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        set((state) => ({
          entries: [
            ...state.entries,
            { ...entry, id, dayKey: toLocalDayKey(new Date()) },
          ],
        }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
      removeEntries: (keys) => {
        set((state) => ({
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
