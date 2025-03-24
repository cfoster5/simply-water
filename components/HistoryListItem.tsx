import { useLocales } from "expo-localization";
import { PlatformColor, Pressable, StyleSheet, Text, View } from "react-native";
import { iOSUIKit } from "react-native-typography";

export const HistoryListItem = ({ item, isFirstItem, isLastItem }) => {
  const [locale] = useLocales();
  return (
    // Style extracted from Figma
    <Pressable
      style={{
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        backgroundColor: PlatformColor("secondarySystemGroupedBackground"),
        borderColor: PlatformColor("separator"),
        borderBottomWidth: !isLastItem ? StyleSheet.hairlineWidth : 0,
        paddingHorizontal: 16,
        borderTopLeftRadius: isFirstItem ? 10 : 0,
        borderTopRightRadius: isFirstItem ? 10 : 0,
        borderBottomLeftRadius: isLastItem ? 10 : 0,
        borderBottomRightRadius: isLastItem ? 10 : 0,
      }}
    >
      <View>
        <Text
          style={[
            iOSUIKit.body,
            {
              color: PlatformColor("label"),
            },
          ]}
        >
          {item.time}
        </Text>
      </View>
      <View style={{ alignItems: "center" }}>
        <Text
          style={[
            iOSUIKit.body,
            {
              color: PlatformColor("secondaryLabel"),
            },
          ]}
        >
          {item.amount} {locale.measurementSystem === "metric" ? "ml" : "oz"}
        </Text>
      </View>
    </Pressable>
  );
};
