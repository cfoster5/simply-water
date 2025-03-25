import { PlatformColor, SectionList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { iOSUIKit } from "react-native-typography";

import { HistoryListItem } from "@/components/HistoryListItem";
// import { dummyEntries as entries } from "@/constants/dummyEntries";
import { useIntakeStore } from "@/stores/store";

export default function NotFoundScreen() {
  const { entries } = useIntakeStore();
  const { bottom } = useSafeAreaInsets();

  const reversedEntries = [...entries].reverse();

  const groupedEntries = reversedEntries.reduce((acc, entry) => {
    const date = entry.date;
    if (!acc[date]) {
      acc[date] = { data: [], totalAmount: 0 };
    }
    acc[date].data.push(entry);
    acc[date].totalAmount += entry.amount;
    return acc;
  }, {});

  const sections = Object.keys(groupedEntries).map((date, index) => ({
    title: date,
    data: groupedEntries[date].data,
    totalAmount: groupedEntries[date].totalAmount,
    index: index,
  }));

  return (
    // Styles extracted from Figma
    <SectionList
      style={{ backgroundColor: PlatformColor("systemGroupedBackground") }}
      sections={sections}
      keyExtractor={(item, index) => item.time + index}
      renderItem={({ item, index, section }) => {
        const isFirstItem = index === 0;
        const isLastItem = index === section.data.length - 1;
        return (
          <HistoryListItem
            item={item}
            isFirstItem={isFirstItem}
            isLastItem={isLastItem}
          />
        );
      }}
      renderSectionHeader={({ section: { title, totalAmount, index } }) => (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingTop: index === 0 ? 16 : 32,
            paddingBottom: 7,
          }}
        >
          <Text
            style={[
              iOSUIKit.title3Emphasized,
              { color: PlatformColor("label") },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              iOSUIKit.title3Emphasized,
              { color: PlatformColor("systemBlue") },
            ]}
          >
            {totalAmount} oz
          </Text>
        </View>
      )}
      stickySectionHeadersEnabled={false}
      automaticallyAdjustsScrollIndicatorInsets
      contentInsetAdjustmentBehavior="automatic"
      contentInset={{ bottom: bottom }}
      scrollIndicatorInsets={{ bottom: bottom }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      ListEmptyComponent={() => (
        <Text
          style={[
            iOSUIKit.body,
            {
              color: PlatformColor("label"),
              textAlign: "center",
              marginTop: 24,
            },
          ]}
        >
          Press the + button on the last screen to add entries!
        </Text>
      )}
    />
  );
}
