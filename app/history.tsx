import { Stack } from "expo-router";
import { useState } from "react";
import { PlatformColor, SectionList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { iOSUIKit } from "react-native-typography";

import { HistoryListItem } from "@/components/HistoryListItem";
import { dummyEntries } from "@/constants/dummyEntries";
import { promptAddEntry, useIntakeStore } from "@/stores/store";

export default function HistoryScreen() {
  const { entries, removeEntries, addEntry } = useIntakeStore();
  const { bottom } = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

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
    <>
      {/* Styles extracted from Figma */}
      <SectionList
        style={{ backgroundColor: PlatformColor("systemGroupedBackground") }}
        sections={sections}
        keyExtractor={(item, index) => item.time + index}
        renderItem={({ item, index, section }) => {
          const isFirstItem = index === 0;
          const isLastItem = index === section.data.length - 1;
          const key = `${item.date}-${item.time}`;
          return (
            <HistoryListItem
              item={item}
              isFirstItem={isFirstItem}
              isLastItem={isLastItem}
              showSelection={isEditing}
              isSelected={selectedKeys.includes(key)}
              onSelect={() =>
                setSelectedKeys((prev) =>
                  prev.includes(key)
                    ? prev.filter((k) => k !== key)
                    : [...prev, key],
                )
              }
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
        {...(sections.length > 0 && {
          automaticallyAdjustsScrollIndicatorInsets: true,
          contentInsetAdjustmentBehavior: "automatic" as const,
          contentInset: { bottom },
        })}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          // If there are no sections, we want the content to take up the full height so that the empty state is centered
          ...(sections.length === 0 && { flexGrow: 1 }),
        }}
        ListEmptyComponent={() => (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={[
                iOSUIKit.body,
                {
                  color: PlatformColor("label"),
                  textAlign: "center",
                },
              ]}
            >
              Press the + button below to add entries!
            </Text>
          </View>
        )}
      />
      {entries.length > 0 && (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            onPress={() => {
              setSelectedKeys([]);
              setIsEditing(!isEditing);
            }}
          >
            <Stack.Toolbar.Label>
              {isEditing ? "Done" : "Select"}
            </Stack.Toolbar.Label>
          </Stack.Toolbar.Button>
        </Stack.Toolbar>
      )}
      {isEditing ? (
        <Stack.Toolbar placement="bottom">
          <Stack.Toolbar.Spacer />
          <Stack.Toolbar.Button
            disabled={selectedKeys.length === 0}
            onPress={() => {
              removeEntries(selectedKeys);
              setSelectedKeys([]);
              setIsEditing(false);
            }}
            tintColor={PlatformColor("systemRed")}
          >
            <Stack.Toolbar.Icon sf="trash" />
            <Stack.Toolbar.Label>Delete</Stack.Toolbar.Label>
          </Stack.Toolbar.Button>
        </Stack.Toolbar>
      ) : (
        <Stack.Toolbar placement="bottom">
          <Stack.Toolbar.Spacer />
          <Stack.Toolbar.Button
            onPress={() => promptAddEntry(addEntry)}
            variant="prominent"
          >
            <Stack.Toolbar.Icon sf="plus" />
            <Stack.Toolbar.Label>Add</Stack.Toolbar.Label>
          </Stack.Toolbar.Button>
        </Stack.Toolbar>
      )}
    </>
  );
}
