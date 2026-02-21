import { BlurView } from "expo-blur";
import { Color, router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  PlatformColor,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { iOSUIKit } from "react-native-typography";

import { HistoryListItem } from "@/components/HistoryListItem";
import { useProStatus } from "@/hooks/useProStatus";
import { getDayKey } from "@/lib/dateUtils";
import {
  getBestStreak,
  getCurrentStreak,
  getGoalMetDates,
} from "@/lib/streakHelpers";
import { useAppConfigStore } from "@/stores/appConfig";
import { useIntakeStore } from "@/stores/store";
import { promptAddEntry } from "@/utils/promptAddEntry";

const FREE_HISTORY_DAYS = 3;

export default function HistoryScreen() {
  const { entries, lockPastDays, lockedDayStatuses, removeEntries, addEntry } =
    useIntakeStore();
  const { unit, dailyGoal } = useAppConfigStore();
  const { bottom } = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const isPro = useProStatus();
  const colorScheme = useColorScheme();

  const goalMetDates = getGoalMetDates(entries, dailyGoal, lockedDayStatuses);
  const streak = getCurrentStreak(goalMetDates);
  const bestStreak = getBestStreak(goalMetDates);

  useEffect(() => {
    lockPastDays();
  }, [entries.length, dailyGoal, lockPastDays]);

  const reversedEntries = [...entries].reverse();

  const groupedEntries = reversedEntries.reduce(
    (acc, entry) => {
      const key = getDayKey(entry);
      if (!key) return acc;
      if (!acc[key]) {
        acc[key] = { data: [], totalAmount: 0 };
      }
      acc[key].data.push(entry);
      acc[key].totalAmount += entry.amount;
      return acc;
    },
    {} as Record<string, { data: typeof reversedEntries; totalAmount: number }>,
  );

  const allSections = Object.keys(groupedEntries)
    .sort((a, b) => b.localeCompare(a))
    .map((key, index) => {
      const [y, m, d] = key.split("-").map(Number);
      const displayDate = new Date(y, m - 1, d).toLocaleDateString();
      return {
        dayKey: key,
        title: displayDate,
        data: groupedEntries[key].data,
        totalAmount: groupedEntries[key].totalAmount,
        goalMet: groupedEntries[key].totalAmount >= dailyGoal,
        index,
      };
    });

  const sections = isPro
    ? allSections
    : allSections.slice(0, FREE_HISTORY_DAYS);

  const lockedSections = isPro ? [] : allSections.slice(FREE_HISTORY_DAYS);
  const hasLockedHistory = lockedSections.length > 0;

  return (
    <>
      {/* Styles extracted from Figma */}
      <SectionList
        style={{ backgroundColor: PlatformColor("systemGroupedBackground") }}
        sections={sections}
        keyExtractor={(item, index) =>
          item.id ?? `${item.date}-${item.time}-${index}`
        }
        renderItem={({ item, index, section }) => {
          const isFirstItem = index === 0;
          const isLastItem = index === section.data.length - 1;
          const key = item.id ?? `${item.date}-${item.time}`;
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
                    ? prev.filter((selectedKey) => selectedKey !== key)
                    : [...prev, key],
                )
              }
            />
          );
        }}
        renderSectionHeader={({
          section: { title, totalAmount, goalMet, index },
        }) => (
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
                {
                  color: goalMet
                    ? PlatformColor("systemBlue")
                    : PlatformColor("secondaryLabel"),
                },
              ]}
            >
              {totalAmount} {unit}
            </Text>
          </View>
        )}
        ListHeaderComponent={() => (
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              paddingTop: 16,
              paddingBottom: 8,
            }}
          >
            <View
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 12,
                borderRadius: 26,
                borderCurve: "continuous",
                backgroundColor: PlatformColor(
                  "secondarySystemGroupedBackground",
                ),
              }}
            >
              <Text
                style={[
                  iOSUIKit.title3Emphasized,
                  {
                    color: PlatformColor("systemBlue"),
                    fontVariant: ["tabular-nums"],
                  },
                ]}
              >
                {streak.count}
              </Text>
              <Text
                style={[
                  iOSUIKit.footnote,
                  { color: PlatformColor("secondaryLabel") },
                ]}
              >
                Current Streak
              </Text>
            </View>

            {isPro && (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 12,
                  borderRadius: 26,
                  borderCurve: "continuous",
                  backgroundColor: PlatformColor(
                    "secondarySystemGroupedBackground",
                  ),
                }}
              >
                <Text
                  style={[
                    iOSUIKit.title3Emphasized,
                    {
                      color: PlatformColor("systemBlue"),
                      fontVariant: ["tabular-nums"],
                    },
                  ]}
                >
                  {bestStreak}
                </Text>
                <Text
                  style={[
                    iOSUIKit.footnote,
                    { color: PlatformColor("secondaryLabel") },
                  ]}
                >
                  Best Streak
                </Text>
              </View>
            )}
          </View>
        )}
        stickySectionHeadersEnabled={false}
        automaticallyAdjustsScrollIndicatorInsets
        contentInsetAdjustmentBehavior="automatic"
        contentInset={{ bottom }}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{
          paddingHorizontal: 16,
        }}
        ListEmptyComponent={() => (
          <View
            style={{
              paddingTop: 48,
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
              Start logging today to build your streak!
            </Text>
          </View>
        )}
        ListFooterComponent={
          hasLockedHistory
            ? () => (
                <View style={{ overflow: "hidden", borderRadius: 10 }}>
                  {/* Blurred preview of locked entries */}
                  <View style={{ pointerEvents: "none" }}>
                    {lockedSections.slice(0, 2).map((section) => (
                      <View key={section.dayKey}>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            paddingHorizontal: 16,
                            paddingTop: 32,
                            paddingBottom: 7,
                          }}
                        >
                          <Text
                            style={[
                              iOSUIKit.title3Emphasized,
                              { color: PlatformColor("label") },
                            ]}
                          >
                            {section.title}
                          </Text>
                          <Text
                            style={[
                              iOSUIKit.title3Emphasized,
                              { color: PlatformColor("systemBlue") },
                            ]}
                          >
                            {section.totalAmount} {unit}
                          </Text>
                        </View>
                        {section.data.slice(0, 3).map((item, i) => (
                          <HistoryListItem
                            key={item.id ?? `${item.date}-${item.time}-${i}`}
                            item={item}
                            isFirstItem={i === 0}
                            isLastItem={
                              i === Math.min(section.data.length, 3) - 1
                            }
                          />
                        ))}
                      </View>
                    ))}
                  </View>
                  {/* Blur + CTA overlay */}
                  <Pressable
                    onPress={() => router.push("/paywall")}
                    style={StyleSheet.absoluteFill}
                  >
                    <BlurView
                      intensity={40}
                      tint={colorScheme === "dark" ? "dark" : "light"}
                      style={[
                        StyleSheet.absoluteFill,
                        {
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 4,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          iOSUIKit.bodyEmphasized,
                          { color: Color.ios.label },
                        ]}
                      >
                        Unlock Full History & Best Streak
                      </Text>
                    </BlurView>
                  </Pressable>
                </View>
              )
            : undefined
        }
      />
      {entries.length > 0 && (
        <Stack.Toolbar placement="right">
          {isPro === false && (
            <Stack.Toolbar.Button onPress={() => router.push("/paywall")}>
              <Stack.Toolbar.Label>Pro</Stack.Toolbar.Label>
            </Stack.Toolbar.Button>
          )}
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
