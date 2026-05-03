import { sha256Hex, stableStringify } from "../../core/src";
import { loadZeroGLiveConfig } from "./live-config";

type BindingCheckStatus = "pass" | "fail" | "degraded";

type BindingCheck = {
  id: "config" | "wallet" | "funds" | "policy" | "audit" | "agent-card" | "ens-records" | "proof";
  label: string;
  status: BindingCheckStatus;
  detail: string;
};

type BindingArtifact = {
  name: "policy" | "audit" | "agent-card";
  uri: string;
  hash: string;
  rootHash: string;
  txHash: string;
};

type EnsBindingRecords = {
  agentCard: string;
  policyUri: string;
  policyHash: string;
  auditLatest: string;
  clearintentVersion: string;
};

export type ZeroGLiveBindingsStatus = {
  ok: boolean;
  providerMode: "live";
  claimLevel: "local-adapter" | "0g-write-submitted" | "0g-write-read" | "0g-write-read-verified";
  liveProvider: true;
  summary: string;
  ensName?: string;
  controllerAddress?: string;
  records?: EnsBindingRecords;
  artifacts: BindingArtifact[];
  checks: BindingCheck[];
  blockingReasons: string[];
  degradedReasons: string[];
};

type UploadResult = BindingArtifact & {
  payload: unknown;
};

const zeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000";
const defaultVersion = "0.1.0";

export async function getZeroGLiveBindingsStatus(env: NodeJS.ProcessEnv = process.env): Promise<ZeroGLiveBindingsStatus> {
  const readiness = loadZeroGLiveConfig(env);
  const ensName = nonEmpty(env.ENS_NAME) ?? nonEmpty(env.CLEARINTENT_ENS_NAME);
  const controllerAddress = nonEmpty(env.ZERO_G_WALLET_ADDRESS);
  const executorAddress = nonEmpty(env.KEEPERHUB_EXECUTOR_ADDRESS) ?? controllerAddress;
  const clearintentVersion = nonEmpty(env.CLEARINTENT_VERSION) ?? defaultVersion;

  const blockingReasons: string[] = readiness.issues.map((item) => item.code);
  if (ensName === undefined) {
    blockingReasons.push("missing_ens_name");
  }
  if (controllerAddress === undefined) {
    blockingReasons.push("missing_controller_address");
  }

  if (blockingReasons.length > 0 || ensName === undefined || controllerAddress === undefined) {
    return blockedStatus(ensName, controllerAddress, blockingReasons);
  }

  const privateKey = normalizePrivateKey(env.ZERO_G_PRIVATE_KEY);
  if (privateKey === undefined) {
    return blockedStatus(ensName, controllerAddress, ["missing_credentials"]);
  }

  const degradedReasons = executorAddress === controllerAddress ? ["keeperhub_executor_unbound"] : [];
  const verificationMode = parseVerificationMode(env.ZERO_G_BINDINGS_VERIFICATION_MODE);
  const readbackRequired = verificationMode === "readback";
  const proof = readbackRequired && env.ZERO_G_REQUIRE_PROOF?.toLowerCase() === "true";

  try {
    const [{ Indexer, MemData }, { ethers }] = await Promise.all([import("@0gfoundation/0g-ts-sdk"), import("ethers")]);
    const provider = new ethers.JsonRpcProvider(readiness.config.evmRpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const balance = await provider.getBalance(signer.address);

    if (balance === 0n) {
      return blockedStatus(ensName, controllerAddress, ["missing_tokens"]);
    }

    const indexer = new Indexer(readiness.config.indexerRpcUrl);
    const uploader = async (name: BindingArtifact["name"], payload: unknown): Promise<UploadResult> => {
      const encoded = stableStringify(payload);
      const bytes = Uint8Array.from(Buffer.from(encoded, "utf8"));
      const file = new MemData(bytes);
      const [upload, uploadError] = await indexer.upload(file, readiness.config.evmRpcUrl, signer);
      if (uploadError !== null) {
        throw new Error(uploadError.message);
      }

      const rootHash = "rootHash" in upload ? upload.rootHash : upload.rootHashes[0];
      const txHash = "txHash" in upload ? upload.txHash : upload.txHashes[0];
      if (rootHash === undefined || txHash === undefined) {
        throw new Error("0G upload did not return rootHash and txHash.");
      }

      if (readbackRequired) {
        const [blob, readError] = await indexer.downloadToBlob(rootHash, { proof });
        if (readError !== null) {
          throw new Error(readError.message);
        }
        const downloaded = Buffer.from(await blob.arrayBuffer()).toString("utf8");
        if (downloaded !== encoded) {
          throw new Error(`Downloaded ${name} payload did not match uploaded payload.`);
        }
      }

      return {
        name,
        uri: `0g://${rootHash}`,
        hash: sha256Hex(payload),
        rootHash,
        txHash,
        payload
      };
    };

    const policyDraft = {
      schemaVersion: "clearintent.agent-policy.v1",
      policyId: "guardian-demo-policy",
      policyHash: zeroHash,
      subject: {
        ensName,
        controllerAddress
      },
      allowedActions: ["contract_call"],
      allowedExecutors: [executorAddress],
      signerRequirements: {
        allowedSigners: [controllerAddress],
        hardwareBackedRequired: false
      },
      limits: {
        maxValue: "30000000000000000",
        deadlineSeconds: 900
      },
      riskRequirements: {
        riskReviewRequired: true,
        maxAllowedSeverity: "medium"
      }
    };
    const policyHash = sha256Hex(policyDraft);
    const policy = {
      ...policyDraft,
      policyHash
    };
    const policyUpload = await uploader("policy", policy);

    const audit = {
      schemaVersion: "clearintent.ens-0g-binding-audit.v1",
      bundleId: "guardian-demo-binding-audit",
      ensName,
      controllerAddress,
      createdAt: new Date().toISOString(),
      artifacts: {
        policy: {
          uri: policyUpload.uri,
          hash: policyHash,
          storageHash: policyUpload.hash,
          txHash: policyUpload.txHash
        }
      },
      finalStatus: degradedReasons.length > 0 ? "degraded" : "audited",
      degradedReasons
    };
    const auditUpload = await uploader("audit", audit);

    const agentCard = {
      schemaVersion: "clearintent.agent-card.v1",
      ensName,
      displayName: "Guardian Agent",
      controllerAddress,
      capabilities: ["contract_call", "policy_bound_execution", "human_review_escalation"],
      policy: {
        uri: policyUpload.uri,
        hash: policyHash
      },
      audit: {
        latest: auditUpload.uri
      },
      clearintentVersion,
      claimLevel: "ens-live-bound"
    };
    const agentCardUpload = await uploader("agent-card", agentCard);

    const artifacts = [policyUpload, auditUpload, agentCardUpload].map(({ payload: _payload, ...artifact }) => artifact);
    const records = {
      agentCard: agentCardUpload.uri,
      policyUri: policyUpload.uri,
      policyHash,
      auditLatest: auditUpload.uri,
      clearintentVersion
    };
    const verificationDegradedReasons = readbackRequired ? (proof ? [] : ["missing_proof"]) : ["readback_deferred"];
    const finalDegradedReasons = [...degradedReasons, ...verificationDegradedReasons];

    return {
      ok: finalDegradedReasons.length === 0,
      providerMode: "live",
      claimLevel: readbackRequired ? (proof ? "0g-write-read-verified" : "0g-write-read") : "0g-write-submitted",
      liveProvider: true,
      summary:
        readbackRequired
          ? degradedReasons.length === 0
            ? "0G ENS binding artifacts uploaded and read back successfully."
            : "0G ENS binding artifacts uploaded and read back, with degraded executor binding."
          : "0G ENS binding artifacts uploaded and refs generated; readback/proof verification is deferred.",
      ensName,
      controllerAddress,
      records,
      artifacts,
      checks: [
        { id: "config", label: "Live config", status: "pass", detail: "0G live endpoints configured." },
        { id: "wallet", label: "Wallet credentials", status: "pass", detail: "Wallet signer loaded without printing secrets." },
        { id: "funds", label: "Testnet funds", status: "pass", detail: "Wallet balance is nonzero." },
        { id: "policy", label: "Policy artifact", status: "pass", detail: `Uploaded policy artifact txHash=${policyUpload.txHash}.` },
        { id: "audit", label: "Audit pointer artifact", status: "pass", detail: `Uploaded audit artifact txHash=${auditUpload.txHash}.` },
        { id: "agent-card", label: "Agent card artifact", status: "pass", detail: `Uploaded agent-card artifact txHash=${agentCardUpload.txHash}.` },
        { id: "ens-records", label: "ENS binding records", status: "pass", detail: "Generated ENS text-record values from live 0G roots." },
        {
          id: "proof",
          label: "Live proof",
          status: proof ? "pass" : "degraded",
          detail: readbackRequired
            ? proof
              ? "Proof-enabled downloads were requested."
              : "Readback was requested without proof; set ZERO_G_REQUIRE_PROOF=true to test proof."
            : "Hosted fast mode returned upload refs without readback/proof verification; run memory live-bindings for proof evidence."
        }
      ],
      blockingReasons: [],
      degradedReasons: finalDegradedReasons
    };
  } catch (error) {
    return blockedStatus(ensName, controllerAddress, [error instanceof Error ? error.message : String(error)]);
  }
}

function blockedStatus(
  ensName: string | undefined,
  controllerAddress: string | undefined,
  blockingReasons: string[]
): ZeroGLiveBindingsStatus {
  return {
    ok: false,
    providerMode: "live",
    claimLevel: "local-adapter",
    liveProvider: true,
    summary: "0G ENS binding artifact upload is blocked or failed.",
    ensName,
    controllerAddress,
    artifacts: [],
    checks: [
      { id: "config", label: "Live config", status: "fail", detail: "See blocking reasons." },
      { id: "policy", label: "Policy artifact", status: "fail", detail: "No policy artifact was uploaded." },
      { id: "audit", label: "Audit pointer artifact", status: "degraded", detail: "No audit artifact was uploaded." },
      { id: "agent-card", label: "Agent card artifact", status: "degraded", detail: "No agent-card artifact was uploaded." }
    ],
    blockingReasons,
    degradedReasons: blockingReasons
  };
}

function normalizePrivateKey(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (trimmed === undefined || trimmed.length === 0) {
    return undefined;
  }
  return trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
}

function parseVerificationMode(value: string | undefined): "readback" | "submit-only" {
  return value === "submit-only" ? "submit-only" : "readback";
}

function nonEmpty(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed.length === 0 ? undefined : trimmed;
}
