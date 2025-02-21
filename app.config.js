import { version } from "./package.json";
import { Colors } from "./constants/Colors";

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
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: Colors.light.background,
          dark: {
            image: "./assets/splash-icon.png",
            backgroundColor: Colors.dark.background,
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
    },
  },
};
