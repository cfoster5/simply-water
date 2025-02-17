import { Link, Stack } from "expo-router";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { useIntakeStore } from "@/stores/store";
import { SFSymbol, SymbolView } from "expo-symbols";
import { SafeAreaView } from "react-native-safe-area-context";
import { iOSColors, iOSUIKit } from "react-native-typography";
import { useLocales } from "expo-localization";

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
          minWidth: width * (1 / 6),
          minHeight: width * (1 / 6),
          borderRadius: "100%",
          alignItems: "center",
          justifyContent: "center",
        },
      ]}
    >
      <SymbolView
        name={symbolName}
        size={(width * (1 / 6)) / 2.5}
        tintColor={iOSColors.white}
      />
    </Pressable>
  );
};

export default function NotFoundScreen() {
  const { width } = useWindowDimensions();
  const [locale] = useLocales();
  const { addEntry, entries, resetDailyEntries } = useIntakeStore();

  const currentDate = new Date().toLocaleDateString();

  const handleAddEntry = (entryAmount) => {
    const time = new Date().toLocaleTimeString();
    const entry = { date: currentDate, time, amount: entryAmount };
    addEntry(entry);
  };

  const totalAmount =
    entries
      .filter((entry) => entry.date === currentDate)
      .reduce((total, entry) => total + entry.amount, 0) || 0;

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <ThemedView style={styles.container}>
        <SafeAreaView
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            paddingRight: 24,
          }}
        >
          <Link href="/previousEntries" asChild>
            <Pressable
              style={{
                backgroundColor: iOSColors.blue,
                minWidth: 44,
                minHeight: 44,
                borderRadius: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SymbolView
                name="list.bullet"
                size={iOSUIKit.bodyObject.lineHeight}
                tintColor={iOSColors.white}
              />
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
              width: width * (1 / 2),
              height: width * (1 / 2),
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
                  null,
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
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
