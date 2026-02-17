import Constants from "expo-constants";
import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

const extras = Constants.expoConfig?.extra ?? {};
const IOS_API_KEY: string =
  extras.revenueCatIosApiKey ?? "appl_yNjgyIuoWSDGgSPVQNEAcPJroUP";
const ANDROID_API_KEY: string =
  extras.revenueCatAndroidApiKey ?? "test_ZrOYeUYbXnwNLjPdTgpqswiaRNQ";

let resolveReady: () => void;
export const purchasesReady = new Promise<void>((r) => {
  resolveReady = r;
});

export function configurePurchases() {
  try {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    if (Platform.OS === "ios") {
      Purchases.configure({ apiKey: IOS_API_KEY });
    } else if (Platform.OS === "android") {
      Purchases.configure({ apiKey: ANDROID_API_KEY });
    }
  } finally {
    resolveReady();
  }
}
