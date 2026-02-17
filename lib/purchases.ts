import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

let resolveReady: () => void;
export const purchasesReady = new Promise<void>((r) => {
  resolveReady = r;
});

export function configurePurchases() {
  try {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    // const iosApiKey = "test_ZrOYeUYbXnwNLjPdTgpqswiaRNQ";
    const iosApiKey = "appl_yNjgyIuoWSDGgSPVQNEAcPJroUP";
    const androidApiKey = "test_ZrOYeUYbXnwNLjPdTgpqswiaRNQ";

    if (Platform.OS === "ios") {
      Purchases.configure({ apiKey: iosApiKey });
    } else if (Platform.OS === "android") {
      Purchases.configure({ apiKey: androidApiKey });
    }
  } finally {
    resolveReady();
  }
}
