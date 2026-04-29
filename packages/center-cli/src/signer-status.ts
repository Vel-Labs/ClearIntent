import { loadFixture } from "./fixtures";

export type SignerRoute = "status" | "preview" | "typed-data" | "metadata";

export type SignerClaimLevel = "signer-local-fixture" | "eip712-local-fixture" | "erc7730-local-metadata";

export type SoftwareWalletValidationStatus = "not-prepared" | "planned" | "ready-for-operator-test";

export type CenterSignerCheck = {
  id: string;
  label: string;
  status: "pass" | "degraded" | "blocking" | "planned";
  detail: string;
};

export type CenterSignerStatus = {
  ok: boolean;
  route: SignerRoute;
  providerMode: "local-fixture";
  claimLevels: SignerClaimLevel[];
  liveProvider: false;
  fixtureOnly: true;
  softwareWalletValidationStatus: SoftwareWalletValidationStatus;
  walletRenderedPreviewProven: false;
  secureDeviceDisplayProven: false;
  vendorApprovedClearSigning: false;
  summary: string;
  checks: CenterSignerCheck[];
  degradedReasons: string[];
  preview?: unknown;
  typedData?: unknown;
  metadata?: unknown;
};

type SignerAdapterApi = {
  getCenterSignerStatus?: (input?: { route?: SignerRoute }) => CenterSignerStatus | Promise<CenterSignerStatus>;
  getSignerStatus?: (input?: { route?: SignerRoute }) => CenterSignerStatus | Promise<CenterSignerStatus>;
  buildCenterSignerStatus?: (input?: { route?: SignerRoute }) => CenterSignerStatus | Promise<CenterSignerStatus>;
  getSoftwareWalletStatus?: () => unknown | Promise<unknown>;
  buildSoftwareWalletStatus?: () => unknown | Promise<unknown>;
  renderClearIntentApprovalPreview?: (input: never) => unknown;
  renderApprovalPreview?: (input: never) => unknown;
  buildApprovalPreview?: (input: never) => unknown;
  buildEip712TypedData?: (input: never) => unknown;
  generateEip712TypedData?: (input: never) => unknown;
  buildClearIntentTypedData?: (input: never) => unknown;
  buildErc7730Metadata?: (input: never) => unknown;
  generateErc7730Metadata?: (input: never) => unknown;
  generateLocalErc7730Metadata?: (input: never) => unknown;
  buildClearSigningMetadata?: (input: never) => unknown;
  getInjectedWalletRequestStatus?: () => unknown | Promise<unknown>;
};

const allowedClaimLevels = new Set<SignerClaimLevel>([
  "signer-local-fixture",
  "eip712-local-fixture",
  "erc7730-local-metadata"
]);

export async function getCenterSignerStatus(route: SignerRoute): Promise<CenterSignerStatus> {
  try {
    const api = await importSignerAdapter();
    const status = await readAdapterStatus(api, route);
    if (status !== undefined) {
      return normalizeSignerStatus(status, route);
    }

    return await buildStatusFromPublicFunctions(api, route);
  } catch {
    return buildUnavailableSignerStatus(route, "signer_adapter_unavailable");
  }
}

async function readAdapterStatus(api: SignerAdapterApi, route: SignerRoute): Promise<CenterSignerStatus | undefined> {
  const reader = api.getCenterSignerStatus ?? api.getSignerStatus ?? api.buildCenterSignerStatus;
  const status = await reader?.({ route });
  return isCenterSignerStatus(status) ? status : undefined;
}

async function buildStatusFromPublicFunctions(api: SignerAdapterApi, route: SignerRoute): Promise<CenterSignerStatus> {
  const intent = loadFixture("valid").intent;
  const preview = route === "preview" ? await callFirst(intent, api.renderClearIntentApprovalPreview, api.renderApprovalPreview, api.buildApprovalPreview) : undefined;
  const typedData = route === "typed-data" ? await callFirst(intent, api.buildEip712TypedData, api.generateEip712TypedData, api.buildClearIntentTypedData) : undefined;
  const metadata =
    route === "metadata"
      ? await callFirst(intent, api.buildErc7730Metadata, api.generateErc7730Metadata, api.generateLocalErc7730Metadata, api.buildClearSigningMetadata)
      : undefined;
  const softwareWalletStatus = await readSoftwareWalletStatus(api);
  const routeData = preview ?? typedData ?? metadata;

  if (route !== "status" && routeData === undefined) {
    return buildUnavailableSignerStatus(route, `signer_${route.replace("-", "_")}_api_missing`);
  }

  return normalizeSignerStatus(
    {
      ok: true,
      route,
      providerMode: "local-fixture",
      claimLevels: claimLevelsForRoute(route),
      liveProvider: false,
      fixtureOnly: true,
      softwareWalletValidationStatus: softwareWalletStatus,
      walletRenderedPreviewProven: false,
      secureDeviceDisplayProven: false,
      vendorApprovedClearSigning: false,
      summary: summaryForRoute(route),
      checks: [
        {
          id: "local-adapter",
          label: "Signer adapter",
          status: "pass",
          detail: "Loaded signer adapter public API without using a live wallet provider."
        },
        {
          id: "live-wallet",
          label: "Live wallet",
          status: "degraded",
          detail: "No MetaMask, software wallet, hardware signer, or secure-device display evidence is claimed."
        }
      ],
      degradedReasons: degradedReasonsForSoftwareStatus(softwareWalletStatus),
      preview,
      typedData,
      metadata
    },
    route
  );
}

function normalizeSignerStatus(status: CenterSignerStatus, route: SignerRoute): CenterSignerStatus {
  const softwareWalletValidationStatus = normalizeSoftwareWalletStatus(status.softwareWalletValidationStatus);
  return {
    ...status,
    ok: status.ok === true,
    route,
    providerMode: "local-fixture",
    claimLevels: status.claimLevels.filter((level): level is SignerClaimLevel => allowedClaimLevels.has(level)),
    liveProvider: false,
    fixtureOnly: true,
    softwareWalletValidationStatus,
    walletRenderedPreviewProven: false,
    secureDeviceDisplayProven: false,
    vendorApprovedClearSigning: false,
    checks: status.checks.map((check) => ({ ...check })),
    degradedReasons: Array.from(new Set([...status.degradedReasons, ...degradedReasonsForSoftwareStatus(softwareWalletValidationStatus)]))
  };
}

function buildUnavailableSignerStatus(route: SignerRoute, reasonCode: string): CenterSignerStatus {
  return {
    ok: false,
    route,
    providerMode: "local-fixture",
    claimLevels: [],
    liveProvider: false,
    fixtureOnly: true,
    softwareWalletValidationStatus: "not-prepared",
    walletRenderedPreviewProven: false,
    secureDeviceDisplayProven: false,
    vendorApprovedClearSigning: false,
    summary: "Signer route is exposed, but the signer adapter public API is not available in this checkout yet.",
    checks: [
      {
        id: "signer-adapter",
        label: "Signer adapter",
        status: "blocking",
        detail: "packages/signer-adapter public API could not provide this route."
      },
      {
        id: "live-wallet",
        label: "Live wallet",
        status: "degraded",
        detail: "No real wallet signing, wallet-rendered preview, secure-device display, or vendor approval is claimed."
      }
    ],
    degradedReasons: [reasonCode, "live_wallet_unverified", "software_wallet_not_tested"]
  };
}

async function callFirst(input: unknown, ...functions: Array<((input: never) => unknown) | undefined>): Promise<unknown> {
  for (const fn of functions) {
    if (fn !== undefined) {
      return await fn(input as never);
    }
  }
  return undefined;
}

async function readSoftwareWalletStatus(api: SignerAdapterApi): Promise<SoftwareWalletValidationStatus> {
  const status = await (api.getSoftwareWalletStatus?.() ?? api.buildSoftwareWalletStatus?.() ?? api.getInjectedWalletRequestStatus?.());
  if (typeof status === "object" && status !== null) {
    const candidate = status as { status?: unknown; validationStatus?: unknown; readyForOperatorTest?: unknown };
    if (candidate.readyForOperatorTest === true) {
      return "ready-for-operator-test";
    }
    return normalizeSoftwareWalletStatus(candidate.validationStatus ?? candidate.status);
  }
  return normalizeSoftwareWalletStatus(status);
}

function normalizeSoftwareWalletStatus(value: unknown): SoftwareWalletValidationStatus {
  if (value === "ready-for-operator-test" || value === "planned") {
    return value;
  }
  return "not-prepared";
}

function claimLevelsForRoute(route: SignerRoute): SignerClaimLevel[] {
  if (route === "metadata") {
    return ["erc7730-local-metadata"];
  }
  if (route === "typed-data") {
    return ["eip712-local-fixture"];
  }
  if (route === "preview") {
    return ["signer-local-fixture"];
  }
  return ["signer-local-fixture", "eip712-local-fixture", "erc7730-local-metadata"];
}

function summaryForRoute(route: SignerRoute): string {
  if (route === "metadata") {
    return "Rendered local ERC-7730/Clear Signing metadata scaffold without wallet/vendor approval claims.";
  }
  if (route === "typed-data") {
    return "Rendered local EIP-712 typed-data scaffold without requesting a real wallet signature.";
  }
  if (route === "preview") {
    return "Rendered local ClearIntent approval preview without claiming wallet-rendered display.";
  }
  return "Rendered local signer scaffold status without live wallet, secure-device, or vendor approval claims.";
}

function degradedReasonsForSoftwareStatus(status: SoftwareWalletValidationStatus): string[] {
  if (status === "ready-for-operator-test" || status === "planned") {
    return ["software_wallet_not_tested"];
  }
  return ["software_wallet_not_prepared", "software_wallet_not_tested"];
}

async function importSignerAdapter(): Promise<SignerAdapterApi> {
  const modulePath = "../../signer-adapter/src/index.ts";
  return (await import(modulePath)) as SignerAdapterApi;
}

function isCenterSignerStatus(value: unknown): value is CenterSignerStatus {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Partial<CenterSignerStatus>;
  return (
    typeof candidate.ok === "boolean" &&
    typeof candidate.route === "string" &&
    candidate.providerMode === "local-fixture" &&
    Array.isArray(candidate.claimLevels) &&
    candidate.liveProvider === false &&
    candidate.fixtureOnly === true &&
    typeof candidate.summary === "string" &&
    Array.isArray(candidate.checks) &&
    Array.isArray(candidate.degradedReasons)
  );
}
