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

  const landing = await run(["run", "--silent", "clearintent"]);
  assertExit("bare clearintent landing exits 0", landing, 0, failures);
  if (!landing.stdout.includes("Human lane:") || !landing.stdout.includes("AI lane:")) {
    failures.push("bare clearintent landing did not include both human and AI lane labels");
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

void main();
