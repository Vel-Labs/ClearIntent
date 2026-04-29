import type { ClearIntentTypedData, SignerIssue, WalletCapabilityLevel, WalletClass } from "./types";

export type EthSignTypedDataV4Request = {
  method: "eth_signTypedData_v4";
  params: [string, string];
};

export type InjectedWalletStatus = {
  walletClass: WalletClass;
  capabilityLevel: WalletCapabilityLevel;
  claimLevel: "request-shape-only";
  method: "eth_signTypedData_v4";
  readyForOperatorTest: boolean;
  softwareWalletTested: false;
  issues: SignerIssue[];
};

export function buildEthSignTypedDataV4Request(signer: string, typedData: ClearIntentTypedData): EthSignTypedDataV4Request {
  return {
    method: "eth_signTypedData_v4",
    params: [signer, JSON.stringify(typedData)]
  };
}

export function getInjectedWalletRequestStatus(): InjectedWalletStatus {
  return {
    walletClass: "software",
    capabilityLevel: "request_shape_only",
    claimLevel: "request-shape-only",
    method: "eth_signTypedData_v4",
    readyForOperatorTest: true,
    softwareWalletTested: false,
    issues: []
  };
}

export function mapInjectedWalletError(error: unknown): SignerIssue {
  const code = readErrorCode(error);
  switch (code) {
    case 4001:
      return { code: "user_rejected", message: "The wallet user rejected the signing request." };
    case 4100:
      return { code: "unauthorized", message: "The wallet has not authorized the requested account or method." };
    case 4200:
      return { code: "unsupported_method", message: "The wallet does not support eth_signTypedData_v4." };
    case 4900:
      return { code: "disconnected", message: "The wallet provider is disconnected from all chains." };
    case 4901:
      return { code: "chain_disconnected", message: "The wallet provider is disconnected from the requested chain." };
    default:
      return { code: "unknown_provider_error", message: "The wallet provider returned an unmapped error." };
  }
}

function readErrorCode(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return undefined;
  }
  const code = (error as { code?: unknown }).code;
  return typeof code === "number" ? code : undefined;
}
