import * as Haptics from "expo-haptics";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { zustandStorage } from "@/lib/storage";

export type Entry = {
  date: string;
  time: string;
  amount: number;
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
        const currentDate = new Date().toLocaleDateString();
        set((state) => ({
          entries: state.entries.filter((entry) => entry.date !== currentDate),
        }));
      },
      addEntry: (entry) => {
        set((state) => ({
          entries: [...state.entries, entry],
        }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
      removeEntries: (keys) => {
        set((state) => ({
          entries: state.entries.filter(
            (entry) => !keys.includes(`${entry.date}-${entry.time}`),
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
