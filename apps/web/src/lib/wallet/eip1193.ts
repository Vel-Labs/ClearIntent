import {
  buildEthSignTypedDataV4Request,
  mapInjectedWalletError,
  type EthSignTypedDataV4Request,
} from "../../../../../packages/signer-adapter/src/injected-wallet";
import type { ClearIntentTypedData, SignerIssue } from "../../../../../packages/signer-adapter/src/types";

type BrowserClearIntentTypedData = ClearIntentTypedData;
type BrowserSignerIssue = SignerIssue;

export type Eip1193RequestArgs = {
  method: string;
  params?: unknown[] | Record<string, unknown>;
};

export type Eip1193Provider = {
  request(args: Eip1193RequestArgs): Promise<unknown>;
  isMetaMask?: boolean;
};

export type WalletConnectionStatus = "no-provider" | "unconnected" | "connected" | "degraded";

export type WalletAccountState = {
  status: WalletConnectionStatus;
  account?: string;
  accounts: string[];
  chainIdHex?: string;
  chainId?: number;
  providerLabel: "metamask" | "eip1193" | "missing";
  issues: SignerIssue[];
};

export type WalletRequestEvidence = {
  evidenceKind: "wallet-request-only";
  method: "eth_signTypedData_v4";
  account: string;
  chainId?: number;
  typedDataHash: string;
  walletRenderedPreviewProven: false;
  signatureCaptured: boolean;
  notes: string[];
};

export type WalletSignatureRequest = {
  request: EthSignTypedDataV4Request;
  evidence: WalletRequestEvidence;
  issues: SignerIssue[];
};

export type WalletSignatureResult =
  | {
      ok: true;
      signature: string;
      evidence: WalletRequestEvidence & { signatureCaptured: true };
      issues: SignerIssue[];
    }
  | {
      ok: false;
      evidence: WalletRequestEvidence;
      issues: SignerIssue[];
    };

export async function connectEip1193Wallet(provider: Eip1193Provider | undefined): Promise<WalletAccountState> {
  if (!provider) {
    return missingProviderState();
  }

  try {
    const accounts = normalizeAccounts(await provider.request({ method: "eth_requestAccounts" }));
    const chainIdHex = normalizeChainIdHex(await provider.request({ method: "eth_chainId" }));
    return buildAccountState(provider, accounts, chainIdHex);
  } catch (error) {
    return {
      status: "degraded",
      accounts: [],
      providerLabel: providerLabel(provider),
      issues: [mapInjectedWalletError(error)]
    };
  }
}

export async function readEip1193WalletState(provider: Eip1193Provider | undefined): Promise<WalletAccountState> {
  if (!provider) {
    return missingProviderState();
  }

  try {
    const accounts = normalizeAccounts(await provider.request({ method: "eth_accounts" }));
    const chainIdHex = normalizeChainIdHex(await provider.request({ method: "eth_chainId" }));
    return buildAccountState(provider, accounts, chainIdHex);
  } catch (error) {
    return {
      status: "degraded",
      accounts: [],
      providerLabel: providerLabel(provider),
      issues: [mapInjectedWalletError(error)]
    };
  }
}

export function prepareClearIntentTypedDataRequest(
  typedData: BrowserClearIntentTypedData,
  account = typedData.message.signer,
  chainId?: number
): WalletSignatureRequest {
  const request = buildEthSignTypedDataV4Request(account, typedData);
  const issues = accountMatchesTypedDataSigner(account, typedData.message.signer)
    ? []
    : [
        {
          code: "invalid_signer",
          message: "Connected wallet account does not match the ClearIntent typed-data signer."
        } satisfies BrowserSignerIssue
      ];

  return {
    request,
    evidence: buildRequestOnlyEvidence(account, typedData, chainId),
    issues
  };
}

export async function requestClearIntentTypedDataSignature(
  provider: Eip1193Provider,
  typedData: BrowserClearIntentTypedData,
  account = typedData.message.signer,
  chainId?: number
): Promise<WalletSignatureResult> {
  const prepared = prepareClearIntentTypedDataRequest(typedData, account, chainId);

  if (prepared.issues.length > 0) {
    return { ok: false, evidence: prepared.evidence, issues: prepared.issues };
  }

  try {
    const signature = await provider.request(prepared.request);
    if (typeof signature !== "string" || !signature.startsWith("0x")) {
      return {
        ok: false,
        evidence: prepared.evidence,
        issues: [{ code: "unknown_provider_error", message: "Wallet returned a non-hex signature result." }]
      };
    }

    return {
      ok: true,
      signature,
      evidence: {
        ...prepared.evidence,
        signatureCaptured: true
      },
      issues: []
    };
  } catch (error) {
    return {
      ok: false,
      evidence: prepared.evidence,
      issues: [mapInjectedWalletError(error)]
    };
  }
}

function buildRequestOnlyEvidence(account: string, typedData: BrowserClearIntentTypedData, chainId?: number): WalletRequestEvidence {
  return {
    evidenceKind: "wallet-request-only",
    method: "eth_signTypedData_v4",
    account,
    chainId,
    typedDataHash: typedData.message.intentHash,
    walletRenderedPreviewProven: false,
    signatureCaptured: false,
    notes: [
      "Request parameters were prepared from the canonical ClearIntent typed-data shape.",
      "This evidence does not prove what the wallet rendered to the user."
    ]
  };
}

function buildAccountState(provider: Eip1193Provider, accounts: string[], chainIdHex?: string): WalletAccountState {
  return {
    status: accounts.length > 0 ? "connected" : "unconnected",
    account: accounts[0],
    accounts,
    chainIdHex,
    chainId: chainIdHex ? Number.parseInt(chainIdHex, 16) : undefined,
    providerLabel: providerLabel(provider),
    issues: []
  };
}

function missingProviderState(): WalletAccountState {
  return {
    status: "no-provider",
    accounts: [],
    providerLabel: "missing",
    issues: [{ code: "disconnected", message: "No EIP-1193 wallet provider is available." }]
  };
}

function providerLabel(provider: Eip1193Provider): WalletAccountState["providerLabel"] {
  return provider.isMetaMask === true ? "metamask" : "eip1193";
}

function normalizeAccounts(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((account): account is string => typeof account === "string" && account.startsWith("0x"));
}

function normalizeChainIdHex(value: unknown): string | undefined {
  return typeof value === "string" && value.startsWith("0x") ? value : undefined;
}

function accountMatchesTypedDataSigner(account: string, signer: string): boolean {
  return account.toLowerCase() === signer.toLowerCase();
}
