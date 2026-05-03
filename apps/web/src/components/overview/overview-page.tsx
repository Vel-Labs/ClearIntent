"use client";

import { useMemo, useState } from "react";

type OverviewPageProps = {
  connected: boolean;
  onGetStarted: () => void;
};

type JourneyNode = {
  title: string;
  detail: string;
  checks: string;
  output: string;
  note?: string;
  visual: "wallet" | "dashboard" | "wizard" | "ens" | "alchemy" | "bind" | "zerog" | "audit" | "chain" | "payload" | "keeperhub" | "webhook";
};

type JourneySlide = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  nodes: JourneyNode[];
};

const journeySlides: JourneySlide[] = [
  {
    id: "connect",
    eyebrow: "Step 1",
    title: "Connect parent wallet",
    summary:
      "Start from the wallet that owns authority. ClearIntent does not ask for seed phrases or parent keys; it uses the connected wallet to begin a guided setup for identity, policy, and transaction validation.",
    nodes: [
      {
        title: "Select authority wallet",
        detail:
          "Choose which wallet will own the setup process, escalation decisions, and approval authority for the agentic wallet.",
        checks: "Confirms account access through the wallet provider without requesting seed phrases or private keys.",
        output: "Parent wallet becomes the human authority for the rest of setup.",
        visual: "wallet"
      },
      {
        title: "Connect dashboard",
        detail:
          "Use any wallet of your choice to enter the dashboard. The app stays non-custodial and does not become the source of policy truth.",
        checks: "Reads account and chain state from the connected wallet session.",
        output: "Unlocks the setup wizard while keeping the parent wallet in control.",
        visual: "dashboard"
      },
      {
        title: "Start setup wizard",
        detail:
          "The wizard walks through identity, policy, approval, and validation instead of exposing unfinished dashboard pages up front.",
        checks: "Keeps each step visible before a provider write or wallet approval is requested.",
        output: "A guided path for agent identity, policy evidence, and signing readiness.",
        visual: "wizard"
      }
    ]
  },
  {
    id: "delegate",
    eyebrow: "Step 2",
    title: "Create agent lane",
    summary:
      "Create a readable ENS identity, then connect it to a parent-owned agentic wallet. The wizard validates name availability before continuing and clearly marks the approval steps.",
    nodes: [
      {
        title: "Verify ENS name",
        detail:
          "Check availability for a readable ClearIntent ENS name before preparing any binding transaction.",
        checks: "Looks up the candidate subname before letting the flow advance.",
        output: "A human-readable agent identity candidate such as vel.agent.clearintent.eth.",
        visual: "ens"
      },
      {
        title: "Create sub-wallet",
        detail:
          "Alchemy creates or predicts the agentic wallet that will operate under the parent wallet's authority.",
        checks: "Separates parent authority from the account an agent can reference.",
        output: "Agentic wallet address ready for ENS binding and policy linkage.",
        note: "Transaction approval required",
        visual: "alchemy"
      },
      {
        title: "Bind ENS identity",
        detail:
          "Bind the selected ENS name to the agentic wallet so later actions can resolve identity and policy pointers.",
        checks: "Prepares wallet-visible approval for the ENS binding step.",
        output: "ENS identity attached to the agentic wallet.",
        note: "Transaction approval required",
        visual: "bind"
      }
    ]
  },
  {
    id: "policy",
    eyebrow: "Step 3",
    title: "Publish policy evidence",
    summary:
      "Store policy agreements through 0G, a decentralized data layer used here for policy and audit artifacts. ClearIntent records the audit pointer and policy transaction evidence so later actions can be replayed.",
    nodes: [
      {
        title: "Store policy on 0G",
        detail:
          "0G stores the policy agreement and related artifacts as decentralized data ClearIntent can reference later.",
        checks: "Policy content is addressed by artifact references instead of frontend-local state.",
        output: "Policy URI and hash ready to bind into the authority record.",
        visual: "zerog"
      },
      {
        title: "Record audit pointer",
        detail:
          "The latest audit pointer is recorded onto the agentic wallet's ENS records so evidence can be replayed.",
        checks: "Tracks where policy, approval, receipt, and intervention evidence should be found.",
        output: "audit.latest record tied to the agent identity.",
        visual: "audit"
      },
      {
        title: "Confirm onchain policy",
        detail:
          "The policy binding is confirmed onchain, giving operators a transaction hash rather than a UI-only claim.",
        checks: "Policy hash must match the configured identity and expected artifact.",
        output: "Policy transaction hash and replayable authority evidence.",
        visual: "chain"
      }
    ]
  },
  {
    id: "operate",
    eyebrow: "Step 4",
    title: "Approve bounded actions",
    summary:
      "Preview the intent payload, route validation through KeeperHub, and share agent-action events through your preferred webhook destinations. Agents Act, Humans Verify. That is ClearIntent.",
    nodes: [
      {
        title: "Preview intent payload",
        detail:
          "Show the proposed action, limits, policy hash, signer, executor, nonce, deadline, and evidence before approval.",
        checks: "The ClearIntent payload is the shared object across dashboard, wallet request, audit, and receipts.",
        output: "Human-readable intent preview before any sensitive approval.",
        visual: "payload"
      },
      {
        title: "Validate through KeeperHub",
        detail:
          "KeeperHub mediates execution routing after ClearIntent validation, rather than becoming the authority source.",
        checks: "Unverified, expired, executor-mismatched, or missing-policy intents should fail closed.",
        output: "Execution route or refusal evidence tied back to the ClearIntent payload.",
        visual: "keeperhub"
      },
      {
        title: "Share action alerts",
        detail:
          "Configure a webhook so agent actions and intervention events can be shared through Discord, Telegram, or another destination.",
        checks: "Alerts are notification surfaces, not authority approval.",
        output: "Operator visibility when agents act, degrade, or need human intervention.",
        visual: "webhook"
      }
    ]
  }
];

const unlockStates = [
  { label: "Overview", value: "Teaches you about ClearIntent." },
  { label: "Parent wallet", value: "Gets you set up for informed agentic signing." },
  { label: "Full website", value: "Unlocks the dashboard after setup is complete." }
];

export function OverviewPage({ connected, onGetStarted }: OverviewPageProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [tldrOpen, setTldrOpen] = useState(false);
  const activeSlide = journeySlides[activeSlideIndex];
  const nextSlideIndex = useMemo(() => (activeSlideIndex + 1) % journeySlides.length, [activeSlideIndex]);

  return (
    <div className="page-stack overview-page">
      <header className="overview-hero">
        <div className="overview-hero-copy">
          <span className="muted">Wallet-gated authority setup</span>
          <h1>Start with the parent wallet. Unlock the agent journey from there.</h1>
          <p>
            ClearIntent turns autonomous-agent setup into a guided custody path: parent authority, bounded agent account,
            policy evidence, readable approval, and replayable execution records.
          </p>
          <div className="actions">
            <span className="badge warning">{connected ? "wallet connected" : "connect parent wallet to begin"}</span>
            <span className="badge">non-custodial</span>
          </div>
        </div>

        <section className="journey-card" aria-label="ClearIntent visual journey">
          <div className="journey-card-header">
            <div>
              <span className="muted">{activeSlide.eyebrow}</span>
              <h2>{activeSlide.title}</h2>
            </div>
            <div className="journey-header-actions">
              <button className="tldr-trigger" onClick={() => setTldrOpen(true)} type="button">
                TLDR
              </button>
              <div className="carousel-controls" aria-label="Journey carousel controls">
                {journeySlides.map((slide, index) => (
                  <button
                    aria-label={`Show ${slide.title}`}
                    aria-pressed={index === activeSlideIndex}
                    className={index === activeSlideIndex ? "active" : ""}
                    key={slide.id}
                    onClick={() => setActiveSlideIndex(index)}
                    type="button"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="journey-visual">
            {activeSlide.nodes.map((node, index) => (
              <div className="journey-node-wrap" key={node.title}>
                <div className="journey-node">
                  <span>{index + 1}</span>
                  <MiniDiagram kind={node.visual} />
                  <div>
                    <strong>{node.title}</strong>
                    <p>{node.detail}</p>
                    <div className="journey-node-meta">
                      <span>
                        <b>Checks</b>
                        {node.checks}
                      </span>
                      <span>
                        <b>Output</b>
                        {node.output}
                      </span>
                    </div>
                    {node.note ? <small>{node.note}</small> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="journey-card-copy">
            <p>{activeSlide.summary}</p>
            {activeSlideIndex === journeySlides.length - 1 ? (
              <p className="journey-start-note">
                Clicking Get Started will prompt you to connect wallet and start the setup wizard.
              </p>
            ) : null}
          </div>

          <div className="journey-actions">
            {activeSlideIndex > 0 ? (
              <button className="button ghost" onClick={() => setActiveSlideIndex(activeSlideIndex - 1)} type="button">
                Previous step
              </button>
            ) : null}
            {activeSlideIndex === journeySlides.length - 1 ? (
              <button className="button primary glow" onClick={onGetStarted} type="button">
                Get Started
              </button>
            ) : null}
            <button className="button ghost" onClick={() => setActiveSlideIndex(nextSlideIndex)} type="button">
              Next step
            </button>
          </div>
        </section>
      </header>

      {tldrOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section aria-labelledby="tldr-title" aria-modal="true" className="tldr-modal" role="dialog">
            <div className="tldr-modal-header">
              <div>
                <span className="muted">Guided journey</span>
                <h2 id="tldr-title">TLDR</h2>
              </div>
              <button className="button ghost" onClick={() => setTldrOpen(false)} type="button">
                Close
              </button>
            </div>
            <div className="unlock-strip modal-unlock-strip" aria-label="Dashboard unlock path">
              {unlockStates.map((state, index) => (
                <div className={`unlock-step ${connected || index === 0 ? "available" : ""}`} key={state.label}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{state.label}</strong>
                    <p>{state.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="tldr-footnote">
              Connect a parent wallet, complete the setup wizard, then unlock the dashboard pages for evidence,
              history, human intervention, and settings.
            </p>
            <div className="tldr-action-row">
              <button
                className={`button ${connected ? "ghost" : "primary glow"} tldr-connect`}
                onClick={() => {
                  setTldrOpen(false);
                  onGetStarted();
                }}
                type="button"
              >
                {connected ? "Wallet connected" : "Connect Wallet"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function MiniDiagram({ kind }: { kind: JourneyNode["visual"] }) {
  const labels: Record<JourneyNode["visual"], string> = {
    wallet: "Wallet",
    dashboard: "Dash",
    wizard: "Flow",
    ens: "ENS",
    alchemy: "Acct",
    bind: "Bind",
    zerog: "0G",
    audit: "Audit",
    chain: "Hash",
    payload: "Intent",
    keeperhub: "Gate",
    webhook: "Alert"
  };

  return (
    <div className={`mini-diagram ${kind}`} aria-hidden="true">
      <div className="mini-screen">
        <strong>{labels[kind]}</strong>
        <i />
        <i />
        <i />
      </div>
      <div className="mini-rail">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}
