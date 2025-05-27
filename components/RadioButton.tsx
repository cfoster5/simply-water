import { SymbolView } from "expo-symbols";
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
        <SymbolView
          name="checkmark"
          tintColor="white"
          size={circleDiameter - 8}
          resizeMode="scaleAspectFit"
        />
      </View>
    )}
  </View>
);
