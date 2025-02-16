import { Stack } from "expo-router";

import { EntryListItem } from "@/components/EntryListItem";
import { ThemedText } from "@/components/ThemedText";
import { useIntakeStore } from "@/stores/store";
import { FlatList } from "react-native";

export default function NotFoundScreen() {
  const { entries } = useIntakeStore();

  const reversedEntries = [...entries].reverse();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Previous Entries",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <FlatList
        data={reversedEntries}
        renderItem={({ item }) => <EntryListItem item={item} />}
        ListEmptyComponent={() => (
          <ThemedText
            type="default"
            style={{ textAlign: "center", marginTop: 24 }}
          >
            Press the + button to add entries!
          </ThemedText>
        )}
      />
    </>
  );
}
