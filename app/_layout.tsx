import * as AC from "@bacons/apple-colors";
import { useMMKVDevTools } from "@dev-plugins/react-native-mmkv";
import { getAnalytics } from "@react-native-firebase/analytics";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Stack, useGlobalSearchParams, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const AppleStackPreset: NativeStackNavigationOptions =
  process.env.EXPO_OS !== "ios"
    ? {}
    : isLiquidGlassAvailable()
      ? {
          // iOS 26 + liquid glass
          headerTransparent: true,
          headerShadowVisible: false,
          headerLargeTitleShadowVisible: false,
          headerLargeStyle: {
            backgroundColor: "transparent",
          },
          headerTitleStyle: {
            color: AC.label as any,
          },
          headerLargeTitle: false,
          headerBlurEffect: "none",
          headerBackButtonDisplayMode: "minimal",
        }
      : {
          headerTransparent: true,
          headerShadowVisible: true,
          headerLargeTitleShadowVisible: false,
          headerLargeStyle: {
            backgroundColor: "transparent",
          },
          headerLargeTitle: true,
          headerBlurEffect: "systemChromeMaterial",
          headerBackButtonDisplayMode: "default",
        };

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
      <Stack screenOptions={AppleStackPreset}>
        <Stack.Screen
          name="index"
          options={{ title: "Home", headerShown: false }}
        />
        <Stack.Screen name="history" options={{ title: "History" }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
