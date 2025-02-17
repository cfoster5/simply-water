import { PlatformColor, Pressable, StyleSheet, Text, View } from "react-native";
import { iOSUIKit } from "react-native-typography";

import { ThemedText } from "./ThemedText";
import { useLocales } from "expo-localization";

export const EntryListItem = ({ item }) => {
  const [locale] = useLocales();
  return (
    <Pressable
      style={{
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        backgroundColor: PlatformColor("systemGray6"),
        borderColor: PlatformColor("separator"),
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: 24,
      }}
    >
      <View>
        <ThemedText>{item.date}</ThemedText>
        <Text
          style={{
            ...iOSUIKit.footnoteEmphasizedObject,
            color: PlatformColor("systemGray"),
          }}
        >
          {item.time}
        </Text>
      </View>
      <View style={{ alignItems: "center" }}>
        <Text
          style={{
            ...iOSUIKit.title3EmphasizedObject,
            color: PlatformColor("systemBlue"),
          }}
        >
          {item.amount} {locale.measurementSystem === "metric" ? "ml" : "oz"}
        </Text>
      </View>
    </Pressable>
  );
};
