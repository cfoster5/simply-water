import { GlassView } from "expo-glass-effect";
import { Image } from "expo-image";
import { Color, router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Purchases from "react-native-purchases";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { iOSUIKit } from "react-native-typography";

export default function PaywallScreen() {
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<{
    priceString: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    async function loadOffering() {
      try {
        const offerings = await Purchases.getOfferings();
        const pkg = offerings.current?.availablePackages.find(
          (p) => p.product.identifier === "water_199_lifetime",
        );
        if (pkg) {
          console.log("Found package:", pkg.product);
          setProduct({
            priceString: pkg.product.priceString,
            title: pkg.product.title,
          });
        }
      } catch {
        // fall through
      }
    }
    loadOffering();
  }, []);

  const handlePurchase = useCallback(async () => {
    setLoading(true);
    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages.find(
        (p) => p.product.identifier === "water_199_lifetime",
      );
      if (pkg) {
        await Purchases.purchasePackage(pkg);
        router.back();
      }
    } catch {
      // user cancelled or error
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRestore = useCallback(async () => {
    setLoading(true);
    try {
      await Purchases.restorePurchases();
      router.back();
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <View
      style={[
        styles.container,
        { marginTop: topInset, marginBottom: bottomInset },
      ]}
    >
      <View style={styles.content}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={{ width: 80, height: 80, borderRadius: 20 }}
        />
        <Text
          style={[iOSUIKit.largeTitleEmphasized, { color: Color.ios.label }]}
        >
          Upgrade to Pro
        </Text>
        <Text
          style={[
            iOSUIKit.body,
            { color: Color.ios.secondaryLabel, textAlign: "center" },
          ]}
        >
          Unlock unlimited history as a one-time purchase.
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={handlePurchase}
          disabled={loading}
          // style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
        >
          <GlassView
            isInteractive
            style={styles.button}
            tintColor={Color.ios.systemBlue as string}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>
                {product ? `Continue — ${product.priceString}` : "Continue"}
              </Text>
            )}
          </GlassView>
        </Pressable>

        <Pressable onPress={handleRestore} disabled={loading}>
          <Text
            style={[
              iOSUIKit.footnote,
              { color: Color.ios.systemBlue, textAlign: "center" },
            ]}
          >
            Restore Purchases
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 32,
  },
  content: {
    alignItems: "center",
    gap: 8,
  },
  actions: {
    gap: 16,
    alignItems: "stretch",
  },
  button: {
    backgroundColor: Color.ios.systemBlue,
    paddingVertical: 16,
    borderRadius: 26,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
});
