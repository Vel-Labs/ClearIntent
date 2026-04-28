import { describe, expect, it } from "vitest";
import { runCli } from "../../packages/center-cli/src/cli";
import { runCenterCommand } from "../../packages/center-cli/src/commands";

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

  it("reports module doctor deferred adapters without failing the local skeleton", async () => {
    const result = await runCli(["module", "doctor", "--json"]);
    const parsed = JSON.parse(result.stdout) as { commandOk: boolean; authorityOk: boolean; ok: boolean; issues: { code: string; path: string }[] };

    expect(result.exitCode).toBe(0);
    expect(parsed.commandOk).toBe(true);
    expect(parsed.authorityOk).toBe(true);
    expect(parsed.ok).toBe(true);
    expect(parsed.issues).toEqual(expect.arrayContaining([expect.objectContaining({ code: "module_deferred", path: "ens" })]));
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
