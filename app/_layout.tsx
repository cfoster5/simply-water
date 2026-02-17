import { useMMKVDevTools } from "@dev-plugins/react-native-mmkv";
import { getAnalytics } from "@react-native-firebase/analytics";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { router, Stack, useGlobalSearchParams, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { configurePurchases } from "@/lib/purchases";
import { useAppConfigStore } from "@/stores/appConfig";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useMMKVDevTools();

  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const colorScheme = useColorScheme();
  const hasOnboarded = useAppConfigStore((s) => s.hasOnboarded);
  const [hasHydratedAppConfig, setHasHydratedAppConfig] = useState(() =>
    useAppConfigStore.persist.hasHydrated(),
  );

  useEffect(() => {
    configurePurchases();
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    const unsubscribeHydration = useAppConfigStore.persist.onFinishHydration(
      () => {
        setHasHydratedAppConfig(true);
      },
    );

    if (useAppConfigStore.persist.hasHydrated()) {
      setHasHydratedAppConfig(true);
    }

    return unsubscribeHydration;
  }, []);

  useEffect(() => {
    if (!hasHydratedAppConfig) return;
    if (!hasOnboarded && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [hasHydratedAppConfig, hasOnboarded, pathname]);

  useEffect(() => {
    const logScreenView = async () => {
      try {
        await getAnalytics().logScreenView({
          screen_name: pathname,
          screen_class: pathname,
        });
      } catch (err: any) {
        console.error(err);
      }
    };
    logScreenView();
  }, [pathname, params]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="onboarding"
          options={{
            title: "Onboarding",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="goal"
          options={{
            title: "Intake Goal",
            presentation: "formSheet",
            sheetAllowedDetents: [0.5],
            headerShown: false,
            sheetGrabberVisible: true,
          }}
        />
        <Stack.Screen
          name="index"
          options={{
            title: "Home",
            headerShown: false,
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="history"
          options={{
            title: "History",
            headerBackButtonDisplayMode: "minimal",
            headerLargeTitleEnabled: true,
          }}
        />
        <Stack.Screen
          name="paywall"
          options={{
            title: "Pro",
            presentation: "formSheet",
            sheetAllowedDetents: [0.5],
            headerShown: false,
            sheetGrabberVisible: true,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
