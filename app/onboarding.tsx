import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColorScheme } from "@/hooks/useColorScheme";
import { useAppConfigStore } from "@/stores/appConfig";

const HOLD_DURATION = 1500;
const NAVIGATION_DELAY_MS = 1000;
const GOAL_SCREEN_DELAY_MS = 500;

const commitments = [
  "Stay hydrated throughout the day",
  "Build a healthier daily habit",
  "Feel my best, every day",
];

const STAGGER_BASE = 300;
const STAGGER_STEP = 200;

const palette = {
  light: {
    card: "#dbeafe", // blue-100
    accent: "#2563eb", // blue-600
    glow: "rgba(37, 99, 235, 0.2)",
    title: "#1e3a5f",
    body: "#64748b",
  },
  dark: {
    card: "#172554", // blue-950
    accent: "#3b82f6", // blue-500
    glow: "rgba(59, 130, 246, 0.3)",
    title: "#e0f2fe",
    body: "#94a3b8",
  },
};

export default function OnboardingScreen() {
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const scheme = useColorScheme();
  const colors = palette[scheme === "dark" ? "dark" : "light"];
  const router = useRouter();
  const [committed, setCommitted] = useState(false);
  const { completeOnboarding } = useAppConfigStore();

  useEffect(() => {
    const timers = commitments.map((_, i) =>
      setTimeout(
        () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        STAGGER_BASE + i * STAGGER_STEP,
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const circleScale = useRef(useSharedValue(1));
  const glowProgress = useRef(useSharedValue(0));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowProgress.current.value,
    transform: [
      {
        scale: interpolate(glowProgress.current.value, [0, 1], [1, 1.35]),
      },
    ],
  }));

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.current.value }],
  }));

  const startPulse = useCallback(() => {
    glowProgress.current.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500 }),
        withTiming(0.3, { duration: 500 }),
      ),
      -1,
    );
  }, []);

  const stopPulse = useCallback(() => {
    glowProgress.current.value = withTiming(0, { duration: 150 });
  }, []);

  const onPressIn = useCallback(() => {
    if (committed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startPulse();
    circleScale.current.value = withSpring(0.88);

    timer.current = setTimeout(() => {
      setCommitted(true);
      stopPulse();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      circleScale.current.value = withSequence(withSpring(1.12), withSpring(1));

      completeOnboarding();
      setTimeout(() => {
        router.replace("/");
        setTimeout(() => {
          router.push("/goal");
        }, GOAL_SCREEN_DELAY_MS);
      }, NAVIGATION_DELAY_MS);
    }, HOLD_DURATION);
  }, [committed, router, startPulse, stopPulse, completeOnboarding]);

  const onPressOut = useCallback(() => {
    if (committed) return;
    stopPulse();
    if (timer.current) clearTimeout(timer.current);
    circleScale.current.value = withSpring(1);
  }, [committed, stopPulse]);

  return (
    <View
      style={[styles.outer, { marginTop: topInset, marginBottom: bottomInset }]}
    >
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.textArea}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
          />
          <Text style={[styles.title, { color: colors.title }]}>
            I will use Simply Water to
          </Text>
          <View style={{ gap: 7 }}>
            {commitments.map((line, i) => (
              <Animated.Text
                key={line}
                entering={FadeIn.delay(
                  STAGGER_BASE + i * STAGGER_STEP,
                ).duration(100)}
                style={[styles.body, { color: colors.body }]}
              >
                {line}
              </Animated.Text>
            ))}
          </View>
        </View>

        <View style={styles.circleArea}>
          <View style={styles.circleWrapper}>
            <Animated.View
              style={[
                styles.glowRing,
                { backgroundColor: colors.glow },
                glowStyle,
              ]}
            />
            <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
              <Animated.View
                style={[
                  styles.circle,
                  { backgroundColor: colors.accent },
                  circleStyle,
                ]}
              >
                {committed ? (
                  <Text style={styles.checkmark}>{"\u2713"}</Text>
                ) : (
                  <Image
                    source="sf:touchid"
                    style={{ width: 130 / 1.5, height: 130 / 1.5 }}
                    tintColor="white"
                  />
                )}
              </Animated.View>
            </Pressable>
          </View>
          <Text style={[styles.instruction, { color: colors.accent }]}>
            Tap and hold to get started.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    flex: 1,
    borderRadius: 55,
    paddingHorizontal: 32,
    paddingVertical: 48,
    justifyContent: "space-between",
    alignItems: "center",
  },
  textArea: {
    alignItems: "center",
    gap: 14,
    marginTop: 24,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 17,
    lineHeight: 23,
    textAlign: "center",
  },
  circleArea: {
    alignItems: "center",
    gap: 20,
  },
  circleWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 130,
    height: 130,
  },
  glowRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  circle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: {
    fontSize: 60,
  },
  checkmark: {
    fontSize: 70,
    color: "white",
    fontWeight: "700",
  },
  instruction: {
    fontSize: 17,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
  },
});
