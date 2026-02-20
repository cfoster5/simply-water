import { getAnalytics } from "@react-native-firebase/analytics";
import { Image } from "expo-image";
import { Color, router, Stack } from "expo-router";
import * as StoreReview from "expo-store-review";
import { useEffect } from "react";
import {
  Alert,
  Pressable,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { iOSColors, iOSUIKit } from "react-native-typography";

import { CircleButton } from "@/components/CircleButton";
import { ThemedView } from "@/components/ThemedView";
import { getDayKey, toLocalDayKey } from "@/lib/dateUtils";
import { getCurrentStreak, getGoalMetDates } from "@/lib/streakHelpers";
import { useAppConfigStore } from "@/stores/appConfig";
import { useIntakeStore } from "@/stores/store";
import { promptAddEntry } from "@/utils/promptAddEntry";

const ORBIT_GAP = 32;
const PRESET_AMOUNTS = [8, 12, 16];

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const { addEntry, entries, resetDailyEntries } = useIntakeStore();
  const { hasRequestedReview, setHasRequestedReview, unit, dailyGoal } =
    useAppConfigStore();

  useEffect(() => {
    async function requestReview() {
      if (entries.length >= 5 && !hasRequestedReview) {
        const isAvailable = await StoreReview.isAvailableAsync();
        if (isAvailable) {
          await StoreReview.requestReview();
          setHasRequestedReview();
        }
      }
    }
    requestReview();
  }, [entries.length, hasRequestedReview, setHasRequestedReview]);

  const todayKey = toLocalDayKey(new Date());

  const totalAmount =
    entries
      .filter((entry) => getDayKey(entry) === todayKey)
      .reduce((total, entry) => total + entry.amount, 0) || 0;

  const goalMetDates = getGoalMetDates(entries, dailyGoal);
  const streak = getCurrentStreak(goalMetDates);

  async function shareAppLink() {
    try {
      const shareAction = await Share.share({
        message: "https://apps.apple.com/us/app/simply-water/id6742065968",
      });
      if (shareAction.action === Share.sharedAction) {
        await getAnalytics().logShare({
          content_type: "url",
          item_id: "https://apps.apple.com/us/app/simply-water/id6742065968",
          method: "home-screen-button",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  }

  const mainRadius = width / 4;
  const buttonSize = width / 6;
  const orbitRadius = mainRadius + buttonSize / 2 + ORBIT_GAP;
  // Container needs to fit the main circle + orbiting buttons above
  const containerWidth = (orbitRadius + buttonSize / 2) * 2;
  const containerHeight = orbitRadius + buttonSize / 2 + mainRadius;

  const topButtons = PRESET_AMOUNTS.map((amount) => ({
    handlePress: () => {
      const entryDate = new Date().toLocaleDateString();
      const time = new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
      addEntry({ date: entryDate, time, amount });
    },
    label: `${amount}`,
  }));

  // Spread 3 buttons across 90° centered at the top (-135° to -45°)
  const startAngle = (-3 * Math.PI) / 4;
  const endAngle = -Math.PI / 4;
  const angleStep = (endAngle - startAngle) / (topButtons.length - 1);

  // Center of the main circle within the container
  const cx = containerWidth / 2;
  const cy = containerHeight - mainRadius;

  return (
    <ThemedView style={styles.container}>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Menu icon="ellipsis">
          <Stack.Toolbar.MenuAction
            icon="waterbottle"
            onPress={() => router.push("/goal")}
          >
            Change Goal
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            icon="square.and.arrow.up"
            onPress={shareAppLink}
          >
            Share App
          </Stack.Toolbar.MenuAction>

          <Stack.Toolbar.MenuAction
            icon="restart"
            onPress={() => router.replace("/onboarding")}
          >
            Restart Onboarding
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
      <Stack.Screen.Title style={{ color: "transparent" }}>
        Home
      </Stack.Screen.Title>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          variant="prominent"
          onPress={() => router.push("/history")}
        >
          <Stack.Toolbar.Icon sf="list.bullet" />
          <Stack.Toolbar.Label>History</Stack.Toolbar.Label>
        </Stack.Toolbar.Button>
      </Stack.Toolbar>

      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: containerWidth,
            height: containerHeight,
          }}
        >
          {/* Main circle */}
          <Pressable
            style={{
              position: "absolute",
              left: cx - mainRadius,
              top: cy - mainRadius,
              backgroundColor: iOSColors.blue,
              width: mainRadius * 2,
              height: mainRadius * 2,
              borderRadius: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={iOSUIKit.largeTitleEmphasizedWhite}>
              {totalAmount}
              {unit}
            </Text>
            <Text style={iOSUIKit.bodyWhite}>today</Text>
            {streak.count > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 8,
                  opacity: streak.pending ? 0.55 : 0.85,
                }}
              >
                <Image
                  source="sf:flame.fill"
                  tintColor={Color.ios.systemOrange as string}
                  style={{ width: 14, height: 14 }}
                />
                <Text
                  style={{
                    color: "white",
                    fontSize: 13,
                    fontWeight: "600",
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {streak.count} {streak.count === 1 ? "day" : "days"}
                </Text>
              </View>
            )}
          </Pressable>

          {/* Arc buttons */}
          {topButtons.map((btn, i) => {
            const angle = startAngle + i * angleStep;
            const x = cx + Math.cos(angle) * orbitRadius - buttonSize / 2;
            const y = cy + Math.sin(angle) * orbitRadius - buttonSize / 2;
            return (
              <View
                key={i}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                }}
              >
                <CircleButton handlePress={btn.handlePress} label={btn.label} />
              </View>
            );
          })}
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            width: "100%",
            marginTop: 32,
          }}
        >
          <CircleButton
            handlePress={() => {
              Alert.alert(
                "Reset Today's Entries?",
                "Are you sure you want to reset today's entries?",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "OK", onPress: resetDailyEntries },
                ],
              );
            }}
            symbolName="sf:arrow.counterclockwise"
          />
          <CircleButton
            handlePress={() => promptAddEntry(addEntry)}
            symbolName="sf:plus"
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
