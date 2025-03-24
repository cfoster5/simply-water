import { useLocales } from "expo-localization";
import { Link } from "expo-router";
import * as StoreReview from "expo-store-review";
import { SFSymbol, SymbolView } from "expo-symbols";
import { useEffect } from "react";
import {
  Alert,
  PlatformColor,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { iOSColors, iOSUIKit } from "react-native-typography";

import { ThemedView } from "@/components/ThemedView";
import { useAppConfigStore } from "@/stores/appConfig";
import { useIntakeStore } from "@/stores/store";

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
      <SymbolView
        name={symbolName}
        size={width / 6 / 2.5}
        tintColor={iOSColors.white}
      />
    </Pressable>
  );
};

export default function NotFoundScreen() {
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

  const handleAddEntry = (entryAmount: number) => {
    const time = new Date().toLocaleTimeString();
    const entry = { date: currentDate, time, amount: entryAmount };
    addEntry(entry);
  };

  const totalAmount =
    entries
      .filter((entry) => entry.date === currentDate)
      .reduce((total, entry) => total + entry.amount, 0) || 0;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          paddingRight: 24,
        }}
      >
        <Link href="/history" asChild>
          <Pressable
            // Style extracted from Figma
            style={{
              flexDirection: "row",
              // Use tertiarySystemBackground if a grey background is wanted
              // Because background is already grey, don't use secondarySystemBackground
              // backgroundColor: PlatformColor("tertiarySystemBackground"),
              backgroundColor: PlatformColor("systemBlue"),
              minWidth: 44,
              minHeight: 44,
              borderRadius: 40,
              paddingHorizontal: 14,
              paddingVertical: 7,
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <SymbolView
              name="list.bullet"
              size={iOSUIKit.bodyObject.lineHeight}
              tintColor={iOSColors.white}
            />
            <Text style={[iOSUIKit.body, { color: iOSColors.white }]}>
              History
            </Text>
          </Pressable>
        </Link>
      </SafeAreaView>
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
                ]
              );
            }}
            symbolName="arrow.clockwise"
          />
          <Button
            handlePress={() => {
              Alert.prompt(
                "Enter Amount",
                undefined,
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "OK",
                    onPress: (amount) => {
                      const numericAmount = parseInt(amount, 10);
                      if (!isNaN(numericAmount)) {
                        handleAddEntry(numericAmount);
                      }
                    },
                  },
                ],
                "plain-text",
                "",
                "numeric"
              );
            }}
            symbolName="plus"
          />
        </SafeAreaView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
