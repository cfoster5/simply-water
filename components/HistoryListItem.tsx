import { PlatformColor, Pressable, StyleSheet, Text, View } from "react-native";
import { iOSUIKit } from "react-native-typography";

import { useAppConfigStore } from "@/stores/appConfig";
import { type Entry } from "@/stores/store";

import { RadioButton } from "./RadioButton";

interface HistoryListItemProps {
  item: Entry;
  isFirstItem: boolean;
  isLastItem: boolean;
  showSelection?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

function formatDisplayTime(date: string, time: string): string {
  const parsed = new Date(`${date} ${time}`);
  if (isNaN(parsed.getTime())) return time;
  return parsed.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export const HistoryListItem = ({
  item,
  isFirstItem,
  isLastItem,
  showSelection = false,
  isSelected = false,
  onSelect,
}: HistoryListItemProps) => {
  const unit = useAppConfigStore((s) => s.unit);
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
        borderTopLeftRadius: isFirstItem ? 26 : 0,
        borderTopRightRadius: isFirstItem ? 26 : 0,
        borderBottomLeftRadius: isLastItem ? 26 : 0,
        borderBottomRightRadius: isLastItem ? 26 : 0,
        borderCurve: "continuous",
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
          {formatDisplayTime(item.date, item.time)}
        </Text>
      </View>
      <View style={{ alignItems: "center" }}>
        <Text
          style={[iOSUIKit.body, { color: PlatformColor("secondaryLabel") }]}
        >
          {item.amount} {unit}
        </Text>
      </View>
    </Pressable>
  );
};
