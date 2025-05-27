import { useLocales } from "expo-localization";
import { PlatformColor, Pressable, StyleSheet, Text, View } from "react-native";
import { iOSUIKit } from "react-native-typography";

import { RadioButton } from "./RadioButton";

interface HistoryListItemProps {
  item: { date: string; time: string; amount: number };
  isFirstItem: boolean;
  isLastItem: boolean;
  showSelection?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const HistoryListItem = ({
  item,
  isFirstItem,
  isLastItem,
  showSelection = false,
  isSelected = false,
  onSelect,
}: HistoryListItemProps) => {
  const [locale] = useLocales();
  return (
    // Style extracted from Figma
    <Pressable
      onPress={showSelection ? onSelect : undefined}
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
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {showSelection && <RadioButton isSelected={isSelected} />}
        <Text
          style={[
            iOSUIKit.body,
            {
              color: PlatformColor("label"),
              paddingLeft: showSelection ? 8 : 0,
            },
          ]}
        >
          {item.time}
        </Text>
      </View>
      <View style={{ alignItems: "center" }}>
        <Text
          style={[iOSUIKit.body, { color: PlatformColor("secondaryLabel") }]}
        >
          {item.amount} {locale.measurementSystem === "metric" ? "ml" : "oz"}
        </Text>
      </View>
    </Pressable>
  );
};
