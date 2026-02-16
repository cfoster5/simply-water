import { useMMKVDevTools } from "@dev-plugins/react-native-mmkv";
import { getAnalytics } from "@react-native-firebase/analytics";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useGlobalSearchParams, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useMMKVDevTools();

  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Assuming there are no other assets to load, hide the splash screen immediately
    SplashScreen.hideAsync();
  }, []);

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
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
