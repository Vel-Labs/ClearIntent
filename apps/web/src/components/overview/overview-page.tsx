type OverviewPageProps = {
  connected: boolean;
};

const demoTypedData = {
  primaryType: "ClearIntentAgentIntent",
  domain: {
    name: "ClearIntent",
    version: "1",
    chainId: 11155111,
    verifyingContract: "0x6666666666666666666666666666666666666666"
  },
  message: {
    intentId: "demo-intent-001",
    policyHash: "0x2222222222222222222222222222222222222222222222222222222222222222",
    signer: "0x4444444444444444444444444444444444444444",
    executor: "0x5555555555555555555555555555555555555555",
    actionType: "demo.transfer",
    valueLimit: "0",
    identity: "demo.agent.clearintent.eth"
  }
};

export function OverviewPage({ connected }: OverviewPageProps) {
  return (
    <div className="page-stack">
      <header className="landing-hero">
        <div className="section-header">
          <h1>Give autonomous agents a human authority layer.</h1>
          <p>
            ClearIntent helps a person connect a parent wallet, configure a bounded agent account, require readable
            approval, and preserve an audit trail before an agent-controlled transaction is allowed to move forward.
          </p>
          <div className="actions">
            <span className="badge warning">{connected ? "wallet connected" : "connect a parent wallet to begin setup"}</span>
            <span className="badge">non-custodial by design</span>
          </div>
        </div>
        <div className="hero-panel">
          <h2>What ClearIntent protects</h2>
          <div className="evidence-list">
            <Row label="Parent wallet" value="Remains the user authority and escalation signer." />
            <Row label="Agent account" value="Acts only inside explicit policy boundaries once configured." />
            <Row label="Payload" value="One canonical ClearIntent payload drives wallet, CLI, audit, and execution views." />
            <Row label="Audit trail" value="Policy, approval, signature, receipt, and intervention evidence stay replayable." />
          </div>
        </div>
      </header>

      <section className="grid" aria-label="ClearIntent high level overview">
        <InfoCard
          title="1. Configure authority"
          text="Use Setup Wizard to connect a parent wallet, bind identity, store policy references, choose execution routing, and configure alert layers."
        />
        <InfoCard
          title="2. Review every intent"
          text="Before approval, humans see the canonical payload, policy hash, signer, executor, and action bounds in a digestible review surface."
        />
        <InfoCard
          title="3. Execute with evidence"
          text="KeeperHub, ENS, 0G, signer, and wallet evidence are reflected back to the connected wallet experience without making the frontend authority truth."
        />
      </section>

      <section className="panel">
        <h2>What happens after connecting</h2>
        <p>
          The sidebar expands from a public Overview into Setup Wizard, Provider Evidence, Intent History, Human
          Intervention, and Settings. Those pages are meant to be based on wallet identity, delegation state, provider
          evidence, and onchain interactions after setup is complete.
        </p>
      </section>

      <section className="grid" aria-label="Phase boundary">
        <div className="panel">
          <h2>Public state</h2>
          <div className="evidence-list">
            <Row label="Wallet" value={connected ? "Connected" : "Not connected"} />
            <Row label="Setup" value="Not complete" />
            <Row label="Authority source" value="Signed artifacts, provider evidence, and receipts. Not frontend-local state." />
          </div>
        </div>
        <div className="panel">
          <h2>Connected pages</h2>
          <div className="evidence-list">
            <Row label="Setup Wizard" value="The new user journey for configuring ClearIntent." />
            <Row label="Provider Evidence" value="The connected-wallet view after setup completion." />
            <Row label="Intent History" value="Historical delegated-account transactions and audit payloads." />
            <Row label="Human Intervention" value="Explicit escalation and review events." />
          </div>
        </div>
        <div className="panel">
          <h2>Still not claimed</h2>
          <p>
            This baseline does not claim WalletConnect, Ledger Clear Signing, hardware-wallet validation,
            smart-account/session-key enforcement, or Phase 7 write-capable setup completion.
          </p>
        </div>
      </section>

      <section className="grid" aria-label="Payload preview">
        <div className="panel" style={{ gridColumn: "span 2" }}>
          <div className="section-header">
            <Badge tone="warning">Demo payload / approval preview</Badge>
            <h2>ClearIntent payload preview</h2>
            <p>
              This is the kind of canonical payload a human should inspect before wallet approval. It is demo-only until
              a connected wallet and selected intent are supplied by the validation flow.
            </p>
          </div>
          <div className="page-stack">
            <div className="evidence-list">
              <Row label="Primary type" value={demoTypedData.primaryType} />
              <Row label="Signer" value={demoTypedData.message.signer} />
              <Row label="Executor" value={demoTypedData.message.executor} />
              <Row label="Policy hash" value={demoTypedData.message.policyHash} />
              <Row label="Wallet proof" value="App preview only. Wallet-rendered field visibility requires operator-run evidence." />
            </div>
            <pre>{JSON.stringify(demoTypedData, null, 2)}</pre>
          </div>
        </div>

        <div className="panel">
          <Badge tone="warning">setup required</Badge>
          <h2>Connected experience</h2>
          <p>
            Once a parent wallet is connected and setup is complete, ClearIntent should show provider evidence, intent
            history, human intervention events, and settings for alert routing.
          </p>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ text, title }: { text: string; title: string }) {
  return (
    <article className="panel">
      <h2>{title}</h2>
      <p>{text}</p>
    </article>
  );
}

function Badge({ children, tone }: { children: string; tone: "ok" | "warning" | "danger" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="evidence-row">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
    </div>
  );
}
