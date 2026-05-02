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
    expect(result.stdout).toContain("execution status");
    expect(result.stdout).toContain("signer status");
    expect(result.stdout).toContain("test local");
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
    const result = await runCliWithoutOperatorSecrets(["memory", "live-status", "--json"]);
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

  it("exposes parse-safe identity status without authority or live-provider claims", async () => {
    const result = await runCli(["identity", "status", "--json"]);
    const parsed = JSON.parse(result.stdout) as {
      command: string;
      commandOk: boolean;
      authorityOk: boolean;
      ok: boolean;
      mode: string;
      liveProvider: boolean;
      data: {
        identity: {
          ok: boolean;
          ensName?: string;
          claimLevel: string;
          liveProvider: boolean;
          degradedReasons: string[];
          blockingReasons: string[];
        };
      };
      issues: { code: string; path: string }[];
    };

    expect(result.exitCode).toBe(0);
    expect(result.stdout.startsWith("{")).toBe(true);
    expect(parsed.command).toBe("identity status");
    expect(parsed.commandOk).toBe(true);
    expect(parsed.authorityOk).toBe(false);
    expect(parsed.ok).toBe(false);
    expect(parsed.mode).toBe("ens-local-fixture");
    expect(parsed.liveProvider).toBe(false);
    expect(parsed.data.identity.ok).toBe(true);
    expect(parsed.data.identity.ensName).toBe("guardian.clearintent.eth");
    expect(parsed.data.identity.claimLevel).toBe("ens-local-fixture");
    expect(parsed.data.identity.liveProvider).toBe(false);
    expect(parsed.data.identity.degradedReasons).toEqual(expect.arrayContaining(["live_ens_disabled", "live_0g_not_claimed"]));
    expect(parsed.data.identity.blockingReasons).toEqual([]);
    expect(parsed.issues).toEqual(expect.arrayContaining([expect.objectContaining({ code: "identity_degraded", path: "ens" })]));
  });

  it("exposes parse-safe live identity status without authority approval", async () => {
    const result = await runCliWithEnv(["identity", "live-status", "--json"], {
      CLEARINTENT_SECRETS_FILE: "/tmp/clearintent-test-missing-secrets.env",
      ENS_PROVIDER_RPC: "",
      ENS_EVM_RPC: "",
      PRIVATE_EVM_RPC_URL: "",
      ENS_NAME: "",
      CLEARINTENT_ENS_NAME: ""
    });
    const parsed = JSON.parse(result.stdout) as {
      command: string;
      commandOk: boolean;
      authorityOk: boolean;
      mode: string;
      liveProvider: boolean;
      data: { identity: { claimLevel: string; liveProvider: boolean; blockingReasons: string[] } };
    };

    expect(result.exitCode).toBe(0);
    expect(parsed.command).toBe("identity live-status");
    expect(parsed.commandOk).toBe(true);
    expect(parsed.authorityOk).toBe(false);
    expect(parsed.mode).toBe("ens-live-read");
    expect(parsed.liveProvider).toBe(true);
    expect(parsed.data.identity.claimLevel).toBe("ens-local-fixture");
    expect(parsed.data.identity.liveProvider).toBe(true);
    expect(parsed.data.identity.blockingReasons).toContain("live_config_missing");
  });

  it("prepares ENS binding transaction data without sending a wallet transaction", async () => {
    const result = await runCliWithEnv(["identity", "bind-records", "--json"], {
      CLEARINTENT_SECRETS_FILE: "/tmp/clearintent-test-missing-secrets.env",
      ENS_NAME: "guardian.agent.clearintent.eth",
      ENS_RESOLVER_ADDRESS: "0x4444444444444444444444444444444444444444",
      CLEARINTENT_AGENT_CARD_URI: "0g://agent-card",
      CLEARINTENT_POLICY_URI: "0g://policy",
      CLEARINTENT_POLICY_HASH: "0x1111111111111111111111111111111111111111111111111111111111111111",
      CLEARINTENT_AUDIT_LATEST: "0g://audit",
      CLEARINTENT_VERSION: "0.1.0"
    });
    const parsed = JSON.parse(result.stdout) as {
      command: string;
      commandOk: boolean;
      authorityOk: boolean;
      data: { binding: { ok: boolean; tx: { to: string; data: string; records: { key: string }[] } } };
    };

    expect(result.exitCode).toBe(0);
    expect(parsed.command).toBe("identity bind-records");
    expect(parsed.commandOk).toBe(true);
    expect(parsed.authorityOk).toBe(false);
    expect(parsed.data.binding.ok).toBe(true);
    expect(parsed.data.binding.tx.to).toBe("0x4444444444444444444444444444444444444444");
    expect(parsed.data.binding.tx.data.startsWith("0xac9650d8")).toBe(true);
    expect(parsed.data.binding.tx.records.map((record) => record.key)).toEqual([
      "agent.card",
      "policy.uri",
      "policy.hash",
      "audit.latest",
      "clearintent.version"
    ]);
  });

  it("keeps ENS binding submission blocked without explicit live-write opt-in", async () => {
    const result = await runCliWithEnv(["identity", "send-bind-records", "--json"], {
      CLEARINTENT_SECRETS_FILE: "/tmp/clearintent-test-missing-secrets.env",
      ENS_NAME: "guardian.agent.clearintent.eth",
      ENS_RESOLVER_ADDRESS: "0x4444444444444444444444444444444444444444",
      ENS_PROVIDER_RPC: "mock://ens",
      ENS_ENABLE_LIVE_WRITES: "false",
      CLEARINTENT_AGENT_CARD_URI: "0g://agent-card",
      CLEARINTENT_POLICY_URI: "0g://policy",
      CLEARINTENT_POLICY_HASH: "0x1111111111111111111111111111111111111111111111111111111111111111",
      CLEARINTENT_AUDIT_LATEST: "0g://audit",
      CLEARINTENT_VERSION: "0.1.0",
      ENS_SIGNER_PRIVATE_KEY: ""
    });
    const parsed = JSON.parse(result.stdout) as {
      command: string;
      commandOk: boolean;
      authorityOk: boolean;
      ok: boolean;
      data: { binding: { blockingReasons: string[]; transactionHash?: string } };
    };

    expect(result.exitCode).toBe(0);
    expect(parsed.command).toBe("identity send-bind-records");
    expect(parsed.commandOk).toBe(true);
    expect(parsed.authorityOk).toBe(false);
    expect(parsed.ok).toBe(false);
    expect(parsed.data.binding.blockingReasons).toEqual(
      expect.arrayContaining(["ens_live_writes_disabled", "missing_ens_signer_private_key"])
    );
    expect(parsed.data.binding.transactionHash).toBeUndefined();
  });

  it("renders identity status with explicit fixture and no-live-claim language", async () => {
    const result = await runCli(["identity", "status"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("ClearIntent identity status");
    expect(result.stdout).toContain("Authority: blocked");
    expect(result.stdout).toContain("Mode: ens-local-fixture");
    expect(result.stdout).toContain("Live provider: disabled");
    expect(result.stdout).toContain("Identity claim level: ens-local-fixture");
    expect(result.stdout).toContain("Identity status: [PASS] ok");
    expect(result.stdout).toContain("Identity authority approval: no");
    expect(result.stdout).toContain("Live ENS claim: no");
    expect(result.stdout).toContain("Live 0G claim: no");
    expect(result.stdout).toContain("Identity blocking reasons: none");
  });

  it("exposes parse-safe execution status without authority or live execution claims", async () => {
    const result = await runCli(["execution", "status", "--json"]);
    const parsed = JSON.parse(result.stdout) as {
      command: string;
      commandOk: boolean;
      authorityOk: boolean;
      ok: boolean;
      mode: string;
      liveProvider: boolean;
      data: {
        execution: {
          ok: boolean;
          claimLevel: string;
          liveProvider: boolean;
          liveExecutionProven: boolean;
          authorityApprovalProvidedByKeeperHub: boolean;
          degradedReasons: string[];
        };
      };
    };

    expect(result.exitCode).toBe(0);
    expect(result.stdout.startsWith("{")).toBe(true);
    expect(parsed.command).toBe("execution status");
    expect(parsed.commandOk).toBe(true);
    expect(parsed.authorityOk).toBe(false);
    expect(parsed.ok).toBe(false);
    expect(parsed.mode).toBe("keeperhub-local-fixture");
    expect(parsed.liveProvider).toBe(false);
    expect(parsed.data.execution.ok).toBe(true);
    expect(parsed.data.execution.claimLevel).toBe("keeperhub-local-fixture");
    expect(parsed.data.execution.liveProvider).toBe(false);
    expect(parsed.data.execution.liveExecutionProven).toBe(false);
    expect(parsed.data.execution.authorityApprovalProvidedByKeeperHub).toBe(false);
    expect(parsed.data.execution.degradedReasons).toEqual(expect.arrayContaining(["live_provider_unavailable"]));
  });

  it("exposes KeeperHub live status blockers without submitting execution", async () => {
    const result = await runCliWithEnv(["keeperhub", "live-status", "--json"], {
      CLEARINTENT_SECRETS_FILE: "/tmp/clearintent-test-missing-secrets.env",
      KEEPERHUB_API_TOKEN: "",
      KEEPERHUB_WORKFLOW_ID: "",
      KEEPERHUB_ENABLE_LIVE_PROBE: "false",
      KEEPERHUB_ENABLE_LIVE_SUBMIT: "false",
      CLEARINTENT_AGENT_CARD_URI: "",
      CLEARINTENT_POLICY_URI: "",
      CLEARINTENT_EXPECTED_POLICY_URI: "",
      CLEARINTENT_POLICY_HASH: "",
      CLEARINTENT_EXPECTED_POLICY_HASH: "",
      CLEARINTENT_AUDIT_LATEST: "",
      CLEARINTENT_EXPECTED_AUDIT_URI: ""
    });
    const parsed = JSON.parse(result.stdout) as {
      command: string;
      commandOk: boolean;
      authorityOk: boolean;
      mode: string;
      liveProvider: boolean;
      data: { execution: { claimLevel: string; providerMode: string; blockingReasons: string[]; degradedReasons: string[] } };
    };

    expect(result.exitCode).toBe(0);
    expect(result.stdout.startsWith("{")).toBe(true);
    expect(parsed.command).toBe("keeperhub live-status");
    expect(parsed.commandOk).toBe(true);
    expect(parsed.authorityOk).toBe(false);
    expect(parsed.mode).toBe("keeperhub-live");
    expect(parsed.liveProvider).toBe(true);
    expect(parsed.data.execution.claimLevel).toBe("keeperhub-live-readiness");
    expect(parsed.data.execution.providerMode).toBe("live");
    expect(parsed.data.execution.blockingReasons).toEqual(
      expect.arrayContaining(["missing_api_token", "missing_workflow_id", "missing_clearintent_binding"])
    );
  });

  it("keeps KeeperHub live-submit gated without explicit opt-in", async () => {
    const result = await runCliWithEnv(["keeperhub", "live-submit", "--json"], {
      CLEARINTENT_SECRETS_FILE: "/tmp/clearintent-test-missing-secrets.env",
      KEEPERHUB_API_TOKEN: "kh_test",
      KEEPERHUB_WORKFLOW_ID: "wf_demo",
      KEEPERHUB_EXECUTOR_ADDRESS: "0x2222222222222222222222222222222222222222",
      CLEARINTENT_AGENT_CARD_URI: "0g://agent-card",
      CLEARINTENT_POLICY_URI: "0g://policy",
      CLEARINTENT_POLICY_HASH: "0x1111111111111111111111111111111111111111111111111111111111111111",
      CLEARINTENT_AUDIT_LATEST: "0g://audit",
      KEEPERHUB_ENABLE_LIVE_SUBMIT: "false"
    });
    const parsed = JSON.parse(result.stdout) as {
      command: string;
      commandOk: boolean;
      authorityOk: boolean;
      ok: boolean;
      data: { execution: { blockingReasons: string[]; submission?: unknown } };
    };

    expect(result.exitCode).toBe(0);
    expect(parsed.command).toBe("keeperhub live-submit");
    expect(parsed.commandOk).toBe(true);
    expect(parsed.authorityOk).toBe(false);
    expect(parsed.ok).toBe(false);
    expect(parsed.data.execution.blockingReasons).toEqual(expect.arrayContaining(["live_submit_disabled"]));
    expect(parsed.data.execution.submission).toBeUndefined();
  });

  it("renders execution status with explicit local fixture and no-live-claim language", async () => {
    const result = await runCli(["keeperhub", "status"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("ClearIntent keeperhub status");
    expect(result.stdout).toContain("Authority: blocked");
    expect(result.stdout).toContain("Mode: keeperhub-local-fixture");
    expect(result.stdout).toContain("Live provider: disabled");
    expect(result.stdout).toContain("Execution claim level: keeperhub-local-fixture");
    expect(result.stdout).toContain("Execution local fixture: available");
    expect(result.stdout).toContain("Execution live proof: no");
    expect(result.stdout).toContain("KeeperHub authority approval: no");
  });

  it("exposes signer routes as local-only JSON without real-wallet claims", async () => {
    for (const route of ["status", "preview", "typed-data", "metadata"]) {
      const result = await runCli(["signer", route, "--json"]);
      const parsed = JSON.parse(result.stdout) as {
        command: string;
        commandOk: boolean;
        authorityOk: boolean;
        ok: boolean;
        mode: string;
        liveProvider: boolean;
        data: {
          signer: {
            route: string;
            claimLevels: string[];
            liveProvider: boolean;
            softwareWalletValidationStatus: string;
            walletRenderedPreviewProven: boolean;
            secureDeviceDisplayProven: boolean;
            vendorApprovedClearSigning: boolean;
          };
        };
      };

      expect(result.exitCode).toBe(0);
      expect(result.stdout.startsWith("{")).toBe(true);
      expect(parsed.command).toBe(`signer ${route}`);
      expect(parsed.commandOk).toBe(true);
      expect(parsed.authorityOk).toBe(false);
      expect(parsed.ok).toBe(false);
      expect(parsed.mode).toBe("signer-local-fixture");
      expect(parsed.liveProvider).toBe(false);
      expect(parsed.data.signer.route).toBe(route);
      expect(parsed.data.signer.liveProvider).toBe(false);
      expect(parsed.data.signer.claimLevels.every((level) => ["signer-local-fixture", "eip712-local-fixture", "erc7730-local-metadata"].includes(level))).toBe(true);
      expect(["not-prepared", "planned", "ready-for-operator-test"]).toContain(parsed.data.signer.softwareWalletValidationStatus);
      expect(parsed.data.signer.softwareWalletValidationStatus).not.toBe("software-wallet-tested");
      expect(parsed.data.signer.walletRenderedPreviewProven).toBe(false);
      expect(parsed.data.signer.secureDeviceDisplayProven).toBe(false);
      expect(parsed.data.signer.vendorApprovedClearSigning).toBe(false);
    }
  });

  it("renders signer status with explicit no-wallet-claim language", async () => {
    const result = await runCli(["signer", "status"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("ClearIntent signer status");
    expect(result.stdout).toContain("Command: ok");
    expect(result.stdout).toContain("Authority: blocked");
    expect(result.stdout).toContain("Mode: signer-local-fixture");
    expect(result.stdout).toContain("Live provider: disabled");
    expect(result.stdout).toContain("Signer live provider: disabled");
    expect(result.stdout).toContain("Wallet-rendered preview proven: no");
    expect(result.stdout).toContain("Secure-device display proven: no");
    expect(result.stdout).toContain("Vendor-approved Clear Signing: no");
  });

  it("runs an aggregate local layer test with local and onchain status columns", async () => {
    const result = await runCli(["test", "local", "--json"]);
    const parsed = JSON.parse(result.stdout) as {
      command: string;
      commandOk: boolean;
      authorityOk: boolean;
      ok: boolean;
      liveProvider: boolean;
      data: {
        testSummary: {
          ok: boolean;
          items: {
            id: string;
            label: string;
            local: { status: string; indicator: string; claimLevel?: string };
            onchain: { status: string; indicator: string };
          }[];
        };
      };
    };

    expect(result.exitCode).toBe(0);
    expect(result.stdout.startsWith("{")).toBe(true);
    expect(parsed.command).toBe("test local");
    expect(parsed.commandOk).toBe(true);
    expect(parsed.authorityOk).toBe(false);
    expect(parsed.ok).toBe(true);
    expect(parsed.liveProvider).toBe(false);
    expect(parsed.data.testSummary.ok).toBe(true);
    expect(parsed.data.testSummary.items.map((item) => item.id)).toEqual([
      "contracts",
      "core",
      "zerog",
      "ens",
      "keeperhub",
      "signer-payload",
      "metadata",
      "cross-layer"
    ]);
    expect(parsed.data.testSummary.items.every((item) => item.local.status === "tested")).toBe(true);
    expect(parsed.data.testSummary.items.find((item) => item.id === "zerog")?.onchain.status).toBe("not-tested");
    expect(parsed.data.testSummary.items.find((item) => item.id === "metadata")?.local.claimLevel).toBe("erc7730-local-metadata");
  });

  it("renders aggregate local layer test as simple human indicators", async () => {
    const result = await runCli(["test", "local"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("ClearIntent test local");
    expect(result.stdout).toContain("Layer test summary");
    expect(result.stdout).toContain("------------------------------------------------------------");
    expect(result.stdout).toContain("Contracts tested");
    expect(result.stdout).toContain("0G tested");
    expect(result.stdout).toContain("ENS tested");
    expect(result.stdout).toContain("KeeperHub tested");
    expect(result.stdout).toContain("Signer payload tested");
    expect(result.stdout).toContain("Metadata tested");
    expect(result.stdout).toContain("End to End / Cross Layer tested");
    expect(result.stdout).toContain("Local:        ✅ tested (local-adapter)");
    expect(result.stdout).toContain("Local:        ✅ tested (ens-local-fixture)");
    expect(result.stdout).toContain("Local:        ✅ tested (keeperhub-local-fixture)");
    expect(result.stdout).toContain("Local:        ✅ tested (erc7730-local-metadata)");
    expect(result.stdout).toContain("Onchain/live: [ ] not tested");
  });

  it("checks credential safety without printing secrets", async () => {
    const result = await runCli(["credentials", "status", "--json"]);
    const parsed = JSON.parse(result.stdout) as {
      command: string;
      commandOk: boolean;
      authorityOk: boolean;
      liveProvider: boolean;
      data: {
        credentials: {
          secretsPrinted: boolean;
          configured: {
            zeroGPrivateKey: string;
            zeroGWalletAddress: string;
          };
          checks: { id: string; status: string }[];
        };
      };
    };

    expect(result.exitCode).toBe(0);
    expect(result.stdout.startsWith("{")).toBe(true);
    expect(parsed.command).toBe("credentials status");
    expect(parsed.commandOk).toBe(true);
    expect(parsed.authorityOk).toBe(false);
    expect(parsed.liveProvider).toBe(false);
    expect(parsed.data.credentials.secretsPrinted).toBe(false);
    expect(["present", "missing", "invalid"]).toContain(parsed.data.credentials.configured.zeroGPrivateKey);
    expect(["present", "missing", "invalid"]).toContain(parsed.data.credentials.configured.zeroGWalletAddress);
    expect(parsed.data.credentials.checks.map((check) => check.id)).toEqual(
      expect.arrayContaining(["env-example", "gitignore-env", "tracked-env", "zerog-private-key", "live-writes"])
    );
    expect(result.stdout).not.toMatch(/0x[a-fA-F0-9]{64}/);
  });

  it("renders credential safety in human mode without secret values", async () => {
    const result = await runCli(["credentials", "status"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("ClearIntent credentials status");
    expect(result.stdout).toContain("Credential safety:");
    expect(result.stdout).toContain("Secrets printed: no");
    expect(result.stdout).toContain("ZERO_G_PRIVATE_KEY:");
    expect(result.stdout).not.toMatch(/0x[a-fA-F0-9]{64}/);
  });

  it("exposes a blocked live smoke command until credentials and funds are present", async () => {
    const result = await runCliWithoutOperatorSecrets(["memory", "live-smoke", "--json"]);
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

  it("exposes blocked live ENS binding uploads until credentials and opt-in are present", async () => {
    const result = await runCliWithoutOperatorSecrets(["memory", "live-bindings", "--json"]);
    const parsed = JSON.parse(result.stdout) as {
      command: string;
      commandOk: boolean;
      authorityOk: boolean;
      ok: boolean;
      liveProvider: boolean;
      data: { bindings: { claimLevel: string; blockingReasons: string[]; records?: unknown } };
    };

    expect(result.exitCode).toBe(0);
    expect(parsed.command).toBe("memory live-bindings");
    expect(parsed.commandOk).toBe(true);
    expect(parsed.authorityOk).toBe(false);
    expect(parsed.ok).toBe(false);
    expect(parsed.liveProvider).toBe(true);
    expect(parsed.data.bindings.claimLevel).toBe("local-adapter");
    expect(parsed.data.bindings.blockingReasons).toEqual(expect.arrayContaining(["live_writes_disabled"]));
    expect(parsed.data.bindings.records).toBeUndefined();
  });

  it("renders blocked live ENS binding uploads in human mode", async () => {
    const result = await runCliWithoutOperatorSecrets(["memory", "live-bindings"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("ClearIntent memory live-bindings");
    expect(result.stdout).toContain("Binding claim level: local-adapter");
    expect(result.stdout).toContain("Binding blocking reasons:");
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

async function runCliWithoutOperatorSecrets(args: string[]): Promise<{ exitCode: number; stdout: string }> {
  const saved = {
    CLEARINTENT_SECRETS_FILE: process.env.CLEARINTENT_SECRETS_FILE,
    ZERO_G_PRIVATE_KEY: process.env.ZERO_G_PRIVATE_KEY,
    ZERO_G_WALLET_ADDRESS: process.env.ZERO_G_WALLET_ADDRESS,
    ZERO_G_ENABLE_LIVE_WRITES: process.env.ZERO_G_ENABLE_LIVE_WRITES
  };
  process.env.CLEARINTENT_SECRETS_FILE = "/tmp/clearintent-test-missing-secrets.env";
  delete process.env.ZERO_G_PRIVATE_KEY;
  delete process.env.ZERO_G_WALLET_ADDRESS;
  process.env.ZERO_G_ENABLE_LIVE_WRITES = "false";
  try {
    return await runCli(args);
  } finally {
    restoreEnv("CLEARINTENT_SECRETS_FILE", saved.CLEARINTENT_SECRETS_FILE);
    restoreEnv("ZERO_G_PRIVATE_KEY", saved.ZERO_G_PRIVATE_KEY);
    restoreEnv("ZERO_G_WALLET_ADDRESS", saved.ZERO_G_WALLET_ADDRESS);
    restoreEnv("ZERO_G_ENABLE_LIVE_WRITES", saved.ZERO_G_ENABLE_LIVE_WRITES);
  }
}

async function runCliWithEnv(args: string[], env: Record<string, string>): Promise<{ exitCode: number; stdout: string }> {
  const saved = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(env)) {
    saved.set(key, process.env[key]);
    process.env[key] = value;
  }
  try {
    return await runCli(args);
  } finally {
    for (const [key, value] of saved) {
      restoreEnv(key, value);
    }
  }
}

function restoreEnv(key: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}
