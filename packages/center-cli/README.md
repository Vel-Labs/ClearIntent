# ClearIntent Center CLI

`packages/center-cli` is the local product-center skeleton for ClearIntent.

It is intentionally thin:

- it consumes public primitives from `packages/core`
- it renders fixture-backed authority state for humans
- it emits deterministic JSON for agents and automation with `--json`
- it exposes local module metadata, local ENS identity status, local KeeperHub execution status, and doctor checks for future adapters

It does not implement live ENS, live 0G, live KeeperHub/onchain execution, signer, webhook, OS notification, browser UI, hosted service, or demo integration behavior.

## Local Usage

Human lane:

```bash
npm run clearintent
```

When run in an interactive terminal, this opens the Center menu. Use arrow keys to move, Enter or Space to run a menu item, and `q` to exit. When run outside a TTY, it prints the deterministic landing/help screen.

The interactive menu is a human wrapper over the same command results. It does not introduce separate authority behavior.

AI lane:

```bash
npm run clearintent -- center status
npm run --silent clearintent -- center inspect --json
npm run clearintent -- intent validate
npm run clearintent -- intent state --fixture missing-evidence
npm run --silent clearintent -- authority evaluate --json
npm run clearintent -- identity status
npm run --silent clearintent -- identity status --json
npm run clearintent -- execution status
npm run --silent clearintent -- execution status --json
npm run clearintent -- keeperhub status
npm run clearintent -- signer status
npm run clearintent -- signer preview
npm run clearintent -- signer typed-data
npm run clearintent -- signer metadata
npm run --silent clearintent -- signer status --json
npm run --silent clearintent -- signer preview --json
npm run --silent clearintent -- signer typed-data --json
npm run --silent clearintent -- signer metadata --json
npm run clearintent -- test local
npm run --silent clearintent -- test local --json
npm run clearintent -- credentials status
npm run --silent clearintent -- credentials status --json
npm run clearintent -- module list
npm run --silent clearintent -- module doctor --json
```

## Output Layers

Default output is human-readable terminal text. It summarizes status, next action, missing evidence, blocked state, degraded signals, and issue codes without asking operators to read raw JSON.

`--json` output is machine-readable and contains no CLI prose. It is generated from the same command result object as the human output.

When invoking JSON through npm, use `npm run --silent clearintent -- <command> --json` so npm's wrapper banner does not precede the JSON payload.

Read-only inspection and evaluation commands exit `0` when the CLI command ran successfully, even when the authority result is blocked. JSON separates those truths explicitly:

```json
{
  "commandOk": true,
  "authorityOk": false,
  "ok": false
}
```

`commandOk` means the CLI command parsed and rendered. `authorityOk` means the inspected authority state passed. `ok` is currently a compatibility alias for `authorityOk`. CLI/runtime errors, such as an unknown fixture, set both `commandOk` and `authorityOk` to `false` and exit nonzero.

## Fixture Scope

The skeleton uses `contracts/examples/` fixtures only. Human output names `Mode: fixture-only`, `Fixture source: contracts/examples/`, and `Live provider: disabled`. JSON output includes:

```json
{
  "mode": "fixture-only",
  "fixtureSource": "contracts/examples/",
  "liveProvider": false
}
```

Blocked fixture output means the fixture is missing required evidence or intentionally violates authority checks. It does not mean the CLI crashed. Module doctor checks report future adapter modules as `deferred`, not missing runtime integrations.

`identity status` is a Phase 3A local fixture readout. It reports `Mode: ens-local-fixture`, `Live provider: disabled`, no live ENS claim, no live 0G claim, and `Authority: blocked` because identity discovery is not authority approval.

`execution status` and `keeperhub status` are Phase 4A local fixture readouts. They report `Mode: keeperhub-local-fixture`, `Live provider: disabled`, no live KeeperHub/onchain claim, no KeeperHub authority approval, and `Authority: blocked` because execution status is inspection, not approval.

`signer status`, `signer preview`, `signer typed-data`, and `signer metadata` are Phase 5A/5B local signer inspection routes. They report `Mode: signer-local-fixture`, `Live provider: disabled`, `Authority: blocked`, and no real-wallet, wallet-rendered preview, secure-device display, or vendor-approved Clear Signing claim. Claim levels are limited to local signer fixture, local EIP-712 fixture, and local ERC-7730 metadata vocabulary.

`test local` runs the local operator checklist as one aggregate CLI command. It reports simple indicators for contracts, core lifecycle, 0G, ENS, KeeperHub, signer payload, metadata, and cross-layer posture. The local column can show `✅ tested`; live/onchain columns remain `not tested` or `not needed` until a dedicated live phase produces evidence.

`credentials status` checks repo-local runtime env safety, the configured external operator secrets file, and Phase 2B 0G setup readiness without printing secrets. It reports whether env files are ignored, whether sensitive env files are tracked, whether secret values were accidentally placed in repo-local env files, whether required 0G values are present, and whether live writes are enabled.
