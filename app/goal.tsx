import * as Haptics from "expo-haptics";
import { Color, router } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { iOSUIKit } from "react-native-typography";

import { useAppConfigStore } from "@/stores/appConfig";

type Unit = "oz" | "ml";

export default function GoalScreen() {
  const { dailyGoal, unit, setDailyGoal, setUnit } = useAppConfigStore();
  const [goalText, setGoalText] = useState(String(dailyGoal));
  const [selectedUnit, setSelectedUnit] = useState<Unit>(unit);

  const isValid = !isNaN(parseInt(goalText, 10)) && parseInt(goalText, 10) > 0;

  const handleSave = useCallback(() => {
    const parsed = parseInt(goalText, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setDailyGoal(parsed);
      setUnit(selectedUnit);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    }
  }, [goalText, selectedUnit, setDailyGoal, setUnit]);

  const handleUnitToggle = useCallback(
    (u: Unit) => {
      if (u === selectedUnit) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedUnit(u);
    },
    [selectedUnit],
  );

  return (
    <View style={styles.container}>
      <Text style={[iOSUIKit.largeTitleEmphasized, { color: Color.ios.label }]}>
        Daily Goal
      </Text>
      <Text
        style={[
          iOSUIKit.body,
          { color: Color.ios.secondaryLabel, textAlign: "center" },
        ]}
      >
        How much water do you want to drink each day?
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { color: Color.ios.label }]}
          value={goalText}
          onChangeText={setGoalText}
          keyboardType="number-pad"
          placeholder="64"
          placeholderTextColor={Color.ios.tertiaryLabel as string}
          selectTextOnFocus
          autoFocus
        />
        <View style={styles.unitToggle}>
          {(["oz", "ml"] as const).map((u) => (
            <Pressable
              key={u}
              onPress={() => handleUnitToggle(u)}
              style={[
                styles.unitButton,
                selectedUnit === u && styles.unitButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.unitText,
                  {
                    color:
                      selectedUnit === u
                        ? "#fff"
                        : (Color.ios.secondaryLabel as string),
                  },
                ]}
              >
                {u}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        onPress={handleSave}
        disabled={!isValid}
        style={({ pressed }) => [
          styles.saveButton,
          !isValid && styles.saveButtonDisabled,
          pressed && { opacity: 0.8 },
        ]}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  input: {
    fontSize: 48,
    fontWeight: "700",
    textAlign: "center",
    minWidth: 120,
    borderBottomWidth: 2,
    borderBottomColor: Color.ios.systemBlue as string,
    paddingVertical: 8,
  },
  unitToggle: {
    flexDirection: "column",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Color.ios.tertiarySystemFill as string,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  unitButtonActive: {
    backgroundColor: Color.ios.systemBlue as string,
  },
  unitText: {
    fontSize: 17,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: Color.ios.systemBlue as string,
    paddingVertical: 16,
    borderRadius: 26,
    alignItems: "center",
    alignSelf: "stretch",
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
});
