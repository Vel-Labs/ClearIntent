import {
  createContractValidator,
  deriveCoreStateSnapshot,
  evaluateCoreAuthority,
  type ContractKind,
  type ResultIssue
} from "../../core/src";
import { getAccountKitCliStatus } from "./accountkit-status";
import { defaultClock, loadFixture, parseFixtureName, type FixtureName } from "./fixtures";
import { getCredentialSafetyStatus } from "./credential-safety";
import {
  getCenterExecutionStatus,
  getCenterKeeperHubLiveRunStatus,
  getCenterKeeperHubLiveStatus,
  submitCenterKeeperHubLiveWorkflow
} from "./execution-status";
import {
  getCenterIdentityBindingStatus,
  getCenterIdentityStatus,
  getCenterLiveIdentityStatus,
  sendCenterIdentityBindingRecords
} from "./identity-status";
import { runCenterLocalTestSummary } from "./local-test";
import {
  getCenterMemoryStatus,
  getZeroGLiveBindingsStatus,
  getZeroGLiveReadinessStatus,
  getZeroGLiveSmokeStatus
} from "./memory-status";
import { listCenterModules, runModuleDoctor } from "./modules";
import type { CliCommandResult } from "./output";
import { getCenterSignerStatus, type SignerRoute } from "./signer-status";
import { renderLanding } from "./wizard";

export type CliOptions = {
  json: boolean;
  fixture: FixtureName;
};

export async function runCenterCommand(args: string[]): Promise<CliCommandResult> {
  const parsed = parseArgs(args);
  const [group, command] = parsed.positionals;

  if (group === undefined) {
    return {
      command: "center",
      ok: true,
      commandOk: true,
      authorityOk: true,
      summary: "Rendered the Center landing screen.",
      data: { landing: renderLanding() },
      issues: []
    };
  }

  if (group === "center" && command === "status") {
    return buildStateResult("center status", parsed.options.fixture);
  }
  if (group === "center" && command === "inspect") {
    return buildStateResult("center inspect", parsed.options.fixture, true);
  }
  if (group === "intent" && command === "validate") {
    return buildValidationResult(parsed.options.fixture);
  }
  if (group === "intent" && command === "state") {
    return buildStateResult("intent state", parsed.options.fixture);
  }
  if (group === "authority" && command === "evaluate") {
    return buildEvaluationResult(parsed.options.fixture);
  }
  if (group === "test" && command === "local") {
    const testSummary = await runCenterLocalTestSummary();
    return {
      command: "test local",
      ok: testSummary.ok,
      commandOk: true,
      authorityOk: false,
      mode: "fixture-only",
      fixtureSource: "contracts/examples/",
      liveProvider: false,
      summary: testSummary.summary,
      data: { testSummary },
      issues: testSummary.items
        .filter((item) => item.local.status === "blocked")
        .map((item) => ({
          code: "local_test_blocked",
          message: item.local.detail,
          path: item.id
        }))
    };
  }
  if ((group === "credentials" || group === "credential") && (command === "status" || command === "safety" || command === "doctor")) {
    const credentials = getCredentialSafetyStatus();
    return {
      command: `credentials ${command}`,
      ok: credentials.ok,
      commandOk: true,
      authorityOk: false,
      mode: "live-readiness",
      liveProvider: false,
      summary: credentials.ok
        ? "Credential safety checks passed without printing secrets."
        : "Credential safety checks found blockers. No secrets were printed.",
      data: { credentials },
      issues: credentials.blockingReasons.map((reason) => ({
        code: "credential_safety_blocked",
        message: reason,
        path: "credentials"
      }))
    };
  }
  if ((group === "accountkit" || group === "alchemy") && (command === "status" || command === "setup-prompt" || command === "prompt")) {
    const accountKit = getAccountKitCliStatus();
    return {
      command: `${group} ${command}`,
      ok: accountKit.ok,
      commandOk: true,
      authorityOk: false,
      mode: "accountkit-readiness",
      liveProvider: false,
      summary:
        command === "status"
          ? accountKit.summary
          : "Rendered Account Kit local setup prompt. This is not parent-wallet authority approval.",
      data: { accountKit },
      issues: accountKit.missing.map((missing) => ({
        code: "accountkit_config_missing",
        message: missing,
        path: "alchemy"
      }))
    };
  }
  if (group === "identity" && command === "status") {
    const identity = await getCenterIdentityStatus();
    return {
      command: "identity status",
      ok: false,
      commandOk: true,
      authorityOk: false,
      mode: "ens-local-fixture",
      liveProvider: false,
      summary: identity.ok
        ? "Local ENS identity fixture status is available. Identity discovery is not authority approval."
        : "Local ENS identity fixture status is blocked or degraded. No live ENS or 0G claim is made.",
      data: { identity },
      issues: [...identity.blockingReasons, ...identity.degradedReasons].map((reason) => ({
        code: identity.blockingReasons.includes(reason) ? "identity_blocked" : "identity_degraded",
        message: reason,
        path: "ens"
      }))
    };
  }
  if (group === "identity" && command === "live-status") {
    const identity = await getCenterLiveIdentityStatus();
    return {
      command: "identity live-status",
      ok: false,
      commandOk: true,
      authorityOk: false,
      mode: "ens-live-read",
      liveProvider: true,
      summary: identity.ok
        ? "Live ENS identity readout is available. Identity discovery is not authority approval."
        : "Live ENS identity readout is blocked or degraded. No authority approval is made.",
      data: { identity },
      issues: [...identity.blockingReasons, ...identity.degradedReasons].map((reason) => ({
        code: identity.blockingReasons.includes(reason) ? "identity_blocked" : "identity_degraded",
        message: reason,
        path: "ens"
      }))
    };
  }
  if (group === "identity" && command === "bind-records") {
    const binding = await getCenterIdentityBindingStatus();
    return {
      command: "identity bind-records",
      ok: binding.ok,
      commandOk: true,
      authorityOk: false,
      mode: "ens-live-read",
      liveProvider: true,
      summary: binding.ok
        ? "ENS text-record multicall is prepared for parent-wallet signature."
        : "ENS text-record multicall preparation is blocked.",
      data: { binding },
      issues: [...binding.blockingReasons, ...binding.degradedReasons].map((reason) => ({
        code: binding.blockingReasons.includes(reason) ? "identity_blocked" : "identity_degraded",
        message: reason,
        path: "ens"
      }))
    };
  }
  if (group === "identity" && command === "send-bind-records") {
    const binding = await sendCenterIdentityBindingRecords();
    return {
      command: "identity send-bind-records",
      ok: binding.ok,
      commandOk: true,
      authorityOk: false,
      mode: "ens-live-read",
      liveProvider: true,
      summary: binding.ok
        ? "ENS text-record multicall transaction was submitted."
        : "ENS text-record multicall submission is blocked or failed.",
      data: { binding },
      issues: [...binding.blockingReasons, ...binding.degradedReasons].map((reason) => ({
        code: binding.blockingReasons.includes(reason) ? "identity_blocked" : "identity_degraded",
        message: reason,
        path: "ens"
      }))
    };
  }
  if ((group === "execution" || group === "keeperhub") && command === "status") {
    const execution = await getCenterExecutionStatus();
    return {
      command: `${group} status`,
      ok: false,
      commandOk: true,
      authorityOk: false,
      mode: "keeperhub-local-fixture",
      liveProvider: false,
      summary: "Local KeeperHub execution fixture status is available. Execution status is inspection, not authority approval.",
      data: { execution },
      issues: execution.degradedReasons.map((reason) => ({
        code: reason,
        message: reason,
        path: "keeperhub"
      }))
    };
  }
  if ((group === "execution" || group === "keeperhub") && command === "live-status") {
    const execution = await getCenterKeeperHubLiveStatus();
    return {
      command: `${group} live-status`,
      ok: execution.ok,
      commandOk: true,
      authorityOk: false,
      mode: "keeperhub-live",
      liveProvider: true,
      summary: execution.summary,
      data: { execution },
      issues: [...(execution.blockingReasons ?? []), ...execution.degradedReasons].map((reason) => ({
        code: reason,
        message: reason,
        path: "keeperhub"
      }))
    };
  }
  if ((group === "execution" || group === "keeperhub") && command === "live-submit") {
    const execution = await submitCenterKeeperHubLiveWorkflow();
    return {
      command: `${group} live-submit`,
      ok: execution.ok,
      commandOk: true,
      authorityOk: false,
      mode: "keeperhub-live",
      liveProvider: true,
      summary: execution.summary,
      data: { execution },
      issues: [...(execution.blockingReasons ?? []), ...execution.degradedReasons].map((reason) => ({
        code: reason,
        message: reason,
        path: "keeperhub"
      }))
    };
  }
  if ((group === "execution" || group === "keeperhub") && command === "live-run-status") {
    const execution = await getCenterKeeperHubLiveRunStatus();
    return {
      command: `${group} live-run-status`,
      ok: execution.ok,
      commandOk: true,
      authorityOk: false,
      mode: "keeperhub-live",
      liveProvider: true,
      summary: execution.summary,
      data: { execution },
      issues: [...(execution.blockingReasons ?? []), ...execution.degradedReasons].map((reason) => ({
        code: reason,
        message: reason,
        path: "keeperhub"
      }))
    };
  }
  if (group === "signer" && isSignerRoute(command)) {
    const signer = await getCenterSignerStatus(command);
    return {
      command: `signer ${command}`,
      ok: false,
      commandOk: true,
      authorityOk: false,
      mode: "signer-local-fixture",
      liveProvider: false,
      summary: signer.summary,
      data: { signer },
      issues: signer.degradedReasons.map((reason) => ({
        code: reason,
        message: reason,
        path: "signer"
      }))
    };
  }
  if (group === "module" && command === "list") {
    return {
      command: "module list",
      ok: true,
      commandOk: true,
      authorityOk: true,
      mode: "fixture-only",
      fixtureSource: "contracts/examples/",
      liveProvider: false,
      summary: "Center module registry reports local-ready modules and deferred live provider adapters.",
      data: { modules: listCenterModules() },
      issues: []
    };
  }
  if (group === "module" && command === "doctor") {
    const doctor = await runModuleDoctor();
    return {
      command: "module doctor",
      ok: doctor.ok,
      commandOk: true,
      authorityOk: doctor.ok,
      mode: "fixture-only",
      fixtureSource: "contracts/examples/",
      liveProvider: false,
      summary: doctor.memory.ok
        ? "Module doctor checked local skeleton metadata and local memory adapter status."
        : "Module doctor found degraded local memory adapter status. No live provider was used.",
      data: { doctor },
      issues: doctor.issues.map((issue) => ({
        code: issue.code,
        message: issue.message,
        path: issue.moduleId
      }))
    };
  }
  if (group === "memory" && (command === "status" || command === "check" || command === "audit-bundle")) {
    const memory = await getCenterMemoryStatus();
    return {
      command: `memory ${command}`,
      ok: memory.ok,
      commandOk: true,
      authorityOk: memory.ok,
      mode: "local-memory",
      liveProvider: false,
      summary:
        command === "audit-bundle"
          ? "Local memory audit-bundle check ran without live 0G provider usage."
          : "Local memory checks ran without live 0G provider usage.",
      data: { memory },
      issues: memory.degradedReasons.map((reason) => ({
        code: "memory_degraded",
        message: reason,
        path: "zerog"
      }))
    };
  }
  if (group === "memory" && command === "live-status") {
    const memory = await getZeroGLiveReadinessStatus();
    return {
      command: "memory live-status",
      ok: memory.ok,
      commandOk: true,
      authorityOk: false,
      mode: "live-readiness",
      liveProvider: true,
      summary: "0G live readiness preflight checked config, SDK importability, and live-write blockers without uploading.",
      data: { memory },
      issues: memory.degradedReasons.map((reason) => ({
        code: "memory_degraded",
        message: reason,
        path: "zerog"
      }))
    };
  }
  if (group === "memory" && command === "live-smoke") {
    const memory = await getZeroGLiveSmokeStatus();
    return {
      command: "memory live-smoke",
      ok: memory.ok,
      commandOk: true,
      authorityOk: memory.ok,
      mode: "live-readiness",
      liveProvider: true,
      summary: "0G live smoke attempts upload/readback only when env, funds, and live-write opt-in are present.",
      data: { memory },
      issues: memory.degradedReasons.map((reason) => ({
        code: "memory_degraded",
        message: reason,
        path: "zerog"
      }))
    };
  }
  if (group === "memory" && command === "live-bindings") {
    const bindings = await getZeroGLiveBindingsStatus();
    return {
      command: "memory live-bindings",
      ok: bindings.ok,
      commandOk: true,
      authorityOk: false,
      mode: "live-readiness",
      liveProvider: true,
      summary: "0G live binding uploads generate ENS text-record values for the selected agent identity.",
      data: { bindings },
      issues: [...new Set([...bindings.blockingReasons, ...bindings.degradedReasons])].map((reason) => ({
        code: bindings.blockingReasons.includes(reason) ? "memory_blocked" : "memory_degraded",
        message: reason,
        path: "zerog"
      }))
    };
  }

  return {
    command: "unknown",
    ok: false,
    commandOk: false,
    authorityOk: false,
    summary: "Unknown command. Expected center, intent, authority, test, credentials, accountkit, alchemy, identity, execution, keeperhub, signer, module, or memory command family.",
    data: {
      usage: [
        "center status",
        "center inspect",
        "intent validate",
        "intent state",
        "authority evaluate",
        "test local",
        "credentials status",
        "accountkit status",
        "accountkit setup-prompt",
        "identity status",
        "identity bind-records",
        "identity send-bind-records",
        "execution status",
        "keeperhub status",
        "keeperhub live-status",
        "keeperhub live-submit",
        "keeperhub live-run-status",
        "signer status",
        "signer preview",
        "signer typed-data",
        "signer metadata",
        "module list",
        "module doctor",
        "memory status",
        "memory check",
        "memory audit-bundle",
        "memory live-status",
        "memory live-smoke",
        "memory live-bindings"
      ]
    },
    issues: [{ code: "unknown_command", message: parsed.positionals.join(" ") || "No command provided." }]
  };
}

function isSignerRoute(command: string | undefined): command is SignerRoute {
  return command === "status" || command === "preview" || command === "typed-data" || command === "metadata";
}

export function parseArgs(args: string[]): { options: CliOptions; positionals: string[] } {
  const positionals: string[] = [];
  let json = false;
  let fixture: FixtureName = "valid";

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--json") {
      json = true;
      continue;
    }
    if (arg === "--fixture") {
      fixture = parseFixtureName(args[index + 1]);
      index += 1;
      continue;
    }
    if (arg.startsWith("--fixture=")) {
      fixture = parseFixtureName(arg.slice("--fixture=".length));
      continue;
    }
    positionals.push(arg);
  }

  return { options: { json, fixture }, positionals };
}

function buildStateResult(command: string, fixtureName: FixtureName, inspect = false): CliCommandResult {
  const fixture = loadFixture(fixtureName);
  const snapshot = deriveCoreStateSnapshot({ intent: fixture.intent, evidence: fixture.evidence });
  return {
    command,
    ok: snapshot.blockingIssues.length === 0,
    commandOk: true,
    authorityOk: snapshot.blockingIssues.length === 0,
    fixture: fixture.name,
    mode: "fixture-only",
    fixtureSource: "contracts/examples/",
    liveProvider: false,
    summary: inspect
      ? "Rendered full fixture-backed core state snapshot. Blocked results describe fixture evidence gaps, not a CLI crash."
      : `Next action is ${snapshot.nextAction?.code ?? "none"}. Blocked results describe fixture evidence gaps, not a CLI crash.`,
    data: { snapshot },
    issues: snapshot.blockingIssues
  };
}

async function buildValidationResult(fixtureName: FixtureName): Promise<CliCommandResult> {
  const fixture = loadFixture(fixtureName);
  const validator = await createContractValidator();
  const checks = [
    validate("AgentIntent", fixture.intent),
    fixture.policy === undefined ? undefined : validate("AgentPolicy", fixture.policy)
  ].filter((check): check is NonNullable<typeof check> => check !== undefined);
  const issues = checks.flatMap((check) => check.issues);

  return {
    command: "intent validate",
    ok: issues.length === 0,
    commandOk: true,
    authorityOk: issues.length === 0,
    fixture: fixture.name,
    mode: "fixture-only",
    fixtureSource: "contracts/examples/",
    liveProvider: false,
    summary: issues.length === 0 ? "Fixture payloads match canonical contract schemas." : "Fixture payload validation failed.",
    data: { checks },
    issues
  };

  function validate(kind: ContractKind, payload: unknown): { kind: ContractKind; ok: boolean; issues: ResultIssue[] } {
    const result = validator.validateContract(kind, payload);
    return { kind, ok: result.ok, issues: result.issues };
  }
}

function buildEvaluationResult(fixtureName: FixtureName): CliCommandResult {
  const fixture = loadFixture(fixtureName);
  const evaluation = evaluateCoreAuthority({
    intent: fixture.intent,
    policy: fixture.policy,
    evidence: fixture.evidence,
    now: defaultClock
  });

  return {
    command: "authority evaluate",
    ok: evaluation.issues.length === 0,
    commandOk: true,
    authorityOk: evaluation.issues.length === 0,
    fixture: fixture.name,
    mode: "fixture-only",
    fixtureSource: "contracts/examples/",
    liveProvider: false,
    summary: evaluation.issues.length === 0 ? "Authority evaluation passed." : "Authority evaluation is blocked by core issue codes.",
    data: { evaluation },
    issues: evaluation.issues
  };
}
