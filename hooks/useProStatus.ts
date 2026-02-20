import { useEffect, useState } from "react";
import { Platform } from "react-native";
import Purchases, { type CustomerInfo } from "react-native-purchases";

import { purchasesReady } from "@/lib/purchases";

const ENTITLEMENT_ID = "Simply Water Pro";

/**
 * The last iOS build number where the app was paid (before converting to free + subscription).
 * Any user whose originalApplicationVersion is <= this number is grandfathered into Pro.
 * On iOS, originalApplicationVersion corresponds to CFBundleVersion (build number).
 *
 * Update this to the build number of your last paid release before going free.
 */
const LAST_PAID_BUILD_NUMBER = 42;

function isGrandfatheredUser(customerInfo: CustomerInfo): boolean {
  // Grandfathering only applies to iOS — Android doesn't have a paid app equivalent
  if (Platform.OS !== "ios") return false;

  const originalVersion = customerInfo.originalApplicationVersion;
  if (!originalVersion) return false;

  const buildNumber = parseInt(originalVersion, 10);
  if (isNaN(buildNumber)) return false;

  return buildNumber <= LAST_PAID_BUILD_NUMBER;
}

function hasActiveEntitlement(customerInfo: CustomerInfo): boolean {
  return (
    typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined"
  );
}

export function useProStatus() {
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const customerInfoListener = (info: CustomerInfo) => {
      setIsPro(hasActiveEntitlement(info) || isGrandfatheredUser(info));
    };

    async function check() {
      try {
        await purchasesReady;
        const customerInfo = await Purchases.getCustomerInfo();
        setIsPro(
          hasActiveEntitlement(customerInfo) ||
            isGrandfatheredUser(customerInfo),
        );
      } catch {
        setIsPro(false);
      }
    }

    check();

    Purchases.addCustomerInfoUpdateListener(customerInfoListener);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(customerInfoListener);
    };
  }, []);

  return isPro;
}
