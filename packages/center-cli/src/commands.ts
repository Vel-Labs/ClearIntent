import {
  createContractValidator,
  deriveCoreStateSnapshot,
  evaluateCoreAuthority,
  type ContractKind,
  type ResultIssue
} from "../../core/src";
import { defaultClock, loadFixture, parseFixtureName, type FixtureName } from "./fixtures";
import { listCenterModules, runModuleDoctor } from "./modules";
import type { CliCommandResult } from "./output";
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
  if (group === "module" && command === "list") {
    return {
      command: "module list",
      ok: true,
      commandOk: true,
      authorityOk: true,
      mode: "fixture-only",
      fixtureSource: "contracts/examples/",
      liveProvider: false,
      summary: "Center module registry is local and provider adapters are deferred.",
      data: { modules: listCenterModules() },
      issues: []
    };
  }
  if (group === "module" && command === "doctor") {
    const doctor = runModuleDoctor();
    return {
      command: "module doctor",
      ok: doctor.ok,
      commandOk: true,
      authorityOk: doctor.ok,
      mode: "fixture-only",
      fixtureSource: "contracts/examples/",
      liveProvider: false,
      summary: "Module doctor checked local skeleton metadata only.",
      data: { doctor },
      issues: doctor.issues.map((issue) => ({
        code: issue.code,
        message: issue.message,
        path: issue.moduleId
      }))
    };
  }

  return {
    command: "unknown",
    ok: false,
    commandOk: false,
    authorityOk: false,
    summary: "Unknown command. Expected center, intent, authority, or module command family.",
    data: {
      usage: [
        "center status",
        "center inspect",
        "intent validate",
        "intent state",
        "authority evaluate",
        "module list",
        "module doctor"
      ]
    },
    issues: [{ code: "unknown_command", message: parsed.positionals.join(" ") || "No command provided." }]
  };
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
