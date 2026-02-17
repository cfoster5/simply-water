import { Alert } from "react-native";

import { type Entry } from "@/stores/store";

export function promptAddEntry(addEntry: (entry: Entry) => void) {
  Alert.prompt(
    "Enter Amount",
    undefined,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: (amount: string | undefined) => {
          const numericAmount = parseInt(amount ?? "", 10);
          if (!isNaN(numericAmount)) {
            const currentDate = new Date().toLocaleDateString();
            const time = new Date().toLocaleTimeString();
            addEntry({ date: currentDate, time, amount: numericAmount });
          }
        },
      },
    ],
    "plain-text",
    "",
    "numeric",
  );
}
