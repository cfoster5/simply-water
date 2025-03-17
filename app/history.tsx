import { FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EntryListItem } from "@/components/EntryListItem";
import { ThemedText } from "@/components/ThemedText";
import { useIntakeStore } from "@/stores/store";

export default function NotFoundScreen() {
  const { entries } = useIntakeStore();
  const { bottom } = useSafeAreaInsets();

  const reversedEntries = [...entries].reverse();

  return (
    <>
      <Stack.Screen
        options={{
          title: "History",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <FlatList
        data={reversedEntries}
        renderItem={({ item }) => <EntryListItem item={item} />}
      automaticallyAdjustsScrollIndicatorInsets
      contentInsetAdjustmentBehavior="automatic"
      contentInset={{ bottom: bottom }}
      scrollIndicatorInsets={{ bottom: bottom }}
        ListEmptyComponent={() => (
          <ThemedText
            type="default"
            style={{ textAlign: "center", marginTop: 24 }}
          >
          Press the + button on the last screen to add entries!
          </ThemedText>
        )}
      />
    </>
  );
}
