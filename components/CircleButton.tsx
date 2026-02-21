import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { Image } from "expo-image";
import type { ComponentProps } from "react";
import { Pressable, Text, useWindowDimensions } from "react-native";
import { iOSColors, iOSUIKit } from "react-native-typography";

type ImageSource = NonNullable<ComponentProps<typeof Image>["source"]>;

type CircleButtonProps = {
  handlePress: () => void;
  symbolName?: ImageSource;
  label?: string;
};

const isGlassAvailable = isLiquidGlassAvailable();

export const CircleButton = ({
  handlePress,
  symbolName,
  label,
}: CircleButtonProps) => {
  const { width } = useWindowDimensions();
  const size = width / 6;

  const content = symbolName ? (
    <Image
      source={symbolName}
      style={{ height: size / 2.5, width: size / 2.5 }}
      tintColor="white"
    />
  ) : label ? (
    <Text style={iOSUIKit.bodyEmphasizedWhite}>{label}</Text>
  ) : null;

  if (isGlassAvailable) {
    return (
      <Pressable onPress={handlePress}>
        <GlassView
          isInteractive
          tintColor={iOSColors.blue}
          style={{
            minWidth: size,
            minHeight: size,
            borderRadius: size / 2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {content}
        </GlassView>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={{
        backgroundColor: iOSColors.blue,
        minWidth: size,
        minHeight: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {content}
    </Pressable>
  );
};
