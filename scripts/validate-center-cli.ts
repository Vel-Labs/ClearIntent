import { spawn } from "node:child_process";

type CommandResult = {
  status: number | null;
  stdout: string;
  stderr: string;
};

type CenterJson = {
  command?: string;
  commandOk?: boolean;
  authorityOk?: boolean;
  ok?: boolean;
  mode?: string;
  fixtureSource?: string;
  liveProvider?: boolean;
  data?: {
    identity?: {
      claimLevel?: string;
      liveProvider?: boolean;
    };
    execution?: {
      claimLevel?: string;
      liveProvider?: boolean;
      liveExecutionProven?: boolean;
      authorityApprovalProvidedByKeeperHub?: boolean;
    };
    signer?: {
      route?: string;
      claimLevels?: string[];
      liveProvider?: boolean;
      softwareWalletValidationStatus?: string;
      walletRenderedPreviewProven?: boolean;
      secureDeviceDisplayProven?: boolean;
      vendorApprovedClearSigning?: boolean;
    };
    testSummary?: {
      ok?: boolean;
      items?: {
        id?: string;
        local?: {
          status?: string;
        };
        onchain?: {
          status?: string;
        };
      }[];
    };
    credentials?: {
      secretsPrinted?: boolean;
      configured?: {
        zeroGPrivateKey?: string;
      };
    };
  };
};

async function main(): Promise<void> {
  const failures: string[] = [];

  const inspect = await run(["run", "--silent", "clearintent", "--", "center", "inspect", "--json"]);
  assertExit("center inspect exits 0 for blocked fixture readout", inspect, 0, failures);
  const inspectJson = parseJson("center inspect", inspect.stdout, failures);
  if (inspectJson !== undefined) {
    assertEqual("center inspect command", inspectJson.command, "center inspect", failures);
    assertEqual("center inspect commandOk", inspectJson.commandOk, true, failures);
    assertEqual("center inspect authorityOk", inspectJson.authorityOk, false, failures);
    assertEqual("center inspect ok compatibility alias", inspectJson.ok, false, failures);
    assertEqual("center inspect mode", inspectJson.mode, "fixture-only", failures);
    assertEqual("center inspect fixtureSource", inspectJson.fixtureSource, "contracts/examples/", failures);
    assertEqual("center inspect liveProvider", inspectJson.liveProvider, false, failures);
  }

  const invalid = await run(["run", "--silent", "clearintent", "--", "center", "status", "--fixture", "unknown", "--json"]);
  assertExit("unknown fixture exits nonzero", invalid, 1, failures);
  const invalidJson = parseJson("unknown fixture", invalid.stdout, failures);
  if (invalidJson !== undefined) {
    assertEqual("unknown fixture command", invalidJson.command, "error", failures);
    assertEqual("unknown fixture commandOk", invalidJson.commandOk, false, failures);
    assertEqual("unknown fixture authorityOk", invalidJson.authorityOk, false, failures);
  }

  const identity = await run(["run", "--silent", "clearintent", "--", "identity", "status", "--json"]);
  assertExit("identity status exits 0 for blocked fixture readout", identity, 0, failures);
  const identityJson = parseJson("identity status", identity.stdout, failures);
  if (identityJson !== undefined) {
    assertEqual("identity status command", identityJson.command, "identity status", failures);
    assertEqual("identity status commandOk", identityJson.commandOk, true, failures);
    assertEqual("identity status authorityOk", identityJson.authorityOk, false, failures);
    assertEqual("identity status mode", identityJson.mode, "ens-local-fixture", failures);
    assertEqual("identity status liveProvider", identityJson.liveProvider, false, failures);
    assertEqual("identity status claimLevel", identityJson.data?.identity?.claimLevel, "ens-local-fixture", failures);
    assertEqual("identity status data liveProvider", identityJson.data?.identity?.liveProvider, false, failures);
  }

  const execution = await run(["run", "--silent", "clearintent", "--", "execution", "status", "--json"]);
  assertExit("execution status exits 0 for local fixture readout", execution, 0, failures);
  const executionJson = parseJson("execution status", execution.stdout, failures);
  if (executionJson !== undefined) {
    assertEqual("execution status command", executionJson.command, "execution status", failures);
    assertEqual("execution status commandOk", executionJson.commandOk, true, failures);
    assertEqual("execution status authorityOk", executionJson.authorityOk, false, failures);
    assertEqual("execution status mode", executionJson.mode, "keeperhub-local-fixture", failures);
    assertEqual("execution status liveProvider", executionJson.liveProvider, false, failures);
    assertEqual("execution status claimLevel", executionJson.data?.execution?.claimLevel, "keeperhub-local-fixture", failures);
    assertEqual("execution status data liveProvider", executionJson.data?.execution?.liveProvider, false, failures);
    assertEqual("execution status live proof", executionJson.data?.execution?.liveExecutionProven, false, failures);
    assertEqual(
      "execution status KeeperHub authority approval",
      executionJson.data?.execution?.authorityApprovalProvidedByKeeperHub,
      false,
      failures
    );
  }

  const landing = await run(["run", "--silent", "clearintent"]);
  assertExit("bare clearintent landing exits 0", landing, 0, failures);
  if (
    !landing.stdout.includes("Human lane:") ||
    !landing.stdout.includes("AI lane:") ||
    !landing.stdout.includes("execution status") ||
    !landing.stdout.includes("signer status")
  ) {
    failures.push("bare clearintent landing did not include both human and AI lane labels");
  }

  const localTest = await run(["run", "--silent", "clearintent", "--", "test", "local", "--json"]);
  assertExit("test local exits 0 for local aggregate readout", localTest, 0, failures);
  const localTestJson = parseJson("test local", localTest.stdout, failures);
  if (localTestJson !== undefined) {
    assertEqual("test local command", localTestJson.command, "test local", failures);
    assertEqual("test local commandOk", localTestJson.commandOk, true, failures);
    assertEqual("test local authorityOk", localTestJson.authorityOk, false, failures);
    assertEqual("test local ok", localTestJson.ok, true, failures);
    assertEqual("test local liveProvider", localTestJson.liveProvider, false, failures);
    const items = localTestJson.data?.testSummary?.items ?? [];
    for (const id of ["contracts", "core", "zerog", "ens", "keeperhub", "signer-payload", "metadata", "cross-layer"]) {
      const item = items.find((candidate) => candidate.id === id);
      if (item === undefined) {
        failures.push(`test local missing item ${id}`);
      } else {
        assertEqual(`test local ${id} local status`, item.local?.status, "tested", failures);
      }
    }
    const zerog = items.find((candidate) => candidate.id === "zerog");
    assertEqual("test local 0G onchain status", zerog?.onchain?.status, "not-tested", failures);
  }

  const credentials = await run(["run", "--silent", "clearintent", "--", "credentials", "status", "--json"]);
  assertExit("credentials status exits 0 for safety readout", credentials, 0, failures);
  const credentialsJson = parseJson("credentials status", credentials.stdout, failures);
  if (credentialsJson !== undefined) {
    assertEqual("credentials status command", credentialsJson.command, "credentials status", failures);
    assertEqual("credentials status commandOk", credentialsJson.commandOk, true, failures);
    assertEqual("credentials status authorityOk", credentialsJson.authorityOk, false, failures);
    assertEqual("credentials status liveProvider", credentialsJson.liveProvider, false, failures);
    assertEqual("credentials status secrets printed", credentialsJson.data?.credentials?.secretsPrinted, false, failures);
    if (/0x[a-fA-F0-9]{64}/.test(credentials.stdout)) {
      failures.push("credentials status printed a private-key-shaped value");
    }
  }

  for (const route of ["status", "preview", "typed-data", "metadata"]) {
    const signer = await run(["run", "--silent", "clearintent", "--", "signer", route, "--json"]);
    assertExit(`signer ${route} exits 0 for local readout`, signer, 0, failures);
    const signerJson = parseJson(`signer ${route}`, signer.stdout, failures);
    if (signerJson !== undefined) {
      assertEqual(`signer ${route} command`, signerJson.command, `signer ${route}`, failures);
      assertEqual(`signer ${route} commandOk`, signerJson.commandOk, true, failures);
      assertEqual(`signer ${route} authorityOk`, signerJson.authorityOk, false, failures);
      assertEqual(`signer ${route} ok compatibility alias`, signerJson.ok, false, failures);
      assertEqual(`signer ${route} mode`, signerJson.mode, "signer-local-fixture", failures);
      assertEqual(`signer ${route} liveProvider`, signerJson.liveProvider, false, failures);
      assertEqual(`signer ${route} data liveProvider`, signerJson.data?.signer?.liveProvider, false, failures);
      assertEqual(`signer ${route} wallet-rendered preview claim`, signerJson.data?.signer?.walletRenderedPreviewProven, false, failures);
      assertEqual(`signer ${route} secure-device display claim`, signerJson.data?.signer?.secureDeviceDisplayProven, false, failures);
      assertEqual(`signer ${route} vendor Clear Signing claim`, signerJson.data?.signer?.vendorApprovedClearSigning, false, failures);
      assertClaimLevels(`signer ${route}`, signerJson.data?.signer?.claimLevels, failures);
      assertSoftwareWalletStatus(`signer ${route}`, signerJson.data?.signer?.softwareWalletValidationStatus, failures);
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`FAIL ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("PASS center inspect JSON starts with JSON and exits 0 for blocked readout");
  console.log("PASS center inspect separates commandOk from authorityOk");
  console.log("PASS CLI errors remain parseable JSON and exit nonzero");
  console.log("PASS identity status preserves ens-local-fixture and disabled live provider claims");
  console.log("PASS execution status preserves keeperhub-local-fixture and no live/onchain claims");
  console.log("PASS signer routes preserve local-only claim levels and no real-wallet claims");
  console.log("PASS test local aggregates local checks without promoting live/onchain claims");
  console.log("PASS credentials status reports safety posture without printing secrets");
  console.log("PASS bare clearintent exposes human and AI lanes");
  console.log("center cli validation ok");
}

function run(args: string[]): Promise<CommandResult> {
  return new Promise((resolve) => {
    const child = spawn("npm", args, { cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    child.on("close", (status) => {
      resolve({ status, stdout, stderr });
    });
  });
}

function parseJson(label: string, stdout: string, failures: string[]): CenterJson | undefined {
  if (!stdout.startsWith("{")) {
    failures.push(`${label} stdout did not start with JSON: ${JSON.stringify(stdout.slice(0, 80))}`);
    return undefined;
  }

  try {
    return JSON.parse(stdout) as CenterJson;
  } catch (error) {
    failures.push(`${label} stdout was not parseable JSON: ${error instanceof Error ? error.message : String(error)}`);
    return undefined;
  }
}

function assertExit(label: string, result: CommandResult, expected: number, failures: string[]): void {
  if (result.status !== expected) {
    failures.push(`${label}: expected exit ${expected}, got ${String(result.status)}; stderr=${JSON.stringify(result.stderr)}`);
  }
}

function assertEqual(label: string, actual: unknown, expected: unknown, failures: string[]): void {
  if (actual !== expected) {
    failures.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertClaimLevels(label: string, claimLevels: string[] | undefined, failures: string[]): void {
  const allowed = new Set(["signer-local-fixture", "eip712-local-fixture", "erc7730-local-metadata"]);
  if (!Array.isArray(claimLevels)) {
    failures.push(`${label}: expected claimLevels array, got ${JSON.stringify(claimLevels)}`);
    return;
  }
  for (const level of claimLevels) {
    if (!allowed.has(level)) {
      failures.push(`${label}: unexpected claim level ${JSON.stringify(level)}`);
    }
  }
}

function assertSoftwareWalletStatus(label: string, status: string | undefined, failures: string[]): void {
  const allowed = new Set(["not-prepared", "planned", "ready-for-operator-test"]);
  if (status === undefined || !allowed.has(status)) {
    failures.push(`${label}: unexpected software wallet validation status ${JSON.stringify(status)}`);
  }
  if (status === "software-wallet-tested") {
    failures.push(`${label}: must not claim software-wallet-tested without operator evidence`);
  }
}

void main();
