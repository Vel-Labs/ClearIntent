import { useEffect, useMemo, useState } from "react";
import {
  deployParentOwnedAgentAccount,
  deriveParentOwnedAgentAccount,
  getAlchemyReadiness,
  type AlchemyReadiness,
  type AgentAccountEvidence
} from "../../lib/alchemy";
import { isUsableAgentLabel, normalizeAgentLabel, toAgentEnsName } from "../../lib/ens/names";
import type { Eip1193Provider } from "../../lib/wallet";

export type SetupWizardStatus = "not-started" | "in-progress" | "complete";

type WizardStep = {
  id: string;
  label: string;
  shortLabel: string;
  summary: string;
  detail: string;
  approval: string;
  actionLabel: string;
  evidenceLabel: string;
  proofTarget: string;
  blocker?: string;
};

type SetupWizardProps = {
  status: SetupWizardStatus;
  activeStepIndex: number;
  onAdvance: () => void;
  onComplete: () => void;
  onStart: () => void;
};

type NameCheckState =
  | { status: "idle"; message: string }
  | { status: "checking"; message: string }
  | { status: "available"; message: string }
  | { status: "taken"; message: string }
  | { status: "error"; message: string };

type AccountStepState =
  | { status: "idle"; message: string }
  | { status: "creating"; message: string }
  | { status: "ready"; message: string; evidence: AgentAccountEvidence; issues: string[] }
  | { status: "deploying"; message: string; evidence?: AgentAccountEvidence }
  | { status: "deployed"; message: string; evidence: AgentAccountEvidence; issues: string[] }
  | { status: "error"; message: string; issues: string[]; evidence?: AgentAccountEvidence };

type AccountFundingState =
  | { status: "idle" }
  | { status: "funding"; amountWei: bigint; accountAddress: string }
  | { status: "submitted"; amountWei: bigint; accountAddress: string; transactionHash: string }
  | { status: "error"; amountWei: bigint; accountAddress: string; message: string };

type StepOperationState =
  | { status: "idle"; message: string }
  | { status: "running"; message: string }
  | { status: "prepared"; message: string; evidence: Record<string, unknown>; transactions: PreparedWalletTransaction[]; issues: string[] }
  | { status: "ready"; message: string; evidence: Record<string, unknown>; issues: string[] }
  | { status: "error"; message: string; issues: string[]; evidence?: Record<string, unknown> };

type ZeroGRecords = {
  agentCard: string;
  policyUri: string;
  policyHash: string;
  auditLatest: string;
  clearintentVersion: string;
};

type PreparedWalletTransaction = {
  label: string;
  to: string;
  value: string;
  data: string;
};

type AccountKitConfigPayload = AlchemyReadiness & {
  env?: Record<string, string | undefined>;
};

type CopyState = "idle" | "copied" | "error";

const suggestedAgentGasTopUpWei = 500_000_000_000_000n;
const hostedZeroGTimeoutMs = 180_000;
const walletReceiptTimeoutMs = 150_000;
const walletReceiptPollMs = 3_000;
const lowCostPriorityFeeWei = 500_000_000n;
const lowCostFeeMultiplierNumerator = 12n;
const lowCostFeeMultiplierDenominator = 10n;

const wizardSteps: WizardStep[] = [
  {
    id: "username",
    label: "Choose agent name",
    shortLabel: "Name",
    summary: "Check availability for a subname such as velcrafting.agent.clearintent.eth.",
    detail:
      "The parent wallet chooses a readable operating identity. The app checks ENS availability before preparing any transaction.",
    approval: "No approval",
    actionLabel: "Use this name",
    evidenceLabel: "ENS Registry read",
    proofTarget: "owner(namehash) returns zero address"
  },
  {
    id: "account",
    label: "Create agent account",
    shortLabel: "Account",
    summary: "Create or predict the parent-owned Alchemy smart account.",
    detail:
      "The parent wallet stays in control. The agent account is the purpose-built operating account for trading and policy-bound execution.",
    approval: "Wallet approval",
    actionLabel: "Derive smart account",
    evidenceLabel: "Smart account address",
    proofTarget: "Account Kit deployment UserOperation submitted by parent wallet"
  },
  {
    id: "ens",
    label: "Claim ENS subname",
    shortLabel: "Subname",
    summary: "Bind the selected subname to the agent smart account address.",
    detail:
      "Create the ENS identity and point it at the agent smart account. Today this uses parent-wallet ENS transactions; a controller can collapse this into one approval.",
    approval: "Wallet approval 1",
    actionLabel: "Prepare ENS claim",
    evidenceLabel: "ENS claim transaction",
    proofTarget: "Subname owner/resolver points at agent account"
  },
  {
    id: "zerog",
    label: "Publish policy artifacts",
    shortLabel: "0G",
    summary: "Write the agent card, policy, and audit pointer artifacts to 0G.",
    detail:
      "This is the offchain/decentralized storage leg. The wizard should show this as a loading state while the 0G refs are prepared.",
    approval: "Provider step",
    actionLabel: "Publish to 0G",
    evidenceLabel: "0G artifact roots",
    proofTarget: "agent.card, policy.uri, audit.latest"
  },
  {
    id: "records",
    label: "Bind ENS records",
    shortLabel: "Records",
    summary: "Set agent.card, policy.uri, policy.hash, audit.latest, and version.",
    detail:
      "The ENS Public Resolver can set the ClearIntent text records with one resolver multicall once the 0G refs exist.",
    approval: "Wallet approval 2",
    actionLabel: "Prepare record transaction",
    evidenceLabel: "Resolver multicall receipt",
    proofTarget: "Required ClearIntent text records resolve on ENS"
  },
  {
    id: "keeperhub",
    label: "Connect execution gate",
    shortLabel: "Gate",
    summary: "Attach KeeperHub workflow routing and event-ingest references.",
    detail:
      "KeeperHub remains the execution layer after ClearIntent verification. Webhook delivery stays disabled until clearintent.xyz is live.",
    approval: "Config step",
    actionLabel: "Submit KeeperHub gate",
    evidenceLabel: "Workflow run status",
    proofTarget: "KeeperHub workflow accepts ClearIntent payload"
  },
  {
    id: "ready",
    label: "Ready state",
    shortLabel: "Ready",
    summary: "Export the SDK handoff and show the custody map.",
    detail:
      "The agent receives references, policy hashes, and endpoints. It never receives the parent wallet seed phrase or unrestricted authority.",
    approval: "No approval",
    actionLabel: "Complete setup",
    evidenceLabel: "Agent handoff bundle",
    proofTarget: "Custody map plus SDK prompt",
    blocker: "Ready state requires all prior evidence."
  }
];

export function SetupWizard({ activeStepIndex, onAdvance, onComplete, onStart, status }: SetupWizardProps) {
  const [agentName, setAgentName] = useState("");
  const [nameCheck, setNameCheck] = useState<NameCheckState>({
    status: "idle",
    message: "Enter a name to check ENS availability."
  });
  const [accountStep, setAccountStep] = useState<AccountStepState>({
    status: "idle",
    message: "Derive the parent-owned smart account after the agent name is confirmed."
  });
  const [accountFunding, setAccountFunding] = useState<AccountFundingState>({ status: "idle" });
  const [ensStep, setEnsStep] = useState<StepOperationState>({
    status: "idle",
    message: "Deploy the smart account before preparing the ENS subname transaction."
  });
  const [zeroGStep, setZeroGStep] = useState<StepOperationState>({
    status: "idle",
    message: "Publish policy, audit, and agent-card artifacts once the ENS name is selected."
  });
  const [recordsStep, setRecordsStep] = useState<StepOperationState>({
    status: "idle",
    message: "Publish 0G artifacts before preparing the ENS resolver record multicall."
  });
  const [keeperHubStep, setKeeperHubStep] = useState<StepOperationState>({
    status: "idle",
    message: "Bind the ClearIntent execution gate after ENS records are submitted."
  });
  const [localSdkCopyState, setLocalSdkCopyState] = useState<CopyState>("idle");
  const [accountKitConfig, setAccountKitConfig] = useState<AccountKitConfigPayload>(() => ({
    ...getAlchemyReadiness(),
    env: undefined
  }));
  const safeActiveIndex = clamp(activeStepIndex, 0, wizardSteps.length - 1);
  const accountKitReadiness = accountKitConfig;
  const normalizedAgentName = useMemo(() => normalizeAgentLabel(agentName), [agentName]);
  const agentEnsName = toAgentEnsName(normalizedAgentName);
  const canCheckName = isUsableAgentLabel(normalizedAgentName) && nameCheck.status !== "checking";
  const nameIsAvailable = nameCheck.status === "available";
  const accountIsReady = accountStep.status === "deployed";
  const zeroGRecords = zeroGStep.status === "ready" ? (zeroGStep.evidence.records as ZeroGRecords | undefined) : undefined;
  const effectiveActiveIndex = safeActiveIndex > 0 && !nameIsAvailable ? 0 : safeActiveIndex;
  const activeStep = wizardSteps[effectiveActiveIndex];
  const finalStepActive = effectiveActiveIndex === wizardSteps.length - 1;

  useEffect(() => {
    let cancelled = false;
    async function loadAccountKitConfig() {
      try {
        const response = await fetch("/api/setup/accountkit-config", { method: "GET" });
        const payload = (await response.json()) as AccountKitConfigPayload;
        if (!cancelled) {
          setAccountKitConfig(payload);
        }
      } catch {
        if (!cancelled) {
          setAccountKitConfig((current) => ({
            ...current,
            notes: [...current.notes, "Local Account Kit config route was unavailable."]
          }));
        }
      }
    }

    void loadAccountKitConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  async function checkNameAvailability() {
    if (!canCheckName) return;
    setNameCheck({ status: "checking", message: `Checking ${agentEnsName} on ENS mainnet...` });

    const abortController = new AbortController();
    const timeout = window.setTimeout(() => abortController.abort(), 10_000);

    try {
      const response = await fetch(`/api/ens/availability?name=${encodeURIComponent(agentEnsName)}`, {
        method: "GET",
        signal: abortController.signal
      });
      const payload = (await response.json()) as { available?: boolean; error?: string; owner?: string };

      if (!response.ok) {
        setNameCheck({ status: "error", message: payload.error || "ENS lookup is temporarily unavailable. Try again." });
        return;
      }

      if (payload.available === true) {
        setNameCheck({ status: "available", message: `${agentEnsName} is available to prepare.` });
        return;
      }

      setNameCheck({
        status: "taken",
        message: `${agentEnsName} is already owned${payload.owner ? ` by ${shortAddress(payload.owner)}` : ""}.`
      });
    } catch (error) {
      setNameCheck({
        status: "error",
        message:
          error instanceof Error && error.name === "AbortError"
            ? "ENS availability check timed out. Try again."
            : "ENS lookup is temporarily unavailable. Try again."
      });
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function updateAgentName(value: string) {
    setAgentName(value);
    setNameCheck({ status: "idle", message: "Enter a name to check ENS availability." });
    setAccountStep({
      status: "idle",
      message: "Derive the parent-owned smart account after the agent name is confirmed."
    });
    setAccountFunding({ status: "idle" });
    setEnsStep({ status: "idle", message: "Deploy the smart account before preparing the ENS subname transaction." });
    setZeroGStep({ status: "idle", message: "Publish policy, audit, and agent-card artifacts once the ENS name is selected." });
    setRecordsStep({ status: "idle", message: "Publish 0G artifacts before preparing the ENS resolver record multicall." });
    setKeeperHubStep({ status: "idle", message: "Bind the ClearIntent execution gate after ENS records are submitted." });
    setLocalSdkCopyState("idle");
  }

  async function runActiveStep() {
    if (activeStep.id === "account") {
      if (accountStep.status === "ready" && accountFunding.status !== "submitted") {
        await fundAgentGas(accountStep.evidence);
        return;
      }
      if (accountStep.status === "error" && accountStep.evidence !== undefined && accountFunding.status !== "submitted") {
        await fundAgentGas(accountStep.evidence);
        return;
      }
      await runAccountStep();
      return;
    }
    if (activeStep.id === "ens") {
      await runEnsClaimStep();
      return;
    }
    if (activeStep.id === "zerog") {
      await runZeroGStep();
      return;
    }
    if (activeStep.id === "records") {
      await runEnsRecordsStep();
      return;
    }
    if (activeStep.id === "keeperhub") {
      await runKeeperHubStep();
      return;
    }
    advanceActiveStep();
  }

  function advanceActiveStep() {
    if (finalStepActive) {
      onComplete();
      return;
    }

    if (status === "not-started") {
      onStart();
    }
    onAdvance();
  }

  function isStepActionDisabled(step: WizardStep): boolean {
    if (status === "complete") return true;
    if (step.id === "username") return !nameIsAvailable;
    if (step.id === "account") {
      if (accountStep.status === "creating" || accountStep.status === "deploying") return true;
      if (accountFunding.status === "funding") return true;
      if (accountStep.status === "error" && accountStep.evidence !== undefined) return !accountKitReadiness.accountKitReady;
      if (accountIsReady) return false;
      return !nameIsAvailable || !accountKitReadiness.accountKitReady;
    }
    if (step.id === "ens") return !accountIsReady || isRunning(ensStep);
    if (step.id === "zerog") return ensStep.status !== "ready" || isRunning(zeroGStep);
    if (step.id === "records") return zeroGStep.status !== "ready" || isRunning(recordsStep);
    if (step.id === "keeperhub") return recordsStep.status !== "ready" || isRunning(keeperHubStep);
    if (step.id === "ready") return keeperHubStep.status !== "ready";
    return false;
  }

  function activeActionLabel(step: WizardStep): string {
    if (finalStepActive) return "Complete setup";
    if (step.id === "username" && nameIsAvailable) return "Next step";
    if (step.id === "account") {
      if (accountStep.status === "creating") return "Creating";
      if (accountStep.status === "deploying") return "Deploying";
      if (accountFunding.status === "funding") return "Funding agent gas";
      if (accountStep.status === "ready" && accountFunding.status !== "submitted") return "Send Sepolia funding";
      if (accountStep.status === "ready" && accountFunding.status === "submitted") return "Deploy smart account";
      if (accountStep.status === "error" && accountStep.evidence !== undefined && accountFunding.status !== "submitted") {
        return "Send Sepolia funding";
      }
      if (accountStep.status === "error" && accountStep.evidence !== undefined && accountFunding.status === "submitted") {
        return "Retry deployment";
      }
      if (accountIsReady) return "Next step";
      return step.actionLabel;
    }
    if (step.id === "ens" && ensStep.status === "prepared") return "Send ENS claim";
    if (step.id === "ens" && ensStep.status === "ready") return "Next step";
    if (step.id === "zerog" && zeroGStep.status === "ready") return "Next step";
    if (step.id === "records" && recordsStep.status === "ready") return "Next step";
    if (step.id === "keeperhub" && keeperHubStep.status === "ready") return "Next step";
    return step.actionLabel;
  }

  function stepStateLabel(step: WizardStep, index: number): string {
    if (step.id === "username" && nameIsAvailable && index < effectiveActiveIndex) return "Confirmed";
    if (step.id === "account" && accountIsReady && index < effectiveActiveIndex) return "Deployed";
    if (step.id === "ens" && ensStep.status === "ready" && index < effectiveActiveIndex) return "Submitted";
    if (step.id === "zerog" && zeroGStep.status === "ready" && index < effectiveActiveIndex) return "Published";
    if (step.id === "records" && recordsStep.status === "ready" && index < effectiveActiveIndex) return "Submitted";
    if (step.id === "keeperhub" && keeperHubStep.status === "ready" && index < effectiveActiveIndex) return "Submitted";
    if (index === effectiveActiveIndex) return step.id === "username" && nameIsAvailable ? "Ready" : "Active";
    if (index < effectiveActiveIndex) return "Needs evidence";
    return "Queued";
  }

  function stepCardState(step: WizardStep, index: number): string {
    if (step.id === "username" && nameIsAvailable && index < effectiveActiveIndex) return "confirmed";
    if (step.id === "account" && accountIsReady && index < effectiveActiveIndex) return "confirmed";
    if (step.id === "ens" && ensStep.status === "ready" && index < effectiveActiveIndex) return "confirmed";
    if (step.id === "zerog" && zeroGStep.status === "ready" && index < effectiveActiveIndex) return "confirmed";
    if (step.id === "records" && recordsStep.status === "ready" && index < effectiveActiveIndex) return "confirmed";
    if (step.id === "keeperhub" && keeperHubStep.status === "ready" && index < effectiveActiveIndex) return "confirmed";
    if (index === effectiveActiveIndex) return "active";
    if (index < effectiveActiveIndex) return "unverified";
    return "queued";
  }

  async function runAccountStep() {
    if (accountStep.status === "deployed") {
      advanceActiveStep();
      return;
    }
    if (accountStep.status === "ready") {
      await deployAgentAccount(accountStep.evidence);
      return;
    }
    if (accountStep.status === "error" && accountStep.evidence !== undefined) {
      await deployAgentAccount(accountStep.evidence);
      return;
    }
    await deriveAgentAccount();
  }

  async function deriveAgentAccount() {
    if (!nameIsAvailable) return;
    setAccountStep({ status: "creating", message: "Deriving Account Kit smart-account address from the connected parent wallet..." });

    try {
      const result = await deriveParentOwnedAgentAccount({
        provider: typeof window === "undefined" ? undefined : window.ethereum,
        agentEnsName,
        env: accountKitConfig.env
      });

      if (!result.ok) {
        setAccountStep({
          status: "error",
          message: "Account Kit could not derive the agent account.",
          issues: result.issues
        });
        return;
      }

      setAccountStep({
        status: "ready",
        message:
          result.issues.length > 0
            ? "Smart-account address derived with a configuration warning."
            : "Smart-account address derived. Next, fund the new account with Sepolia ETH before deployment.",
        evidence: result.evidence,
        issues: result.issues
      });
    } catch (error) {
      setAccountStep({
        status: "error",
        message: error instanceof Error ? error.message : "Account Kit failed before producing account evidence.",
        issues: ["account_kit_derivation_failed"]
      });
    }
  }

  async function deployAgentAccount(predictedEvidence: AgentAccountEvidence) {
    setAccountStep({
      status: "deploying",
      message: "Submitting Account Kit deployment UserOperation through the connected parent wallet...",
      evidence: predictedEvidence
    });

    try {
      const result = await deployParentOwnedAgentAccount({
        provider: typeof window === "undefined" ? undefined : window.ethereum,
        agentEnsName,
        env: accountKitConfig.env
      });

      if (!result.ok) {
        setAccountStep({
          status: "error",
          message: "Account Kit deployment is blocked.",
          issues: result.issues,
          evidence: predictedEvidence
        });
        return;
      }

      setAccountStep({
        status: "deployed",
        message:
          result.issues.length > 0
            ? "Smart-account deployment was submitted; transaction receipt is still pending."
            : "Smart account deployment is recorded.",
        evidence: result.evidence,
        issues: result.issues
      });
      setAccountFunding({ status: "idle" });
    } catch (error) {
      setAccountStep({
        status: "error",
        message: error instanceof Error ? error.message : "Account Kit deployment failed before producing account evidence.",
        issues: ["account_kit_deployment_failed"],
        evidence: predictedEvidence
      });
    }
  }

  async function fundAgentGas(predictedEvidence: AgentAccountEvidence) {
    setAccountFunding({
      status: "funding",
      amountWei: suggestedAgentGasTopUpWei,
      accountAddress: predictedEvidence.accountAddress
    });

    try {
      const transactionHash = await sendNativeTransfer({
        chainId: predictedEvidence.chainId,
        to: predictedEvidence.accountAddress,
        valueWei: suggestedAgentGasTopUpWei
      });
      setAccountFunding({
        status: "submitted",
        amountWei: suggestedAgentGasTopUpWei,
        accountAddress: predictedEvidence.accountAddress,
        transactionHash
      });
      setAccountStep({
        status: "ready",
        message: "Agent gas funding transaction was submitted. Wait for it to land, then deploy the smart account.",
        issues: [
          `Funding transaction: ${transactionHash}`,
          "Retry deployment after the funding transaction is visible on the Account Kit target chain."
        ],
        evidence: predictedEvidence
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setAccountFunding({
        status: "error",
        amountWei: suggestedAgentGasTopUpWei,
        accountAddress: predictedEvidence.accountAddress,
        message
      });
      setAccountStep({
        status: "error",
        message: "Agent gas funding is blocked.",
        issues: [message],
        evidence: predictedEvidence
      });
    }
  }

  async function runEnsClaimStep() {
    if (ensStep.status === "ready") {
      advanceActiveStep();
      return;
    }
    if (ensStep.status === "prepared") {
      setEnsStep({ ...ensStep, status: "running", message: "Requesting parent-wallet approval for the prepared ENS claim transaction..." });
      try {
        const hashes = await sendWalletTransactions(ensStep.transactions, 1);
        setEnsStep({
          status: "ready",
          message: "ENS subname claim transaction was submitted from the parent wallet.",
          evidence: { ...ensStep.evidence, transactionHashes: hashes },
          issues: ensStep.issues
        });
      } catch (error) {
        setEnsStep({
          status: "error",
          message: "ENS subname claim submission is blocked.",
          issues: [error instanceof Error ? error.message : String(error)],
          evidence: ensStep.evidence
        });
      }
      return;
    }
    const accountEvidence = accountStep.status === "deployed" ? accountStep.evidence : undefined;
    if (accountEvidence === undefined) return;
    setEnsStep({ status: "running", message: "Preparing one ENS subname claim transaction. Wallet approval comes next." });

    try {
      const payload = await postJson<{
        ok?: boolean;
        error?: string;
        ensName?: string;
        resolverAddress?: string;
        warning?: string;
        transactions?: PreparedWalletTransaction[];
      }>("/api/setup/ens-claim", {
        label: normalizedAgentName,
        ownerAddress: accountEvidence.parentAddress,
        agentAccountAddress: accountEvidence.accountAddress
      });
      if (!payload.ok || payload.transactions === undefined || payload.ensName === undefined) {
        throw new Error(payload.error ?? "ENS claim preparation did not return transactions.");
      }
      setEnsStep({
        status: "prepared",
        message: "ENS subname claim is prepared. Send the wallet transaction as the next action.",
        evidence: {
          ensName: payload.ensName,
          resolverAddress: payload.resolverAddress,
          warning: payload.warning ?? "",
          transactionCount: payload.transactions.length
        },
        transactions: payload.transactions,
        issues: []
      });
    } catch (error) {
      setEnsStep({
        status: "error",
        message: "ENS subname claim is blocked.",
        issues: [error instanceof Error ? error.message : String(error)]
      });
    }
  }

  async function runZeroGStep() {
    if (zeroGStep.status === "ready") {
      advanceActiveStep();
      return;
    }
    const accountEvidence = accountStep.status === "deployed" ? accountStep.evidence : undefined;
    if (accountEvidence === undefined) return;
    setZeroGStep({
      status: "running",
      message: "Publishing agent card, policy, and audit pointer artifacts to 0G. This can take a minute while 0G finalizes the uploads..."
    });

    try {
      const status = await postJson<Record<string, unknown>>(
        "/api/setup/zerog-bindings",
        {
          agentEnsName,
          controllerAddress: accountEvidence.accountAddress
        },
        { timeoutMs: hostedZeroGTimeoutMs }
      );
      const blockingReasons = asStringArray(status.blockingReasons);
      if (blockingReasons.length > 0 || status.records === undefined) {
        throw new Error(`0G binding blocked: ${blockingReasons.join(", ") || "missing records"}`);
      }
      setZeroGStep({
        status: "ready",
        message: typeof status.summary === "string" ? status.summary : "0G artifacts were published and records were generated.",
        evidence: status,
        issues: asStringArray(status.degradedReasons)
      });
      advanceActiveStep();
    } catch (error) {
      setZeroGStep({
        status: "error",
        message: "0G binding publish is blocked.",
        issues: [humanizeZeroGError(error)]
      });
    }
  }

  async function copyLocalSdkPrompt() {
    const accountEvidence = accountStep.status === "deployed" ? accountStep.evidence : undefined;
    const prompt = buildLocalSdkPrompt({
      agentEnsName,
      agentAccount: accountEvidence?.accountAddress,
      parentWallet: accountEvidence?.parentAddress
    });

    try {
      await navigator.clipboard.writeText(prompt);
      setLocalSdkCopyState("copied");
      window.setTimeout(() => setLocalSdkCopyState("idle"), 2400);
    } catch {
      setLocalSdkCopyState("error");
    }
  }

  async function runEnsRecordsStep() {
    if (recordsStep.status === "ready") {
      advanceActiveStep();
      return;
    }
    if (zeroGRecords === undefined) return;
    setRecordsStep({ status: "running", message: "Preparing resolver multicall and requesting parent-wallet submission..." });

    try {
      const accountEvidence = accountStep.status === "deployed" ? accountStep.evidence : undefined;
      const status = await postJson<{
        ok?: boolean;
        summary?: string;
        blockingReasons?: string[];
        degradedReasons?: string[];
        tx?: { to: string; value: string; data: string };
      }>("/api/setup/ens-records", {
        agentEnsName,
        resolverAddress: ensStep.status === "ready" ? stringFromEvidence(ensStep.evidence, "resolverAddress") : undefined,
        agentAccountAddress: accountEvidence?.accountAddress,
        ...zeroGRecords
      });
      if (!status.ok || status.tx === undefined) {
        throw new Error(`ENS record binding blocked: ${(status.blockingReasons ?? []).join(", ") || "missing transaction"}`);
      }
      const hashes = await sendWalletTransactions(
        [{ label: "Set ENS address and ClearIntent records", to: status.tx.to, value: "0x0", data: status.tx.data }],
        1
      );
      setRecordsStep({
        status: "ready",
        message: status.summary ?? "ENS resolver multicall was submitted.",
        evidence: { transactionHashes: hashes, records: zeroGRecords },
        issues: status.degradedReasons ?? []
      });
    } catch (error) {
      setRecordsStep({
        status: "error",
        message: "ENS record binding is blocked.",
        issues: [error instanceof Error ? error.message : String(error)]
      });
    }
  }

  async function runKeeperHubStep() {
    if (keeperHubStep.status === "ready") {
      advanceActiveStep();
      return;
    }
    setKeeperHubStep({ status: "running", message: "Submitting the configured KeeperHub workflow gate..." });

    try {
      const status = await postJson<Record<string, unknown>>("/api/setup/keeperhub", { action: "submit" });
      const blockingReasons = asStringArray(status.blockingReasons);
      if (blockingReasons.length > 0) {
        throw new Error(`KeeperHub submit blocked: ${blockingReasons.join(", ")}`);
      }
      setKeeperHubStep({
        status: "ready",
        message: typeof status.summary === "string" ? status.summary : "KeeperHub workflow submit returned evidence.",
        evidence: status,
        issues: asStringArray(status.degradedReasons)
      });
    } catch (error) {
      setKeeperHubStep({
        status: "error",
        message: "KeeperHub gate submission is blocked.",
        issues: [error instanceof Error ? error.message : String(error)]
      });
    }
  }

  return (
    <div className="wizard-page">
      <section className="wizard-intro" aria-labelledby="setup-wizard-title">
        <span className="muted">Guided setup</span>
        <h1 id="setup-wizard-title">Create a parent-owned agent account</h1>
        <p>
          The setup flow should feel like one guided sequence even when the underlying work includes wallet approvals,
          ENS writes, 0G publishing, and provider configuration. Each step stays visible so custody never becomes a
          hidden background task.
        </p>
      </section>

      <section className="wizard-stage" aria-label="ClearIntent setup timeline">
        <div className="wizard-custody-strip" aria-label="Custody path">
          <span>Parent wallet</span>
          <span>Agent account</span>
          <span>ENS identity</span>
          <span>0G policy</span>
          <span>KeeperHub gate</span>
        </div>

        <div className="wizard-progress-rail">
          {wizardSteps.map((step, index) => {
            const cardState = stepCardState(step, index);
            return (
              <div className={`wizard-progress-node ${cardState}`} key={step.id}>
                <span>{index + 1}</span>
                <strong>{step.shortLabel}</strong>
              </div>
            );
          })}
        </div>

        <div className="wizard-deck">
          <div className="wizard-card-stack" aria-hidden="true">
            <div className="wizard-card-shadow one" />
            <div className="wizard-card-shadow two" />
          </div>

          <article className="wizard-operation-card">
            <div className="wizard-operation-main">
              <div className="wizard-kicker">
                <span>Step {effectiveActiveIndex + 1}</span>
                <span>{stepStateLabel(activeStep, effectiveActiveIndex)}</span>
              </div>
              <h2>{activeStep.label}</h2>
              <p>{activeStep.detail}</p>

              {activeStep.id === "username" ? (
                <div className="wizard-name-check">
                  <label htmlFor="agent-name">Agent subname</label>
                  <div className="wizard-name-row">
                    <input
                      autoComplete="off"
                      id="agent-name"
                      inputMode="text"
                      onChange={(event) => updateAgentName(event.target.value)}
                      placeholder="velcrafting"
                      type="text"
                      value={agentName}
                    />
                    <button className="button ghost" disabled={!canCheckName} onClick={checkNameAvailability} type="button">
                      {nameCheck.status === "checking" ? "Checking" : "Check"}
                    </button>
                  </div>
                  <div className="wizard-name-preview">
                    <span>Preview</span>
                    <strong>{agentEnsName}</strong>
                  </div>
                  <div className={`wizard-name-status ${nameCheck.status}`} role="status">
                    {nameCheck.message}
                  </div>
                </div>
              ) : activeStep.id === "account" ? (
                <div className="wizard-account-block">
                  <div className="wizard-account-summary">
                    <span className={accountKitReadiness.accountKitReady ? "ok" : "warning"}>
                      {accountKitReadiness.accountKitReady ? "Account Kit configured" : "Configuration required"}
                    </span>
                    <strong>
                      {accountKitReadiness.accountKitReady
                        ? `Target chain: ${accountKitReadiness.config.chain}`
                        : `Missing: ${accountKitReadiness.missing.join(", ")}`}
                    </strong>
                    <p>
                      Step 2 derives the parent-owned Alchemy smart account and then submits a deployment UserOperation.
                      Gas sponsorship is off, so deployment requires funds on the Account Kit target chain.
                    </p>
                  </div>
                  <div className={`wizard-account-status ${accountStep.status}`} role="status">
                    <strong>{accountStep.message}</strong>
                    {accountStep.status === "ready" ||
                    accountStep.status === "deploying" ||
                    accountStep.status === "deployed" ||
                    (accountStep.status === "error" && accountStep.evidence !== undefined) ? (
                      <dl>
                        <div>
                          <dt>Parent wallet</dt>
                          <dd>{shortAddress(accountStep.evidence?.parentAddress ?? "")}</dd>
                        </div>
                        <div>
                          <dt>Agent account</dt>
                          <dd>{accountStep.evidence?.accountAddress}</dd>
                        </div>
                        <div>
                          <dt>Proof boundary</dt>
                          <dd>
                            {accountStep.status === "deployed"
                              ? accountStep.evidence.deployment?.transactionHash ?? accountStep.evidence.deployment?.userOperationHash
                              : "Predicted address, not deployed authority yet."}
                          </dd>
                        </div>
                      </dl>
                    ) : null}
                    {(accountStep.status === "ready" || accountStep.status === "deployed") && accountStep.issues.length > 0 ? (
                      <ul>
                        {accountStep.issues.map((issue) => (
                          <li key={issue}>{issue}</li>
                        ))}
                      </ul>
                    ) : null}
                    {accountStep.status === "error" ? (
                      <ul>
                        {accountStep.issues.map((issue) => (
                          <li key={issue}>{issue}</li>
                        ))}
                      </ul>
                    ) : null}
                    {accountStep.status === "error" && accountStep.evidence !== undefined ? (
                      <div className="wizard-funding-note">
                        <strong>Default funding path</strong>
                        <p>
                          ClearIntent can ask the parent wallet to send {formatEth(suggestedAgentGasTopUpWei)} ETH on{" "}
                          {accountStep.evidence.chainName} to the predicted smart account, then retry deployment. This
                          keeps gas funding inside the wizard.
                        </p>
                        {accountFunding.status === "submitted" ? (
                          <span>Funding submitted: {accountFunding.transactionHash}</span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : activeStep.id === "zerog" ? (
                <ZeroGOperationBlock
                  copyState={localSdkCopyState}
                  disabled={isStepActionDisabled(activeStep)}
                  onCopyLocalSdk={copyLocalSdkPrompt}
                  onHostedPublish={runZeroGStep}
                  state={zeroGStep}
                  step={activeStep}
                />
              ) : activeStep.id === "ready" ? (
                <ReadyBlock
                  accountStep={accountStep}
                  agentEnsName={agentEnsName}
                  keeperHubStep={keeperHubStep}
                  recordsStep={recordsStep}
                  zeroGStep={zeroGStep}
                />
              ) : (
                <OperationBlock step={activeStep} state={operationStateForStep(activeStep.id, ensStep, zeroGStep, recordsStep, keeperHubStep)} />
              )}

              {activeStep.id !== "zerog" ? (
                <div className="wizard-step-actions">
                  <button
                    className="button primary"
                    disabled={isStepActionDisabled(activeStep)}
                    onClick={runActiveStep}
                    type="button"
                  >
                    {activeActionLabel(activeStep)}
                  </button>
                  <span className="muted">
                    {activeStep.id === "username" && !nameIsAvailable
                      ? "Check and confirm an available ENS name first."
                      : activeStep.id === "account" && !accountKitReadiness.accountKitReady
                        ? "Set Account Kit public env first."
                      : activeStep.id === "account" && accountStep.status === "ready" && accountFunding.status !== "submitted"
                        ? "Parent wallet funds the new agent account."
                      : activeStep.id === "account" && accountStep.status === "ready" && accountFunding.status === "submitted"
                        ? "Deployment will request wallet approval."
                      : activeStep.id === "account" && accountStep.status === "error" && accountStep.evidence !== undefined
                        ? accountFunding.status === "submitted"
                          ? "Funding submitted; retry deployment."
                          : "Parent wallet funds the predicted account."
                      : activeStep.approval}
                  </span>
                </div>
              ) : null}
            </div>

            <aside className="wizard-receipt-panel" aria-label="Step evidence">
              <div>
                <span>Evidence target</span>
                <strong>{activeStep.evidenceLabel}</strong>
              </div>
              <div>
                <span>Proof required</span>
                <strong>{activeStep.proofTarget}</strong>
              </div>
              <div>
                <span>Current receipt</span>
                <strong>
                  {currentReceipt(
                    activeStep.id,
                    nameIsAvailable,
                    agentEnsName,
                    accountStep,
                    ensStep,
                    zeroGStep,
                    recordsStep,
                    keeperHubStep
                  )}
                </strong>
              </div>
              <div>
                <span>Authority boundary</span>
                <strong>{activeStep.approval}</strong>
              </div>
            </aside>
          </article>

          <div className="wizard-next-stack" aria-label="Upcoming setup steps">
            {wizardSteps.slice(effectiveActiveIndex + 1, effectiveActiveIndex + 4).map((step, index) => (
              <article className="wizard-mini-card" key={step.id}>
                <span>{String(effectiveActiveIndex + index + 2).padStart(2, "0")}</span>
                <div>
                  <strong>{step.label}</strong>
                  <p>{step.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function shortAddress(value: string): string {
  return value.length > 12 ? `${value.slice(0, 6)}...${value.slice(-4)}` : value;
}

function OperationBlock({ state, step }: { state: StepOperationState; step: WizardStep }) {
  return (
    <div className={`wizard-operation-block ${state.status}`}>
      <span>
        {state.status === "ready"
          ? "Evidence recorded"
          : state.status === "running"
            ? "Working"
          : state.status === "prepared"
            ? "Prepared"
          : state.status === "error"
            ? "Blocked"
          : "Active step"}
      </span>
      <strong>{state.message}</strong>
      <p>{step.summary}</p>
      {state.status === "ready" || state.status === "prepared" ? <ProofList evidence={state.evidence} /> : null}
      {state.status === "error" || (state.status === "ready" && state.issues.length > 0) ? (
        <ul>
          {state.issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ZeroGOperationBlock({
  copyState,
  disabled,
  onCopyLocalSdk,
  onHostedPublish,
  state,
  step
}: {
  copyState: CopyState;
  disabled: boolean;
  onCopyLocalSdk: () => void;
  onHostedPublish: () => void;
  state: StepOperationState;
  step: WizardStep;
}) {
  const hostedUnavailable = state.status === "error" && hasAnyIssue(state.issues, ["missing_credentials", "live_writes_disabled"]);

  return (
    <div className={`wizard-operation-block ${state.status}`}>
      <span>{state.status === "ready" ? "Evidence recorded" : state.status === "running" ? "Working" : "Choose publishing mode"}</span>
      <strong>{state.status === "ready" ? state.message : "Publish 0G policy artifacts without hiding custody."}</strong>
      <p>{step.summary}</p>

      {state.status === "ready" ? <ProofList evidence={state.evidence} /> : null}

      {state.status === "running" ? (
        <div className="wizard-hosted-progress" role="status">
          <span>Hosted publish in progress</span>
          <strong>Uploading policy, audit, and agent card to 0G.</strong>
          <p>
            Hosted publishing can take around one minute because three 0G artifacts must finalize and read back. Keep
            this tab open; the wizard will advance to ENS records when refs return.
          </p>
        </div>
      ) : null}

      {state.status !== "ready" && state.status !== "running" ? (
        <div className="wizard-operator-modes">
          <section className="wizard-operator-mode recommended">
            <div>
              <span>Recommended</span>
              <strong>Local SDK mode</strong>
              <p>
                Keep the 0G private key on your machine. Run the local helper, then import the public artifact refs back
                into the dashboard.
              </p>
            </div>
            <code aria-label="Local SDK setup command">npx clearintent setup local-operator</code>
            <button className="button primary" onClick={onCopyLocalSdk} type="button">
              {copyState === "copied" ? "Copied" : copyState === "error" ? "Copy failed" : "Copy local SDK prompt"}
            </button>
          </section>

          <section className="wizard-operator-mode">
            <div>
              <span>Fastest</span>
              <strong>Hosted publishing</strong>
              <p>
                Continue in browser when this deployment has a configured 0G operator signer. Use this for controlled
                demos or user-operated hosted backends.
              </p>
            </div>
            {hostedUnavailable ? (
              <div className="wizard-hosted-warning">
                Hosted publishing is disabled on this deployment. Expected for public v0.1 unless demo credentials are
                intentionally configured.
              </div>
            ) : null}
            <button className="button ghost" disabled={disabled} onClick={onHostedPublish} type="button">
              Try hosted publish
            </button>
          </section>
        </div>
      ) : null}

      {state.status === "error" || (state.status === "ready" && state.issues.length > 0) ? (
        <ul>
          {state.issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ReadyBlock({
  accountStep,
  agentEnsName,
  keeperHubStep,
  recordsStep,
  zeroGStep
}: {
  accountStep: AccountStepState;
  agentEnsName: string;
  keeperHubStep: StepOperationState;
  recordsStep: StepOperationState;
  zeroGStep: StepOperationState;
}) {
  const accountEvidence = accountStep.status === "deployed" ? accountStep.evidence : undefined;
  const records = zeroGStep.status === "ready" ? (zeroGStep.evidence.records as ZeroGRecords | undefined) : undefined;
  const keeperHubRun = keeperHubStep.status === "ready" ? runIdFromEvidence(keeperHubStep.evidence) : undefined;
  const setupReady = accountEvidence !== undefined && recordsStep.status === "ready" && keeperHubStep.status === "ready";

  return (
    <div className={`wizard-operation-block ${setupReady ? "ready" : "idle"}`}>
      <span>{setupReady ? "Custody map ready" : "Waiting on evidence"}</span>
      <strong>
        {setupReady
          ? "The agent can receive the SDK handoff without parent-wallet secrets."
          : "Complete the account, ENS records, and KeeperHub gate before exporting the handoff."}
      </strong>
      <dl>
        <div>
          <dt>Agent ENS</dt>
          <dd>{agentEnsName}</dd>
        </div>
        <div>
          <dt>Parent wallet</dt>
          <dd>{accountEvidence?.parentAddress ?? "Not recorded yet"}</dd>
        </div>
        <div>
          <dt>Agent account</dt>
          <dd>{accountEvidence?.accountAddress ?? "Not recorded yet"}</dd>
        </div>
        <div>
          <dt>Policy URI</dt>
          <dd>{records?.policyUri ?? "Not recorded yet"}</dd>
        </div>
        <div>
          <dt>Policy hash</dt>
          <dd>{records?.policyHash ?? "Not recorded yet"}</dd>
        </div>
        <div>
          <dt>KeeperHub run</dt>
          <dd>{keeperHubRun ?? "Not recorded yet"}</dd>
        </div>
      </dl>
    </div>
  );
}

function ProofList({ evidence }: { evidence: Record<string, unknown> }) {
  const rows = [
    ["ENS name", stringFromEvidence(evidence, "ensName")],
    ["Transaction", firstHashFromEvidence(evidence)],
    ["Policy", policyUriFromEvidence(evidence)],
    ["Run", runIdFromEvidence(evidence)]
  ].filter((row): row is [string, string] => row[1] !== undefined);

  if (rows.length === 0) {
    return null;
  }

  return (
    <dl>
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function currentReceipt(
  stepId: string,
  nameIsAvailable: boolean,
  agentEnsName: string,
  accountStep: AccountStepState,
  ensStep: StepOperationState,
  zeroGStep: StepOperationState,
  recordsStep: StepOperationState,
  keeperHubStep: StepOperationState
): string {
  if (stepId === "username" && nameIsAvailable) {
    return agentEnsName;
  }
  if (stepId === "account" && (accountStep.status === "ready" || accountStep.status === "deploying" || accountStep.status === "deployed")) {
    return accountStep.status === "deployed"
      ? accountStep.evidence.deployment?.transactionHash ?? accountStep.evidence.deployment?.userOperationHash ?? accountStep.evidence.accountAddress
      : accountStep.evidence?.accountAddress ?? "Not recorded yet";
  }
  if (stepId === "account" && accountStep.status === "error" && accountStep.evidence !== undefined) {
    return accountStep.evidence.accountAddress;
  }
  if (stepId === "ens" && ensStep.status === "ready") {
    return firstHashFromEvidence(ensStep.evidence) ?? "Submitted";
  }
  if (stepId === "ens" && ensStep.status === "prepared") {
    return "Prepared for wallet";
  }
  if (stepId === "zerog" && zeroGStep.status === "ready") {
    return policyUriFromEvidence(zeroGStep.evidence) ?? "0G artifacts recorded";
  }
  if (stepId === "records" && recordsStep.status === "ready") {
    return firstHashFromEvidence(recordsStep.evidence) ?? "ENS records submitted";
  }
  if (stepId === "keeperhub" && keeperHubStep.status === "ready") {
    return runIdFromEvidence(keeperHubStep.evidence) ?? "KeeperHub submitted";
  }
  if (stepId === "ready") {
    return keeperHubStep.status === "ready" ? "Custody map ready" : "Not recorded yet";
  }
  return "Not recorded yet";
}

function operationStateForStep(
  stepId: string,
  ensStep: StepOperationState,
  zeroGStep: StepOperationState,
  recordsStep: StepOperationState,
  keeperHubStep: StepOperationState
): StepOperationState {
  if (stepId === "ens") return ensStep;
  if (stepId === "zerog") return zeroGStep;
  if (stepId === "records") return recordsStep;
  if (stepId === "keeperhub") return keeperHubStep;
  return { status: "idle", message: "Complete the previous step first." };
}

function isRunning(step: StepOperationState): boolean {
  return step.status === "running";
}

function hasAnyIssue(issues: string[], needles: string[]): boolean {
  return issues.some((issue) => needles.some((needle) => issue.includes(needle)));
}

function buildLocalSdkPrompt(input: { agentEnsName: string; agentAccount?: string; parentWallet?: string }): string {
  return `Use ClearIntent local SDK mode for 0G artifact publishing.

Agent ENS: ${input.agentEnsName}
Parent wallet: ${input.parentWallet ?? "not recorded yet"}
Agent account: ${input.agentAccount ?? "not recorded yet"}

Goal:
Publish the ClearIntent agent card, policy, and audit pointer to 0G from my local machine without putting private keys into the hosted website.

Rules:
- Do not ask me to paste private keys into chat.
- Create or use ~/.clearintent/clearintent.secrets.env for operator secrets.
- Keep private keys out of the repo and out of .env.local.
- Print only public artifact refs and transaction hashes.

Commands:
npx clearintent setup local-operator

Current repo path until the package is published:
git clone https://github.com/Vel-Labs/ClearIntent
cd ClearIntent
npm install
mkdir -p ~/.clearintent
cp operator-secrets/clearintent.secrets.env.example ~/.clearintent/clearintent.secrets.env
npm run clearintent -- credentials status
npm run clearintent -- memory live-status
npm run clearintent -- memory live-bindings

Return these public values for dashboard import:
- agent.card
- policy.uri
- policy.hash
- audit.latest
- clearintent.version
- 0G tx hashes`;
}

async function postJson<T>(url: string, body: Record<string, unknown>, options: { timeoutMs?: number } = {}): Promise<T> {
  const abortController = options.timeoutMs === undefined ? undefined : new AbortController();
  const timeout = options.timeoutMs === undefined ? undefined : window.setTimeout(() => abortController?.abort(), options.timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: abortController?.signal
    });
    const payload = (await response.json()) as T & { error?: string };
    if (!response.ok && payload.error !== undefined) {
      throw new Error(payload.error);
    }
    return payload;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Hosted 0G publishing timed out before the deployment returned artifact refs. Retry hosted publishing or use local SDK mode.");
    }
    throw error;
  } finally {
    if (timeout !== undefined) {
      window.clearTimeout(timeout);
    }
  }
}

function humanizeZeroGError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("Hosted 0G publishing timed out")) {
    return message;
  }
  if (message.includes("missing_credentials")) {
    return "Hosted 0G publishing is not configured with an operator private key. Use local SDK mode or configure demo credentials on the deployment.";
  }
  if (message.includes("live_writes_disabled")) {
    return "Hosted 0G live writes are disabled for this deployment. Enable ZERO_G_ENABLE_LIVE_WRITES only for an intentional demo environment.";
  }
  return message;
}

async function sendWalletTransactions(transactions: PreparedWalletTransaction[], chainId: number): Promise<string[]> {
  const provider = typeof window === "undefined" ? undefined : window.ethereum;
  if (provider === undefined) {
    throw new Error("No EIP-1193 wallet provider is available.");
  }

  await provider.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: `0x${chainId.toString(16)}` }]
  });
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  const from = Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0] : undefined;
  if (from === undefined) {
    throw new Error("Wallet did not return a parent account.");
  }

  const hashes: string[] = [];
  for (const transaction of transactions) {
    const txParams = await buildLowCostWalletTransaction(provider, {
      from,
      to: transaction.to,
      value: transaction.value,
      data: transaction.data
    });
    const hash = await provider.request({
      method: "eth_sendTransaction",
      params: [txParams]
    });
    if (typeof hash !== "string" || !hash.startsWith("0x")) {
      throw new Error(`${transaction.label} did not return a transaction hash.`);
    }
    await waitForSuccessfulWalletReceipt(provider, hash, transaction.label);
    hashes.push(hash);
  }
  return hashes;
}

async function waitForSuccessfulWalletReceipt(provider: Eip1193Provider, hash: string, label: string): Promise<void> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < walletReceiptTimeoutMs) {
    const receipt = await provider.request({
      method: "eth_getTransactionReceipt",
      params: [hash]
    });

    if (receipt !== null && typeof receipt === "object") {
      const status = "status" in receipt ? (receipt as { status?: unknown }).status : undefined;
      if (status === "0x1" || status === "0x01") {
        return;
      }
      if (status === "0x0" || status === "0x00") {
        throw new Error(`${label} reverted onchain. Transaction: ${hash}`);
      }
    }

    await sleep(walletReceiptPollMs);
  }

  throw new Error(`${label} is still pending after ${Math.round(walletReceiptTimeoutMs / 1000)} seconds. Transaction: ${hash}. Wait for it to confirm, then retry this step.`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function sendNativeTransfer(input: { chainId: number; to: string; valueWei: bigint }): Promise<string> {
  const provider = typeof window === "undefined" ? undefined : window.ethereum;
  if (provider === undefined) {
    throw new Error("No EIP-1193 wallet provider is available.");
  }

  await provider.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: `0x${input.chainId.toString(16)}` }]
  });
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  const from = Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0] : undefined;
  if (from === undefined) {
    throw new Error("Wallet did not return a parent account.");
  }

  const hash = await provider.request({
    method: "eth_sendTransaction",
    params: [
      await buildLowCostWalletTransaction(provider, {
        from,
        to: input.to,
        value: `0x${input.valueWei.toString(16)}`,
        data: "0x"
      })
    ]
  });
  if (typeof hash !== "string" || !hash.startsWith("0x")) {
    throw new Error("Funding transaction did not return a transaction hash.");
  }
  return hash;
}

async function buildLowCostWalletTransaction(
  provider: NonNullable<typeof window.ethereum>,
  request: { from: string; to: string; value: string; data: string }
): Promise<Record<string, string>> {
  const transaction: Record<string, string> = {
    from: request.from,
    to: request.to,
    value: request.value,
    data: request.data
  };

  const [gas, fees] = await Promise.all([estimateGasLimit(provider, transaction), estimateLowCostFees(provider)]);
  if (gas !== undefined) {
    transaction.gas = gas;
  }
  if (fees !== undefined) {
    transaction.type = "0x2";
    transaction.maxPriorityFeePerGas = fees.maxPriorityFeePerGas;
    transaction.maxFeePerGas = fees.maxFeePerGas;
  }

  return transaction;
}

async function estimateGasLimit(provider: NonNullable<typeof window.ethereum>, transaction: Record<string, string>): Promise<string | undefined> {
  try {
    const value = await provider.request({
      method: "eth_estimateGas",
      params: [transaction]
    });
    if (typeof value !== "string" || !value.startsWith("0x")) {
      return undefined;
    }
    const estimated = BigInt(value);
    return `0x${((estimated * lowCostFeeMultiplierNumerator) / lowCostFeeMultiplierDenominator).toString(16)}`;
  } catch {
    return undefined;
  }
}

async function estimateLowCostFees(
  provider: NonNullable<typeof window.ethereum>
): Promise<{ maxFeePerGas: string; maxPriorityFeePerGas: string } | undefined> {
  try {
    const feeHistory = await provider.request({
      method: "eth_feeHistory",
      params: ["0x1", "latest", []]
    });
    const baseFees = typeof feeHistory === "object" && feeHistory !== null ? (feeHistory as { baseFeePerGas?: unknown }).baseFeePerGas : undefined;
    const latestBaseFeeHex = Array.isArray(baseFees) && typeof baseFees.at(-1) === "string" ? baseFees.at(-1) : undefined;
    if (latestBaseFeeHex === undefined || !latestBaseFeeHex.startsWith("0x")) {
      return undefined;
    }

    const baseFee = BigInt(latestBaseFeeHex);
    const priorityFee = await readBoundedPriorityFee(provider);
    const maxFee = (baseFee * lowCostFeeMultiplierNumerator) / lowCostFeeMultiplierDenominator + priorityFee;
    return {
      maxFeePerGas: `0x${maxFee.toString(16)}`,
      maxPriorityFeePerGas: `0x${priorityFee.toString(16)}`
    };
  } catch {
    return undefined;
  }
}

async function readBoundedPriorityFee(provider: NonNullable<typeof window.ethereum>): Promise<bigint> {
  try {
    const value = await provider.request({ method: "eth_maxPriorityFeePerGas" });
    if (typeof value === "string" && value.startsWith("0x")) {
      const suggested = BigInt(value);
      return suggested > lowCostPriorityFeeWei ? lowCostPriorityFeeWei : suggested;
    }
  } catch {
    // Fall through to the fixed low-cost priority fee.
  }
  return lowCostPriorityFeeWei;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function stringFromEvidence(evidence: Record<string, unknown>, key: string): string | undefined {
  const value = evidence[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function firstHashFromEvidence(evidence: Record<string, unknown>): string | undefined {
  const direct = stringFromEvidence(evidence, "transactionHash");
  if (direct !== undefined) return direct;
  const hashes = evidence.transactionHashes;
  return Array.isArray(hashes) && typeof hashes[0] === "string" ? hashes[0] : undefined;
}

function policyUriFromEvidence(evidence: Record<string, unknown>): string | undefined {
  const records = evidence.records;
  if (typeof records === "object" && records !== null && "policyUri" in records) {
    const value = (records as { policyUri?: unknown }).policyUri;
    return typeof value === "string" ? value : undefined;
  }
  return undefined;
}

function runIdFromEvidence(evidence: Record<string, unknown>): string | undefined {
  const submission = evidence.submission;
  if (typeof submission === "object" && submission !== null) {
    const runId = (submission as { runId?: unknown; executionId?: unknown }).runId ?? (submission as { executionId?: unknown }).executionId;
    return typeof runId === "string" ? runId : undefined;
  }
  return undefined;
}

function formatEth(wei: bigint): string {
  const whole = wei / 1_000_000_000_000_000_000n;
  const fraction = (wei % 1_000_000_000_000_000_000n).toString().padStart(18, "0").slice(0, 6).replace(/0+$/, "");
  return fraction.length > 0 ? `${whole}.${fraction}` : whole.toString();
}
