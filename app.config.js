import { version } from "./package.json";

export default {
  expo: {
    name: "Simply Water",
    slug: "water",
    version: version,
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.cfoster.water",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      googleServicesFile:
        process.env.GOOGLE_SERVICES_PLIST ?? "./GoogleService-Info.plist",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.cfoster.water",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-web-browser",
      "expo-font",
      "expo-image",
      [
        "expo-splash-screen",
        {
          resizeMode: "contain",
          backgroundColor: "#f2f2f7",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      "expo-localization",
      "@react-native-firebase/app",
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
            forceStaticLinking: ["RNFBApp"],
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "f702d13d-0324-49e1-9db5-794e71956f21",
      },
      revenueCatIosApiKey:
        process.env.REVENUECAT_IOS_API_KEY ??
        "appl_yNjgyIuoWSDGgSPVQNEAcPJroUP",
      revenueCatAndroidApiKey:
        process.env.REVENUECAT_ANDROID_API_KEY ??
        "test_ZrOYeUYbXnwNLjPdTgpqswiaRNQ",
    },
  },
};
