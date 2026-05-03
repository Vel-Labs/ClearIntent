import { useMemo, useState } from "react";
import { isUsableAgentLabel, normalizeAgentLabel, toAgentEnsName } from "../../lib/ens/names";

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
    approval: "Wallet approval 1",
    actionLabel: "Create smart account",
    evidenceLabel: "Smart account address",
    proofTarget: "Account Kit owner binding receipt",
    blocker: "Account Kit transaction builder is not wired into this UI yet."
  },
  {
    id: "ens",
    label: "Claim ENS subname",
    shortLabel: "Subname",
    summary: "Bind the selected subname to the agent smart account address.",
    detail:
      "A future ClearIntent subname controller can batch the subname claim, resolver, and address record into the same approval as account setup where practical.",
    approval: "Wallet approval 1",
    actionLabel: "Sign ENS claim",
    evidenceLabel: "ENS claim transaction",
    proofTarget: "Subname owner/resolver points at agent account",
    blocker: "Subname controller write path is not wired into this UI yet."
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
    proofTarget: "agent.card, policy.uri, audit.latest",
    blocker: "0G publish is still CLI-backed for this build."
  },
  {
    id: "records",
    label: "Bind ENS records",
    shortLabel: "Records",
    summary: "Set agent.card, policy.uri, policy.hash, audit.latest, and version.",
    detail:
      "The ENS Public Resolver can set the ClearIntent text records with one resolver multicall once the 0G refs exist.",
    approval: "Wallet approval 2",
    actionLabel: "Sign ENS records",
    evidenceLabel: "Resolver multicall receipt",
    proofTarget: "Required ClearIntent text records resolve on ENS",
    blocker: "Resolver multicall submission is not wired into this UI yet."
  },
  {
    id: "keeperhub",
    label: "Connect execution gate",
    shortLabel: "Gate",
    summary: "Attach KeeperHub workflow routing and event-ingest references.",
    detail:
      "KeeperHub remains the execution layer after ClearIntent verification. Webhook delivery stays disabled until clearintent.xyz is live.",
    approval: "Config step",
    actionLabel: "Verify KeeperHub",
    evidenceLabel: "Workflow run status",
    proofTarget: "KeeperHub workflow accepts ClearIntent payload",
    blocker: "KeeperHub wiring is CLI-backed until the web ingest is deployed."
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
  const safeActiveIndex = clamp(activeStepIndex, 0, wizardSteps.length - 1);
  const normalizedAgentName = useMemo(() => normalizeAgentLabel(agentName), [agentName]);
  const agentEnsName = toAgentEnsName(normalizedAgentName);
  const canCheckName = isUsableAgentLabel(normalizedAgentName) && nameCheck.status !== "checking";
  const nameIsAvailable = nameCheck.status === "available";
  const effectiveActiveIndex = safeActiveIndex > 0 && !nameIsAvailable ? 0 : safeActiveIndex;
  const activeStep = wizardSteps[effectiveActiveIndex];
  const finalStepActive = effectiveActiveIndex === wizardSteps.length - 1;

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
    return true;
  }

  function stepStateLabel(step: WizardStep, index: number): string {
    if (step.id === "username" && nameIsAvailable && index < effectiveActiveIndex) return "Confirmed";
    if (index === effectiveActiveIndex) return step.id === "username" && nameIsAvailable ? "Ready" : "Active";
    if (index < effectiveActiveIndex) return "Needs evidence";
    return "Queued";
  }

  function stepCardState(step: WizardStep, index: number): string {
    if (step.id === "username" && nameIsAvailable && index < effectiveActiveIndex) return "confirmed";
    if (index === effectiveActiveIndex) return "active";
    if (index < effectiveActiveIndex) return "unverified";
    return "queued";
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
              ) : (
                <div className="wizard-operation-block">
                  <span>Next integration required</span>
                  <strong>{activeStep.blocker}</strong>
                  <p>
                    This step should open a wallet/provider prompt and then record a receipt before it can be marked
                    complete.
                  </p>
                </div>
              )}

              <div className="wizard-step-actions">
                <button
                  className="button primary"
                  disabled={isStepActionDisabled(activeStep)}
                  onClick={advanceActiveStep}
                  type="button"
                >
                  {finalStepActive ? "Complete setup" : activeStep.actionLabel}
                </button>
                <span className="muted">
                  {activeStep.id === "username" && !nameIsAvailable
                    ? "Check and confirm an available ENS name first."
                    : activeStep.approval}
                </span>
              </div>
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
                <strong>{activeStep.id === "username" && nameIsAvailable ? agentEnsName : "Not recorded yet"}</strong>
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
