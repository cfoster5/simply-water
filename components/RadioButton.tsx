import { Image } from "expo-image";
import { PlatformColor, StyleSheet, View } from "react-native";
import { iOSUIKit } from "react-native-typography";

const circleDiameter = iOSUIKit.bodyObject.lineHeight ?? 22;

const styles = StyleSheet.create({
  shared: {
    height: circleDiameter,
    width: circleDiameter,
    borderRadius: circleDiameter / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  outer: { borderWidth: 1, borderColor: PlatformColor("systemGray") },
  fill: { backgroundColor: PlatformColor("systemBlue") },
});

type RadioButtonProps = { isSelected: boolean };

export const RadioButton = ({ isSelected }: RadioButtonProps) => (
  <View style={[styles.shared, styles.outer]}>
    {isSelected && (
      <View style={[styles.shared, styles.fill]}>
        <Image
          source="sf:checkmark"
          tintColor="white"
          style={{ height: circleDiameter - 8, width: circleDiameter - 8 }}
        />
      </View>
    )}
  </View>
);
