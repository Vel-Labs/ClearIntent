"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { OverviewPage } from "../overview";
import { SetupWizard, type SetupWizardStatus } from "../wizard";
import { AppShell, type ShellNavItem } from "./app-shell";
import { connectEip1193Wallet, type Eip1193Provider, type WalletAccountState } from "../../lib/wallet";

type DashboardPage = "overview" | "setup" | "provider-evidence" | "intent-history" | "human-intervention" | "settings";
type DashboardAccessStage = "public" | "wallet-connected" | "setup-complete";

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export function DashboardApp() {
  const [selectedPage, setSelectedPage] = useState<DashboardPage>("overview");
  const [wallet, setWallet] = useState<WalletAccountState | undefined>();
  const [setupStatus, setSetupStatus] = useState<SetupWizardStatus>("not-started");
  const [activeSetupStep, setActiveSetupStep] = useState(0);

  const connected = wallet?.status === "connected";
  const accessStage = getDashboardAccessStage(connected, setupStatus);
  const navItems = useMemo(() => buildNavItems(accessStage), [accessStage]);

  async function connectWallet() {
    if (typeof window === "undefined") return;
    const nextWallet = await connectEip1193Wallet(window.ethereum);
    setWallet(nextWallet);
    if (nextWallet.status === "connected") {
      setSelectedPage("setup");
    }
  }

  return (
    <AppShell
      connected={connected}
      navItems={navItems}
      onSelectNav={(id) => setSelectedPage(id as DashboardPage)}
      selectedNav={selectedPage}
    >
      {selectedPage === "overview" ? <OverviewPage connected={connected} onGetStarted={connectWallet} /> : null}
      {selectedPage === "setup" ? (
        <SetupWizard
          activeStepIndex={activeSetupStep}
          onAdvance={() => {
            setSetupStatus("in-progress");
            setActiveSetupStep((currentStep) => currentStep + 1);
          }}
          onComplete={() => {
            setSetupStatus("complete");
            setActiveSetupStep(0);
            setSelectedPage("provider-evidence");
          }}
          onStart={() => {
            setSetupStatus("in-progress");
            setActiveSetupStep(0);
          }}
          status={setupStatus}
        />
      ) : null}
      {selectedPage === "provider-evidence" ? <ProviderEvidencePage setupStatus={setupStatus} wallet={wallet} /> : null}
      {selectedPage === "intent-history" ? <IntentHistoryPage setupStatus={setupStatus} /> : null}
      {selectedPage === "human-intervention" ? <HumanInterventionPage setupStatus={setupStatus} /> : null}
      {selectedPage === "settings" ? <SettingsPage setupStatus={setupStatus} /> : null}
    </AppShell>
  );
}

export function getDashboardAccessStage(connected: boolean, setupStatus: SetupWizardStatus): DashboardAccessStage {
  if (!connected) return "public";
  if (setupStatus !== "complete") return "wallet-connected";
  return "setup-complete";
}

export function buildNavItems(accessStage: DashboardAccessStage): ShellNavItem[] {
  const publicItems: ShellNavItem[] = [{ id: "overview", label: "Overview" }];

  if (accessStage === "public") return publicItems;

  const setupItems: ShellNavItem[] = [...publicItems, { id: "setup", label: "Setup Wizard" }];

  if (accessStage === "wallet-connected") return setupItems;

  return [
    ...setupItems,
    { id: "provider-evidence", label: "Provider Evidence" },
    { id: "intent-history", label: "Intent History" },
    { id: "human-intervention", label: "Human Intervention" },
    { id: "settings", label: "Settings" }
  ];
}

function ProviderEvidencePage({ setupStatus, wallet }: { setupStatus: SetupWizardStatus; wallet?: WalletAccountState }) {
  return (
    <SectionPage
      eyebrow={setupStatus === "complete" ? "Wallet evidence" : "Requires setup"}
      title="Provider Evidence"
      summary="After setup, this page reflects the connected wallet's ClearIntent state across ENS, 0G, KeeperHub, signer readiness, and account configuration."
    >
      <div className="grid">
        <InfoPanel label="Parent wallet" value={wallet?.account ?? "Connected wallet not configured"} />
        <InfoPanel label="ENS identity" value="Resolved from configured records after wizard completion." />
        <InfoPanel label="0G policy and audit" value="Loaded from artifact references, not frontend-local state." />
        <InfoPanel label="KeeperHub route" value="Workflow evidence only unless transaction evidence exists." />
        <InfoPanel label="Delegation" value="Session-key or smart-account enforcement is not claimed yet." />
        <InfoPanel label="Signer evidence" value="Phase 5C wallet prompt evidence appears after operator validation." />
      </div>
    </SectionPage>
  );
}

function IntentHistoryPage({ setupStatus }: { setupStatus: SetupWizardStatus }) {
  const intents = setupStatus === "complete" ? sampleIntents : [];

  return (
    <SectionPage
      eyebrow="Audit trail"
      title="Intent History"
      summary="Historical actions for the delegated account appear here. Selecting an intent should reveal the canonical audit payload, policy hash, review checkpoint, signature, execution receipt, and any human intervention events."
    >
      {intents.length === 0 ? (
        <div className="panel">
          <h2>No delegated account history yet</h2>
          <p>Complete setup and run an approved ClearIntent flow before this page can show transaction history.</p>
        </div>
      ) : (
        <div className="history-layout">
          <div className="history-list">
            {intents.map((intent) => (
              <button className="history-row" key={intent.id} type="button">
                <span>{intent.title}</span>
                <strong>{intent.status}</strong>
              </button>
            ))}
          </div>
          <pre>{JSON.stringify(sampleAuditPayload, null, 2)}</pre>
        </div>
      )}
    </SectionPage>
  );
}

function HumanInterventionPage({ setupStatus }: { setupStatus: SetupWizardStatus }) {
  return (
    <SectionPage
      eyebrow="Escalations"
      title="Human Intervention"
      summary="This page is for explicit escalation events: policy exceptions, rejected wallet prompts, degraded audit writes, threshold triggers, and actions that need the parent wallet to decide."
    >
      <div className="grid">
        <InfoPanel label="Pending reviews" value={setupStatus === "complete" ? "0 pending" : "Setup required before reviews can appear."} />
        <InfoPanel label="Recent escalations" value="No human intervention evidence is recorded in this local dashboard session." />
        <InfoPanel label="Policy behavior" value="Out-of-policy or degraded actions must fail closed or escalate." />
      </div>
    </SectionPage>
  );
}

function SettingsPage({ setupStatus }: { setupStatus: SetupWizardStatus }) {
  return (
    <SectionPage
      eyebrow={setupStatus === "complete" ? "Operator controls" : "Available after setup"}
      title="Settings"
      summary="Settings should change operator preferences and alert layers without becoming the authority source for policy, audit, or execution truth."
    >
      <div className="grid">
        <InfoPanel label="Alert layers" value="Configure email, Discord, Telegram, or webhook destinations after provider setup." />
        <InfoPanel label="Escalation wallet" value="Parent-wallet authority remains the source of sensitive approval changes." />
        <InfoPanel label="Export context" value="Generate SDK/CLI handoff references without exposing parent secrets." />
      </div>
    </SectionPage>
  );
}

function SectionPage({ children, eyebrow, title, summary }: { children: ReactNode; eyebrow: string; title: string; summary: string }) {
  return (
    <div className="page-stack">
      <header className="section-header">
        <span className="muted">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{summary}</p>
      </header>
      {children}
    </div>
  );
}

function InfoPanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel">
      <h2>{label}</h2>
      <p>{value}</p>
    </div>
  );
}

const sampleIntents = [
  { id: "intent-demo-001", title: "Demo policy-bounded transfer", status: "executed" },
  { id: "intent-demo-002", title: "Threshold review requested", status: "human review" }
];

const sampleAuditPayload = {
  intentId: "intent-demo-001",
  policyHash: "0x...",
  humanReviewCheckpoint: "required-before-signing",
  signatureEvidence: "operator-wallet-required",
  executionReceipt: "keeperhub-workflow-evidence",
  frontendAuthority: false
};
