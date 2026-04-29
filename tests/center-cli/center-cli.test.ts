import { describe, expect, it } from "vitest";
import { runCli } from "../../packages/center-cli/src/cli";
import { runCenterCommand } from "../../packages/center-cli/src/commands";
import { buildModuleDoctorResult } from "../../packages/center-cli/src/modules";
import { renderHuman } from "../../packages/center-cli/src/output";

describe("ClearIntent Center CLI skeleton", () => {
  it("routes center status to a human-readable snapshot", async () => {
    const result = await runCli(["center", "status"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("ClearIntent center status");
    expect(result.stdout).toContain("Command: ok");
    expect(result.stdout).toContain("Authority: blocked");
    expect(result.stdout).toContain("Mode: fixture-only");
    expect(result.stdout).toContain("Live provider: disabled");
    expect(result.stdout).toContain("Next action: collect_signature");
    expect(result.stdout).toContain("Missing evidence: signature");
    expect(result.stdout).not.toMatch(/^\{/);
  });

  it("renders a human landing screen for bare CLI usage", async () => {
    const result = await runCli([]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("ClearIntent Center");
    expect(result.stdout).toContain("Human lane:");
    expect(result.stdout).toContain("AI lane:");
    expect(result.stdout).toContain("Current mode: fixture-only");
  });

  it("emits deterministic JSON with no leading prose", async () => {
    const result = await runCli(["center", "inspect", "--json"]);
    const parsed = JSON.parse(result.stdout) as {
      command: string;
      commandOk: boolean;
      authorityOk: boolean;
      ok: boolean;
      mode: string;
      liveProvider: boolean;
      data: { snapshot: { nextAction: { code: string } } };
    };

    expect(result.stdout.startsWith("{")).toBe(true);
    expect(result.exitCode).toBe(0);
    expect(parsed.command).toBe("center inspect");
    expect(parsed.commandOk).toBe(true);
    expect(parsed.authorityOk).toBe(false);
    expect(parsed.ok).toBe(false);
    expect(parsed.mode).toBe("fixture-only");
    expect(parsed.liveProvider).toBe(false);
    expect(parsed.data.snapshot.nextAction.code).toBe("collect_signature");
  });

  it("validates fixture payloads through canonical contract schemas", async () => {
    const result = await runCli(["intent", "validate", "--json"]);
    const parsed = JSON.parse(result.stdout) as { commandOk: boolean; authorityOk: boolean; ok: boolean; data: { checks: { kind: string; ok: boolean }[] } };

    expect(result.exitCode).toBe(0);
    expect(parsed.commandOk).toBe(true);
    expect(parsed.authorityOk).toBe(true);
    expect(parsed.ok).toBe(true);
    expect(parsed.data.checks.map((check) => check.kind)).toEqual(["AgentIntent", "AgentPolicy"]);
  });

  it("keeps missing evidence fail-closed and machine-readable", async () => {
    const result = await runCli(["intent", "state", "--fixture", "missing-evidence", "--json"]);
    const parsed = JSON.parse(result.stdout) as { commandOk: boolean; authorityOk: boolean; ok: boolean; issues: { code: string; path: string }[] };

    expect(result.exitCode).toBe(0);
    expect(parsed.commandOk).toBe(true);
    expect(parsed.authorityOk).toBe(false);
    expect(parsed.ok).toBe(false);
    expect(parsed.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "missing_lifecycle_evidence", path: "policy" })])
    );
  });

  it("uses evaluateCoreAuthority issue codes for blocked authority", async () => {
    const result = await runCli(["authority", "evaluate", "--fixture=expired", "--json"]);
    const parsed = JSON.parse(result.stdout) as { commandOk: boolean; authorityOk: boolean; ok: boolean; issues: { code: string }[] };

    expect(result.exitCode).toBe(0);
    expect(parsed.commandOk).toBe(true);
    expect(parsed.authorityOk).toBe(false);
    expect(parsed.ok).toBe(false);
    expect(parsed.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining(["deadline_expired"]));
  });

  it("reports local memory status without implying live provider usage", async () => {
    const result = await runCli(["module", "doctor", "--json"]);
    const parsed = JSON.parse(result.stdout) as {
      commandOk: boolean;
      authorityOk: boolean;
      ok: boolean;
      liveProvider: boolean;
      data: {
        doctor: {
          memory: {
            ok: boolean;
            providerMode: string;
            claimLevel: string;
            liveProvider: boolean;
            localOnly: boolean;
            checks: { id: string; status: string }[];
            degradedReasons: string[];
          };
        };
      };
      issues: { code: string; path: string }[];
    };

    expect(result.exitCode).toBe(0);
    expect(parsed.commandOk).toBe(true);
    expect(parsed.authorityOk).toBe(true);
    expect(parsed.ok).toBe(true);
    expect(parsed.liveProvider).toBe(false);
    expect(parsed.data.doctor.memory).toMatchObject({
      ok: true,
      providerMode: "local",
      claimLevel: "local-adapter",
      liveProvider: false,
      localOnly: true
    });
    expect(parsed.data.doctor.memory.checks.map((check) => check.id)).toEqual(["write", "read", "hash", "audit-bundle", "proof"]);
    expect(parsed.data.doctor.memory.checks.slice(0, 4).every((check) => check.status === "pass")).toBe(true);
    expect(parsed.data.doctor.memory.checks[4]?.status).toBe("local-only");
    expect(parsed.data.doctor.memory.degradedReasons).toEqual(
      expect.arrayContaining(["missing_proof", "live_provider_disabled"])
    );
    expect(parsed.issues).toEqual(expect.arrayContaining([expect.objectContaining({ code: "module_deferred", path: "ens" })]));
    expect(parsed.issues).toEqual(expect.arrayContaining([expect.objectContaining({ code: "memory_degraded", path: "zerog" })]));
  });

  it("renders local memory checks with plain-text status markers", async () => {
    const result = await runCli(["module", "doctor"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Memory provider mode: local");
    expect(result.stdout).toContain("Memory claim level: local-adapter");
    expect(result.stdout).toContain("Memory live provider: disabled");
    expect(result.stdout).toContain("[LOCAL-ONLY] local-only");
    expect(result.stdout).toContain("Write check: [PASS] pass");
    expect(result.stdout).toContain("Read check: [PASS] pass");
    expect(result.stdout).toContain("Hash validation: [PASS] pass");
    expect(result.stdout).toContain("Audit bundle: [PASS] pass");
    expect(result.stdout).toContain("Proof check: [LOCAL-ONLY] local-only");
  });

  it("exposes deterministic memory command JSON for local checks", async () => {
    const result = await runCli(["memory", "check", "--json"]);
    const parsed = JSON.parse(result.stdout) as {
      command: string;
      commandOk: boolean;
      authorityOk: boolean;
      mode: string;
      liveProvider: boolean;
      data: { memory: { providerMode: string; claimLevel: string; checks: { id: string; status: string }[] } };
    };

    expect(result.exitCode).toBe(0);
    expect(result.stdout.startsWith("{")).toBe(true);
    expect(parsed.command).toBe("memory check");
    expect(parsed.commandOk).toBe(true);
    expect(parsed.authorityOk).toBe(true);
    expect(parsed.mode).toBe("local-memory");
    expect(parsed.liveProvider).toBe(false);
    expect(parsed.data.memory.providerMode).toBe("local");
    expect(parsed.data.memory.claimLevel).toBe("local-adapter");
    expect(parsed.data.memory.checks.map((check) => check.id)).toEqual(["write", "read", "hash", "audit-bundle", "proof"]);
  });

  it("renders memory audit-bundle checks in human mode", async () => {
    const result = await runCli(["memory", "audit-bundle"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("ClearIntent memory audit-bundle");
    expect(result.stdout).toContain("Mode: local-memory");
    expect(result.stdout).toContain("Audit bundle: [PASS] pass");
    expect(result.stdout).toContain("Memory live provider: disabled");
  });

  it("reports 0G live readiness blockers without claiming live writes", async () => {
    const result = await runCli(["memory", "live-status", "--json"]);
    const parsed = JSON.parse(result.stdout) as {
      command: string;
      commandOk: boolean;
      authorityOk: boolean;
      ok: boolean;
      mode: string;
      liveProvider: boolean;
      data: { memory: { providerMode: string; claimLevel: string; checks: { id: string; status: string }[]; degradedReasons: string[] } };
    };

    expect(result.exitCode).toBe(0);
    expect(result.stdout.startsWith("{")).toBe(true);
    expect(parsed.command).toBe("memory live-status");
    expect(parsed.commandOk).toBe(true);
    expect(parsed.authorityOk).toBe(false);
    expect(parsed.ok).toBe(false);
    expect(parsed.mode).toBe("live-readiness");
    expect(parsed.liveProvider).toBe(true);
    expect(parsed.data.memory.providerMode).toBe("live");
    expect(parsed.data.memory.claimLevel).toBe("local-adapter");
    expect(parsed.data.memory.checks.map((check) => check.id)).toEqual(["config", "sdk", "wallet", "funds", "write", "read", "proof"]);
    expect(parsed.data.memory.degradedReasons).toEqual(
      expect.arrayContaining(["missing_credentials", "live_writes_disabled", "missing_tokens", "live_write_unverified"])
    );
  });

  it("exposes a blocked live smoke command until credentials and funds are present", async () => {
    const result = await runCli(["memory", "live-smoke", "--json"]);
    const parsed = JSON.parse(result.stdout) as {
      command: string;
      commandOk: boolean;
      authorityOk: boolean;
      ok: boolean;
      liveProvider: boolean;
      data: { memory: { providerMode: string; claimLevel: string; degradedReasons: string[] } };
    };

    expect(result.exitCode).toBe(0);
    expect(parsed.command).toBe("memory live-smoke");
    expect(parsed.commandOk).toBe(true);
    expect(parsed.authorityOk).toBe(false);
    expect(parsed.ok).toBe(false);
    expect(parsed.liveProvider).toBe(true);
    expect(parsed.data.memory.providerMode).toBe("live");
    expect(parsed.data.memory.claimLevel).toBe("local-adapter");
    expect(parsed.data.memory.degradedReasons).toEqual(
      expect.arrayContaining(["missing_credentials", "live_writes_disabled"])
    );
  });

  it("renders successful local memory adapter status when the integration API provides it", () => {
    const doctor = buildModuleDoctorResult({
      ok: true,
      providerMode: "local",
      claimLevel: "local-adapter",
      liveProvider: false,
      localOnly: true,
      summary: "Local adapter wrote, read, hash-validated, and bundled audit artifacts.",
      checks: [
        { id: "write", label: "Write check", status: "pass", detail: "Stored policy artifact locally." },
        { id: "read", label: "Read check", status: "pass", detail: "Read policy artifact locally." },
        { id: "hash", label: "Hash validation", status: "pass", detail: "Content hash matched on readback." },
        { id: "audit-bundle", label: "Audit bundle", status: "local-only", detail: "Generated local audit bundle refs." }
      ],
      degradedReasons: []
    });
    const human = renderHuman({
      command: "module doctor",
      ok: doctor.ok,
      commandOk: true,
      authorityOk: doctor.ok,
      mode: "fixture-only",
      fixtureSource: "contracts/examples/",
      liveProvider: false,
      summary: "Module doctor checked local skeleton metadata and local memory adapter status.",
      data: { doctor },
      issues: doctor.issues.map((issue) => ({ code: issue.code, message: issue.message, path: issue.moduleId }))
    });

    expect(doctor.ok).toBe(true);
    expect(human).toContain("Memory status: [PASS] ok");
    expect(human).toContain("Write check: [PASS] pass");
    expect(human).toContain("Audit bundle: [LOCAL-ONLY] local-only");
    expect(human).toContain("Memory degraded reasons: none");
  });

  it("rejects unknown command families", async () => {
    const result = await runCenterCommand(["adapter", "start"]);

    expect(result.ok).toBe(false);
    expect(result.issues[0]?.code).toBe("unknown_command");
  });

  it("keeps CLI errors parseable when JSON is requested", async () => {
    const result = await runCli(["center", "status", "--fixture", "unknown", "--json"]);
    const parsed = JSON.parse(result.stdout) as { command: string; commandOk: boolean; authorityOk: boolean; issues: { code: string }[] };

    expect(result.exitCode).toBe(1);
    expect(result.stdout.startsWith("{")).toBe(true);
    expect(parsed.command).toBe("error");
    expect(parsed.commandOk).toBe(false);
    expect(parsed.authorityOk).toBe(false);
    expect(parsed.issues[0]?.code).toBe("cli_error");
  });
});
