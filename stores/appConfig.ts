import { getLocales } from "expo-localization";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { zustandStorage } from "@/lib/storage";

export type Unit = "oz" | "ml";

type AppConfigState = {
  hasRequestedReview: boolean;
  lastRequestedReviewTimestamp: number;
  hasOnboarded: boolean;
  dailyGoal: number;
  unit: Unit;
};

type AppConfigActions = {
  setHasRequestedReview: () => void;
  completeOnboarding: () => void;
  setDailyGoal: (goal: number) => void;
  setUnit: (unit: Unit) => void;
};

export const useAppConfigStore = create<AppConfigState & AppConfigActions>()(
  persist(
    (set) => ({
      hasRequestedReview: false,
      lastRequestedReviewTimestamp: 0,
      hasOnboarded: false,
      dailyGoal: getLocales()[0]?.measurementSystem === "metric" ? 2000 : 64,
      unit: (getLocales()[0]?.measurementSystem === "metric" ? "ml" : "oz") as Unit,
      setHasRequestedReview: () =>
        set(() => ({
          hasRequestedReview: true,
          lastRequestedReviewTimestamp: new Date().getTime(),
        })),
      completeOnboarding: () => set(() => ({ hasOnboarded: true })),
      setDailyGoal: (goal) => set(() => ({ dailyGoal: goal })),
      setUnit: (unit) => set(() => ({ unit })),
    }),
    {
      name: "app.config",
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
