import { MMKV } from "react-native-mmkv";
import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";

const storage = new MMKV();

const zustandStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => storage.getString(name) ?? null,
  removeItem: (name) => storage.delete(name),
};

type Entry = {
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
      },
      removeEntries: (keys) => {
        set((state) => ({
          entries: state.entries.filter(
            (e) => !keys.includes(`${e.date}-${e.time}`),
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
