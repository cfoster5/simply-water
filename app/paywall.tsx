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
  const [purchased, setPurchased] = useState(false);
  const [product, setProduct] = useState<{
    priceString: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    async function loadOffering() {
      try {
        const offerings = await Purchases.getOfferings();
        const currentOffering = offerings.current;
        if (!currentOffering) return;
        const pkg = currentOffering.availablePackages.find(
          (p) => p.packageType === "LIFETIME",
        );
        if (pkg) {
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
      const currentOffering = offerings.current;
      if (!currentOffering) {
        setLoading(false);
        return;
      }
      const pkg = currentOffering.availablePackages.find(
        (p) => p.packageType === "LIFETIME",
      );
      if (pkg) {
        await Purchases.purchasePackage(pkg);
        setLoading(false);
        setPurchased(true);
        setTimeout(() => router.back(), 2000);
        return;
      }
      setLoading(false);
    } catch {
      // user cancelled or error
      setLoading(false);
    }
  }, []);

  const handleRestore = useCallback(async () => {
    setLoading(true);
    try {
      await Purchases.restorePurchases();
      setLoading(false);
      setPurchased(true);
      setTimeout(() => router.back(), 2000);
    } catch {
      // error
      setLoading(false);
    }
  }, []);

  if (purchased) {
    return (
      <Pressable
        style={[
          styles.container,
          {
            marginTop: topInset,
            marginBottom: bottomInset,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
        onPress={() => router.back()}
      >
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🎉</Text>
        <Text
          style={[iOSUIKit.largeTitleEmphasized, { color: Color.ios.label }]}
        >
          Thank You!
        </Text>
        <Text
          style={[
            iOSUIKit.body,
            {
              color: Color.ios.secondaryLabel,
              textAlign: "center",
              marginTop: 8,
            },
          ]}
        >
          You're now a Pro member. Enjoy unlimited history!
        </Text>
      </Pressable>
    );
  }

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

        <Pressable
          onPress={handleRestore}
          disabled={loading}
          style={{ minHeight: 44, justifyContent: "center" }}
        >
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
