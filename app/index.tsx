import { getAnalytics } from "@react-native-firebase/analytics";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { iOSColors, iOSUIKit } from "react-native-typography";

import { ThemedView } from "@/components/ThemedView";
// import { dummyEntries as entries } from "@/constants/dummyEntries";
import { useAppConfigStore } from "@/stores/appConfig";
import { promptAddEntry, useIntakeStore } from "@/stores/store";

type CircleButtonProps = {
  handlePress: () => void;
  symbolName: SFSymbol;
};

const Button = ({ handlePress, symbolName }: CircleButtonProps) => {
  const { width } = useWindowDimensions();
  return (
    <Pressable
      onPress={handlePress}
      style={[
        {
          backgroundColor: iOSColors.blue,
          minWidth: width / 6,
          minHeight: width / 6,
          borderRadius: "100%",
          alignItems: "center",
          justifyContent: "center",
        },
      ]}
    >
      {/* <SymbolView
        name={symbolName}
        size={width / 6 / 2.5}
        tintColor={iOSColors.white}
      /> */}
      <Image
        source={symbolName}
        style={{ height: width / 6 / 2.5, width: width / 6 / 2.5 }}
        tintColor="white"
      />
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
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Pressable
          style={{
            backgroundColor: iOSColors.blue,
            width: width / 2,
            height: width / 2,
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
        <SafeAreaView
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            width: "100%",
          }}
        >
          <Button
            handlePress={() => {
              Alert.alert(
                "Reset Today's Entries?",
                "Are you sure you want to reset today's entries?",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "OK",
                    onPress: resetDailyEntries,
                  },
                ],
              );
            }}
            symbolName="sf:arrow.counterclockwise"
          />
          <Button
            handlePress={() => promptAddEntry(addEntry)}
            symbolName="sf:plus"
          />
        </SafeAreaView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
