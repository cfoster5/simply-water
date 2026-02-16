import { getAnalytics } from "@react-native-firebase/analytics";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { Image } from "expo-image";
import { useLocales } from "expo-localization";
import { router, Stack } from "expo-router";
import * as StoreReview from "expo-store-review";
import { SFSymbol } from "expo-symbols";
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

import { ThemedView } from "@/components/ThemedView";
// import { dummyEntries as entries } from "@/constants/dummyEntries";
import { useAppConfigStore } from "@/stores/appConfig";
import { promptAddEntry, useIntakeStore } from "@/stores/store";

type CircleButtonProps = {
  handlePress: () => void;
  symbolName?: SFSymbol;
  label?: string;
};

const isGlassAvailable = isLiquidGlassAvailable();

const Button = ({ handlePress, symbolName, label }: CircleButtonProps) => {
  const { width } = useWindowDimensions();
  const size = width / 6;

  const content = symbolName ? (
    <Image
      source={symbolName}
      style={{ height: size / 2.5, width: size / 2.5 }}
      tintColor="white"
    />
  ) : label ? (
    <Text style={iOSUIKit.bodyEmphasizedWhite}>{label}</Text>
  ) : null;

  if (isGlassAvailable) {
    return (
      <Pressable onPress={handlePress}>
        <GlassView
          isInteractive
          tintColor={iOSColors.blue}
          style={{
            minWidth: size,
            minHeight: size,
            borderRadius: size / 2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {content}
        </GlassView>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={{
        backgroundColor: iOSColors.blue,
        minWidth: size,
        minHeight: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {content}
    </Pressable>
  );
};

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [locale] = useLocales();
  const { addEntry, entries, resetDailyEntries } = useIntakeStore();
  const { hasRequestedReview, setHasRequestedReview } = useAppConfigStore();

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

  const currentDate = new Date().toLocaleDateString();

  const totalAmount =
    entries
      .filter((entry) => entry.date === currentDate)
      .reduce((total, entry) => total + entry.amount, 0) || 0;

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
  const gap = 32;
  const orbitRadius = mainRadius + buttonSize / 2 + gap;
  // Container needs to fit the main circle + orbiting buttons above
  const containerWidth = (orbitRadius + buttonSize / 2) * 2;
  const containerHeight = orbitRadius + buttonSize / 2 + mainRadius;

  const presets = [8, 12, 16];
  const topButtons = presets.map((amount) => ({
    handlePress: () => {
      const entryDate = new Date().toLocaleDateString();
      const time = new Date().toLocaleTimeString();
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
        <Stack.Toolbar.Button onPress={shareAppLink}>
          <Stack.Toolbar.Icon sf="square.and.arrow.up" />
          <Stack.Toolbar.Label>Share</Stack.Toolbar.Label>
        </Stack.Toolbar.Button>
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
              {locale.measurementSystem === "metric" ? "ml" : "oz"}
            </Text>
            <Text style={iOSUIKit.bodyWhite}>today</Text>
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
                <Button handlePress={btn.handlePress} label={btn.label} />
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
          <Button
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
          <Button
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
