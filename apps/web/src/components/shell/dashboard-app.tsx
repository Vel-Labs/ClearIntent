"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { OverviewPage } from "../overview";
import { AppShell, type ShellNavItem } from "./app-shell";
import { connectEip1193Wallet, type Eip1193Provider, type WalletAccountState } from "../../lib/wallet";

type DashboardPage = "overview" | "setup" | "provider-evidence" | "intent-history" | "human-intervention" | "settings";
type SetupStatus = "not-started" | "in-progress" | "complete";

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export function DashboardApp() {
  const [selectedPage, setSelectedPage] = useState<DashboardPage>("overview");
  const [wallet, setWallet] = useState<WalletAccountState | undefined>();
  const [setupStatus] = useState<SetupStatus>("not-started");

  const connected = wallet?.status === "connected";
  const navItems = useMemo(() => buildNavItems(connected), [connected]);
  const walletLabel = connected ? shortAddress(wallet?.account) : wallet?.status === "no-provider" ? "Wallet unavailable" : "Connect wallet";
  const statusLabel = connected ? (setupStatus === "complete" ? "configured" : "connected-unconfigured") : "overview";

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
      onConnectWallet={connectWallet}
      onSelectNav={(id) => setSelectedPage(id as DashboardPage)}
      selectedNav={selectedPage}
      statusLabel={statusLabel}
      walletLabel={walletLabel}
    >
      {selectedPage === "overview" ? <OverviewPage connected={connected} /> : null}
      {selectedPage === "setup" ? <SetupPage setupStatus={setupStatus} /> : null}
      {selectedPage === "provider-evidence" ? <ProviderEvidencePage setupStatus={setupStatus} wallet={wallet} /> : null}
      {selectedPage === "intent-history" ? <IntentHistoryPage setupStatus={setupStatus} /> : null}
      {selectedPage === "human-intervention" ? <HumanInterventionPage setupStatus={setupStatus} /> : null}
      {selectedPage === "settings" ? <SettingsPage setupStatus={setupStatus} /> : null}
    </AppShell>
  );
}

function buildNavItems(connected: boolean): ShellNavItem[] {
  return [
    { id: "overview", label: "Overview" },
    { id: "setup", label: "Setup Wizard", locked: !connected },
    { id: "provider-evidence", label: "Provider Evidence", locked: !connected },
    { id: "intent-history", label: "Intent History", locked: !connected },
    { id: "human-intervention", label: "Human Intervention", locked: !connected },
    { id: "settings", label: "Settings", locked: !connected }
  ];
}

function SetupPage({ setupStatus }: { setupStatus: SetupStatus }) {
  const steps = [
    "Connect the parent wallet.",
    "Create or select the parent-owned agent account.",
    "Bind ENS identity records.",
    "Store policy and audit pointers through 0G.",
    "Select KeeperHub execution routing.",
    "Configure human intervention alerts.",
    "Export SDK/CLI handoff context."
  ];

  return (
    <SectionPage
      eyebrow={setupStatus === "complete" ? "Configured" : "New user journey"}
      title="Setup Wizard"
      summary="This is the guided path for configuring ClearIntent. Phase 6 exposes the journey shape; Phase 7 owns the full write-capable wizard."
    >
      <div className="timeline-list">
        {steps.map((step, index) => (
          <div className="timeline-row" key={step}>
            <span>{index + 1}</span>
            <p>{step}</p>
          </div>
        ))}
      </div>
    </SectionPage>
  );
}

function ProviderEvidencePage({ setupStatus, wallet }: { setupStatus: SetupStatus; wallet?: WalletAccountState }) {
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

function IntentHistoryPage({ setupStatus }: { setupStatus: SetupStatus }) {
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

function HumanInterventionPage({ setupStatus }: { setupStatus: SetupStatus }) {
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

function SettingsPage({ setupStatus }: { setupStatus: SetupStatus }) {
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

function shortAddress(address?: string): string {
  if (!address) return "Connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
