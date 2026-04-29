import type { DisplayStatus, DisplayWarningCode, WalletCapabilityLevel, WalletClass } from "./types";

export type WalletDisplayProfile = {
  walletClass: WalletClass;
  capabilityLevel: WalletCapabilityLevel;
  displayStatus: DisplayStatus;
  warnings: DisplayWarningCode[];
  claimSummary: string;
};

export function defaultDisplayWarnings(displayStatus: DisplayStatus): DisplayWarningCode[] {
  switch (displayStatus) {
    case "wallet_typed_preview":
      return ["secure_device_display_unverified", "vendor_clear_signing_not_approved"];
    case "secure_device_preview":
      return ["vendor_clear_signing_not_approved"];
    case "vendor_clear_signing_approved":
      return [];
    case "blind_or_limited_display":
      return ["blind_or_limited_display_possible", "vendor_clear_signing_not_approved"];
    case "app_preview_only":
      return ["app_preview_only", "wallet_display_unverified", "secure_device_display_unverified", "vendor_clear_signing_not_approved"];
    case "unknown":
      return ["wallet_display_unverified", "secure_device_display_unverified", "vendor_clear_signing_not_approved"];
  }
}

export function localFixtureDisplayProfile(walletClass: WalletClass = "generic"): WalletDisplayProfile {
  return {
    walletClass,
    capabilityLevel: "eip712_local_fixture",
    displayStatus: "app_preview_only",
    warnings: defaultDisplayWarnings("app_preview_only"),
    claimSummary: "Local ClearIntent preview only; no wallet-rendered or secure-device display evidence."
  };
}
