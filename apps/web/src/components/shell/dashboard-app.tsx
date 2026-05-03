"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { OverviewPage } from "../overview";
import { SetupWizard, type SetupWizardStatus } from "../wizard";
import { AppShell, type ShellNavItem } from "./app-shell";
import { buildBoundedEventRegistryContext, keeperHubEventIngestEndpoint } from "../../lib/bounded-event-registry";
import { buildDemoIntent } from "../../lib/demo-intent";
import { discoverAgentSetups, hasCompleteAgentSetup, type AgentSetupDiscoveryRecord } from "../../lib/setup-discovery";
import { loadDashboardResume, saveDashboardResume } from "../../lib/setup-resume";
import { connectEip1193Wallet, type Eip1193Provider, type WalletAccountState } from "../../lib/wallet";

export type DashboardPage = "overview" | "setup" | "provider-evidence" | "intent-history" | "human-intervention" | "settings";
type DashboardAccessStage = "public" | "wallet-connected" | "setup-complete";

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export function DashboardApp() {
  const [selectedPage, setSelectedPage] = useState<DashboardPage>("overview");
  const [wallet, setWallet] = useState<WalletAccountState | undefined>();
  const [discoveredSetups, setDiscoveredSetups] = useState<AgentSetupDiscoveryRecord[]>([]);
  const [setupStatus, setSetupStatus] = useState<SetupWizardStatus>("not-started");
  const [activeSetupStep, setActiveSetupStep] = useState(0);
  const [resumeLoaded, setResumeLoaded] = useState(false);

  const connected = wallet?.status === "connected";
  const accessStage = getDashboardAccessStage(connected, setupStatus);
  const navItems = useMemo(() => buildNavItems(accessStage), [accessStage]);

  useEffect(() => {
    const resume = loadDashboardResume();
    if (resume !== undefined) {
      setSetupStatus(resume.setupStatus);
      setActiveSetupStep(resume.activeSetupStep);
    }
    setResumeLoaded(true);
  }, []);

  useEffect(() => {
    if (!resumeLoaded) return;
    saveDashboardResume({ activeSetupStep, setupStatus });
  }, [activeSetupStep, resumeLoaded, setupStatus]);

  function refreshDiscovery(account = wallet?.account): AgentSetupDiscoveryRecord[] {
    const walletSetups = discoverAgentSetups(account);
    setDiscoveredSetups(walletSetups);
    return walletSetups;
  }

  async function connectWallet() {
    if (typeof window === "undefined") return;
    const nextWallet = await connectEip1193Wallet(window.ethereum);
    setWallet(nextWallet);
    if (nextWallet.status === "connected") {
      const walletSetups = refreshDiscovery(nextWallet.account);
      const nextSetupStatus = hasCompleteAgentSetup(walletSetups) ? "complete" : setupStatus;
      if (hasCompleteAgentSetup(walletSetups)) {
        setSetupStatus(nextSetupStatus);
      }
      setSelectedPage(pageAfterWalletConnect(nextSetupStatus));
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
            refreshDiscovery();
            setSelectedPage("provider-evidence");
          }}
          onStart={() => {
            setSetupStatus("in-progress");
            setActiveSetupStep(0);
          }}
          status={setupStatus}
        />
      ) : null}
      {selectedPage === "provider-evidence" ? (
        <ProviderEvidencePage discoveredSetups={discoveredSetups} setupStatus={setupStatus} wallet={wallet} />
      ) : null}
      {selectedPage === "intent-history" ? (
        <IntentHistoryPage discoveredSetups={discoveredSetups} setupStatus={setupStatus} wallet={wallet} />
      ) : null}
      {selectedPage === "human-intervention" ? (
        <HumanInterventionPage discoveredSetups={discoveredSetups} setupStatus={setupStatus} wallet={wallet} />
      ) : null}
      {selectedPage === "settings" ? (
        <SettingsPage discoveredSetups={discoveredSetups} setupStatus={setupStatus} wallet={wallet} />
      ) : null}
    </AppShell>
  );
}

export function getDashboardAccessStage(connected: boolean, setupStatus: SetupWizardStatus): DashboardAccessStage {
  if (!connected) return "public";
  if (setupStatus !== "complete") return "wallet-connected";
  return "setup-complete";
}

export function pageAfterWalletConnect(setupStatus: SetupWizardStatus): DashboardPage {
  return setupStatus === "complete" ? "provider-evidence" : "setup";
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

function ProviderEvidencePage({
  discoveredSetups,
  setupStatus,
  wallet
}: {
  discoveredSetups: AgentSetupDiscoveryRecord[];
  setupStatus: SetupWizardStatus;
  wallet?: WalletAccountState;
}) {
  return (
    <SectionPage
      eyebrow={setupStatus === "complete" ? "Wallet evidence" : "Requires setup"}
      title="Provider Evidence"
      summary="After setup, this page reflects the connected wallet's ClearIntent state across ENS, 0G, KeeperHub, signer readiness, and account configuration."
    >
      {discoveredSetups.length > 0 ? <DiscoveredSetupsPanel records={discoveredSetups} /> : null}
      <div className="grid">
        <InfoPanel label="Parent wallet" value={wallet?.account ?? "Connected wallet not configured"} />
        <InfoPanel label="Configured wallets" value={configuredWalletsSummary(discoveredSetups)} />
        <InfoPanel label="ENS identities" value={identitySummary(discoveredSetups)} />
        <InfoPanel label="0G policy and audit" value={artifactSummary(discoveredSetups)} />
        <InfoPanel label="KeeperHub route" value={keeperHubSummary(discoveredSetups)} />
        <InfoPanel label="Delegation" value="Parent-owned agent account evidence is indexed; session-key enforcement is not claimed yet." />
        <InfoPanel label="Signer evidence" value="Phase 5C wallet prompt evidence appears after operator validation." />
      </div>
    </SectionPage>
  );
}

function DiscoveredSetupsPanel({ records }: { records: AgentSetupDiscoveryRecord[] }) {
  return (
    <div className="panel discovery-panel">
      <h2>Linked agent setups</h2>
      <p>
        These agent identities were discovered from this browser's wallet-scoped setup index. ENS, 0G, and KeeperHub
        receipts remain the authority evidence.
      </p>
      <div className="discovery-list">
        {records.map((record) => (
          <dl className="discovery-record" key={record.discoveryKey}>
            <div>
              <dt>Status</dt>
              <dd>{record.status}</dd>
            </div>
            <div>
              <dt>Agent ENS</dt>
              <dd>{record.agentEnsName}</dd>
            </div>
            <div>
              <dt>Agent account</dt>
              <dd>{record.agentAccount}</dd>
            </div>
            <div>
              <dt>Policy hash</dt>
              <dd>{record.policyHash ?? "Not indexed yet"}</dd>
            </div>
            <div>
              <dt>Policy URI</dt>
              <dd>{record.policyUri ?? "Not indexed yet"}</dd>
            </div>
            <div>
              <dt>Audit latest</dt>
              <dd>{record.auditLatest ?? "Not indexed yet"}</dd>
            </div>
            <div>
              <dt>KeeperHub run</dt>
              <dd>{record.keeperHubRunId ?? "Not indexed yet"}</dd>
            </div>
          </dl>
        ))}
      </div>
    </div>
  );
}

function IntentHistoryPage({
  discoveredSetups,
  setupStatus,
  wallet
}: {
  discoveredSetups: AgentSetupDiscoveryRecord[];
  setupStatus: SetupWizardStatus;
  wallet?: WalletAccountState;
}) {
  const intents = buildIntentHistory(discoveredSetups, wallet);

  return (
    <SectionPage
      eyebrow="Audit trail"
      title="Intent History"
      summary="Historical actions for the delegated account appear here. Selecting an intent should reveal the canonical audit payload, policy hash, review checkpoint, signature, execution receipt, and any human intervention events."
    >
      {intents.length === 0 ? (
        <div className="panel">
          <h2>No delegated account history yet</h2>
          <p>
            {setupStatus === "complete"
              ? "Setup evidence is present, but no transaction-backed ClearIntent intent history has been recorded in this browser index."
              : "Complete setup and run an approved ClearIntent flow before this page can show transaction history."}
          </p>
        </div>
      ) : (
        <div className="history-layout">
          <div className="history-list">
            {intents.map((intent) => (
              <button className="history-row" key={intent.id} type="button">
                <span>
                  <strong>{intent.title}</strong>
                  <small>{intent.subtitle}</small>
                </span>
                <strong>{intent.status}</strong>
              </button>
            ))}
          </div>
          <pre>{JSON.stringify(intents[0]?.payload ?? {}, null, 2)}</pre>
        </div>
      )}
    </SectionPage>
  );
}

function HumanInterventionPage({
  discoveredSetups,
  setupStatus,
  wallet
}: {
  discoveredSetups: AgentSetupDiscoveryRecord[];
  setupStatus: SetupWizardStatus;
  wallet?: WalletAccountState;
}) {
  const primarySetup = discoveredSetups[0];
  return (
    <SectionPage
      eyebrow="Escalations"
      title="Human Intervention"
      summary="This page is for explicit escalation events: policy exceptions, rejected wallet prompts, degraded audit writes, threshold triggers, and actions that need the parent wallet to decide."
    >
      <div className="grid dashboard-context-grid">
        <InfoPanel label="Pending reviews" value={setupStatus === "complete" ? "0 pending" : "Setup required before reviews can appear."} />
        <InfoPanel
          label="Escalation authority"
          value={wallet?.account ? `Parent wallet ${wallet.account} is the approval authority for sensitive changes.` : "Connect the parent wallet to identify escalation authority."}
        />
        <InfoPanel
          label="Covered agent"
          value={primarySetup ? `${primarySetup.agentEnsName} / ${primarySetup.agentAccount}` : "No linked agent setup is indexed yet."}
        />
        <InfoPanel
          label="Approval history"
          value={
            primarySetup
              ? "Setup approvals are indexed from the wizard; transaction approval history waits for signed intent tests."
              : "No parent-wallet approval history is available until setup or intent tests record evidence."
          }
        />
        <InfoPanel label="Recent escalations" value="No policy exception, rejected wallet prompt, degraded audit write, or threshold-trigger evidence is recorded yet." />
        <InfoPanel label="Policy behavior" value="Out-of-policy or degraded actions must fail closed or escalate before signing or execution." />
      </div>
    </SectionPage>
  );
}

function SettingsPage({
  discoveredSetups,
  setupStatus,
  wallet
}: {
  discoveredSetups: AgentSetupDiscoveryRecord[];
  setupStatus: SetupWizardStatus;
  wallet?: WalletAccountState;
}) {
  const primarySetup = discoveredSetups[0];
  const [demoDestination, setDemoDestination] = useState(wallet?.account ?? "");
  const [demoIntentCount, setDemoIntentCount] = useState(0);
  const registryContext = buildBoundedEventRegistryContext(wallet, primarySetup);
  const exportContext = buildExportContext(wallet, discoveredSetups, registryContext);
  const localSdkPrompt = buildOperatorHandoffPrompt(wallet, primarySetup, registryContext);
  const demoIntent = buildDemoIntent({
    wallet,
    setup: primarySetup,
    destination: demoDestination,
    renderCount: demoIntentCount
  });
  return (
    <SectionPage
      eyebrow={setupStatus === "complete" ? "Operator controls" : "Available after setup"}
      title="Settings"
      summary="Settings should change operator preferences and alert layers without becoming the authority source for policy, audit, or execution truth."
    >
      <div className="settings-grid">
        <ContextBlock
          title="Alert layers"
          body="KeeperHub sends events to ClearIntent's ingest endpoint. The bounded registry tells the user which parent wallet and agent setup the event context belongs to."
          rows={[
            ["KeeperHub ingest endpoint", keeperHubEventIngestEndpoint],
            ["Public ingest URL", registryContext.ingest.url],
            [
              "Bounded registry",
              primarySetup
                ? "Context is scoped to the connected parent wallet, agent account, and agent ENS."
                : "Unavailable until an agent setup is linked"
            ],
            ["Derived webhook name", registryContext.registry.displayName ?? "Unavailable until an agent setup is linked"],
            ["Derived webhook URL", registryContext.registry.url],
            ["Registry key", registryContext.registry.key ?? "Unavailable until an agent setup is linked"],
            ["User webhook forwarding", "Disabled until scoped destination registration, replay checks, and KeeperHub source binding exist"],
            ["Email", "Not configured"],
            ["Discord", "Not configured"],
            ["Telegram", "Not configured"]
          ]}
          code={JSON.stringify(registryContext, null, 2)}
        />
        <ContextBlock
          title="Demo intent"
          body="Generate a meaningful render-only ClearIntent transfer preview with randomized amount, deadline, nonce, and review summary. This does not submit a transaction."
          rows={[
            ["From", primarySetup?.agentAccount ?? "Agent account not linked"],
            ["To", demoDestination || "Destination address required"],
            ["Amount", demoIntent.transfer.amount],
            ["Network", demoIntent.network.label],
            ["Policy hash", primarySetup?.policyHash ?? "Policy hash not indexed"],
            ["Status", demoIntentCount > 0 ? `Rendered ${demoIntentCount} demo intent(s)` : primarySetup ? "Ready to render demo payload" : "Setup required"]
          ]}
          action={
            <div className="context-actions">
              <input
                aria-label="Demo intent destination address"
                onChange={(event) => setDemoDestination(event.target.value)}
                placeholder="0x destination"
                value={demoDestination}
              />
              <button
                className="button primary"
                disabled={primarySetup === undefined || demoDestination.trim().length === 0}
                onClick={() => setDemoIntentCount((count) => count + 1)}
                type="button"
              >
                Generate demo intent
              </button>
            </div>
          }
          code={JSON.stringify(demoIntent, null, 2)}
        />
        <ContextBlock
          title="Escalation wallet"
          body="Parent-wallet approval remains the control point for sensitive setup changes and out-of-policy actions."
          rows={[
            ["Parent wallet", wallet?.account ?? "Not connected"],
            ["Approval history", primarySetup ? "Setup evidence indexed; signed intent history pending." : "No linked approval evidence"],
            ["Pending approvals", "0"]
          ]}
        />
        <ContextBlock
          title="Export context"
          body="Everything needed for handoff should be visible and copyable without exposing parent secrets."
          rows={[
            ["Linked agents", String(discoveredSetups.length)],
            ["Export source", "browser-local discovery index"],
            ["Authority note", "Receipts and signed artifacts remain canonical"]
          ]}
          code={JSON.stringify(exportContext, null, 2)}
        />
        <ContextBlock
          title="Operator CLI handoff"
          body="Use this with the local SDK/CLI lane so the agent runtime receives references, not parent-wallet secrets."
          rows={[
            ["Command", "npm run clearintent -- agent context"],
            ["Agent ENS", primarySetup?.agentEnsName ?? "Not linked"],
            ["Agent account", primarySetup?.agentAccount ?? "Not linked"]
          ]}
          code={localSdkPrompt}
        />
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

function ContextBlock({
  action,
  body,
  code,
  rows,
  title
}: {
  action?: ReactNode;
  body: string;
  code?: string;
  rows: [string, string][];
  title: string;
}) {
  return (
    <div className="panel context-block">
      <h2>{title}</h2>
      <p>{body}</p>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {action}
      {code !== undefined ? <pre>{code}</pre> : null}
    </div>
  );
}

function configuredWalletsSummary(records: AgentSetupDiscoveryRecord[]): string {
  if (records.length === 0) return "No agent wallets are linked to the connected parent wallet yet.";
  return records.map((record) => `${record.agentEnsName}: ${record.agentAccount}`).join("; ");
}

function identitySummary(records: AgentSetupDiscoveryRecord[]): string {
  if (records.length === 0) return "No ENS identity has been discovered for this parent wallet.";
  return records.map((record) => record.agentEnsName).join(", ");
}

function artifactSummary(records: AgentSetupDiscoveryRecord[]): string {
  if (records.length === 0) return "No 0G policy or audit artifacts are indexed for this parent wallet.";
  const present = records.filter((record) => record.policyUri || record.policyHash || record.auditLatest).length;
  return `${present}/${records.length} linked setups include indexed 0G policy or audit references.`;
}

function keeperHubSummary(records: AgentSetupDiscoveryRecord[]): string {
  if (records.length === 0) return "No KeeperHub route is indexed for this parent wallet.";
  const present = records.filter((record) => record.keeperHubRunId).length;
  return `${present}/${records.length} linked setups include KeeperHub run evidence.`;
}

function buildIntentHistory(records: AgentSetupDiscoveryRecord[], wallet?: WalletAccountState) {
  return records.map((record) => ({
    id: `setup-${record.discoveryKey}`,
    title: "Setup custody map recorded",
    subtitle: `${record.agentEnsName} linked under ${shortAddress(record.parentWallet)}`,
    status: record.status === "complete" ? "setup complete" : "setup pending",
    payload: {
      eventType: "clearintent.setup.discovery",
      parentWallet: wallet?.account ?? record.parentWallet,
      agentAccount: record.agentAccount,
      agentEnsName: record.agentEnsName,
      policyUri: record.policyUri,
      policyHash: record.policyHash,
      auditLatest: record.auditLatest,
      keeperHubRunId: record.keeperHubRunId,
      transactionEvidence: "not_recorded",
      frontendAuthority: false
    }
  }));
}

function buildExportContext(
  wallet: WalletAccountState | undefined,
  records: AgentSetupDiscoveryRecord[],
  registryContext = buildBoundedEventRegistryContext(wallet, records[0])
) {
  return {
    schemaVersion: "clearintent.dashboard-export.v1",
    parentWallet: wallet?.account,
    keeperHubEventIngest: registryContext.ingest,
    boundedEventRegistry: registryContext.registry,
    userWebhookForwarding: registryContext.delivery,
    linkedAgents: records.map((record) => ({
      agentEnsName: record.agentEnsName,
      agentAccount: record.agentAccount,
      status: record.status,
      policyUri: record.policyUri,
      policyHash: record.policyHash,
      auditLatest: record.auditLatest,
      keeperHubRunId: record.keeperHubRunId
    })),
    custodyBoundary: "Export contains public references only. Parent wallet secrets are never included.",
    frontendAuthority: false
  };
}

function buildOperatorHandoffPrompt(
  wallet: WalletAccountState | undefined,
  setup: AgentSetupDiscoveryRecord | undefined,
  registryContext = buildBoundedEventRegistryContext(wallet, setup)
): string {
  if (setup === undefined) {
    return "Connect the parent wallet and complete or import an agent setup before generating the CLI handoff.";
  }
  return [
    "Use the ClearIntent local SDK/CLI lane with these public references only.",
    "",
    `Parent wallet: ${wallet?.account ?? setup.parentWallet}`,
    `Agent ENS: ${setup.agentEnsName}`,
    `Agent account: ${setup.agentAccount}`,
    `Policy URI: ${setup.policyUri ?? "not indexed"}`,
    `Policy hash: ${setup.policyHash ?? "not indexed"}`,
    `Audit latest: ${setup.auditLatest ?? "not indexed"}`,
    `KeeperHub run: ${setup.keeperHubRunId ?? "not indexed"}`,
    `KeeperHub event ingest: ${registryContext.ingest.endpoint}`,
    `KeeperHub event ingest URL: ${registryContext.ingest.url}`,
    `Derived webhook name: ${registryContext.registry.displayName ?? "not available"}`,
    `Derived webhook URL: ${registryContext.registry.url}`,
    `Bounded registry key: ${registryContext.registry.key ?? "not available"}`,
    "User webhook forwarding: disabled until scoped registration, replay checks, and source binding exist",
    "",
    "Do not request or expose the parent wallet private key or seed phrase."
  ].join("\n");
}

function shortAddress(value: string): string {
  return value.length > 12 ? `${value.slice(0, 6)}...${value.slice(-4)}` : value;
}
