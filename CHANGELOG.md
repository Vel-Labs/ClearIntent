# CHANGELOG

All notable repo changes should be logged here.

## 2026-05-03

- Added wallet-scoped browser discovery for hosted setup re-entry so a connected parent wallet can surface linked agent ENS/account setup evidence instead of forcing existing operators back through a blank wizard.
- Added browser-local setup resume snapshots for dashboard navigation and wizard receipt evidence so refreshes no longer erase visible progress, while keeping provider receipts and signed artifacts as authority truth.
- Expanded dashboard context pages so Provider Evidence, Intent History, Human Intervention, and Settings render linked parent-wallet/agent setup context, exportable handoff data, alert-layer placeholders, and a render-only demo intent trigger.
- Added optional agent-scoped KeeperHub webhook token validation so hosted event ingress can reject spoofed events when `CLEARINTENT_KEEPERHUB_WEBHOOK_SECRET` is configured.
- Hardened wizard wallet evidence handling so ENS claim and resolver-record steps wait for successful transaction receipts before marking a layer ready, preventing pending/reverted wallet transactions from advancing the setup flow.
- Fixed hosted wizard Step 5 resolver preparation by carrying the resolver address prepared during the ENS subname claim into the ENS record-binding route, avoiding `missing_resolver` while the new subname is still indexing.
- Tightened Step 4 of the setup wizard by removing the duplicate global publish action, replacing the hosted 0G running state with a compact progress panel, and reducing the active card height pressure on the wizard header/timeline.
- Added a bounded hosted 0G publishing path in the setup wizard so Step 4 no longer remains in an indefinite running state, returns readable operator errors, advances to ENS records after successful hosted publishing, and presents local SDK vs hosted publishing as compact stacked mode cards.
- Split the hosted setup wizard transaction flow so Step 2 funds the predicted Sepolia smart account before deployment, Step 3 prepares the ENS subname claim before requesting the parent-wallet transaction, and Step 5 batches the ENS address record with the ClearIntent text-record resolver multicall.

## 2026-05-02

- Added the `clearintent` executable shim plus local-operator, agent-context, and fail-closed intent gate CLI routes so `clearintent setup local-operator`, `clearintent agent context`, and `clearintent intent create/evaluate/submit/execute` can become the contracted local SDK path for agents.
- Added repo-local skills for agent operation, intent authoring, executor gating, and escalation review so AI agents have explicit instructions to inspect ClearIntent context and avoid raw wallet bypasses.
- Added web workspace runtime dependencies required by deployed Next.js API routes that import ClearIntent package source, fixing Vercel build resolution for `ethers`, 0G SDK, `ajv`, and `ajv-formats`.
- Added repo-local skills for local operator setup, 0G credential safety, agent SDK handoff, and frontend wizard operator modes so hosted setup can recommend local custody while preserving a hosted publishing path.
- Recorded Phase 7 wizard validation evidence for `vel2.agent.clearintent.eth`, including parent wallet, parent-owned agent smart account, 0G policy URI/hash, KeeperHub run ID, and ENS portal verification, while keeping the remaining demo-transaction proof gap explicit.
- Extended `POST /api/keeperhub/events` to accept the `clearintent.keeperhub-event.v1` workflow payload from KeeperHub's `Send ClearIntent Event` block, reject unresolved template values, return an agent isolation key, and keep user webhook fanout disabled until agent-scoped registration/auth/replay controls exist.
- Opened `apps/web/` intentionally for Phase 6 with npm workspace scripts (`web:dev`, `web:typecheck`, `web:lint`, `web:test`) and scaffold/profile routing so the frontend is no longer forbidden early scope.
- Added the initial Next.js authority dashboard foundation with an Overview page, dark operational shell, explicit `unconnected` default state, demo-only canonical ClearIntent payload preview, wallet validation copy, and provider evidence cards that do not treat frontend-local state as authority truth.
- Reworked the Phase 6 dashboard navigation so Overview is the public explanatory entry page, wallet connection sits in the top-right, and connected wallets reveal Setup Wizard, Provider Evidence, Intent History, Human Intervention, and Settings as separate sidebar destinations.
- Simplified the Overview into a visual parent-wallet journey carousel and gated sidebar progression so public users see only Overview, connected wallets unlock Setup Wizard, and completed setup unlocks Provider Evidence, Intent History, Human Intervention, and Settings.
- Moved public wallet connection behind the Overview journey CTA so the top bar no longer shows Connect Wallet before users reach the final carousel step, where a glowing Get Started action explains that it will prompt wallet connection and start setup.
- Expanded Overview carousel slide context for wallet authority, ENS/sub-wallet setup, 0G policy evidence, KeeperHub validation, and webhook alerts while keeping all three visual step blocks equal height.
- Reduced Overview page density by moving the three-step TLDR unlock path into a modal launched from the carousel header, with Connect Wallet placed inside the parent-wallet TLDR block.
- Added Phase 6 authority/evidence state modeling for `unconnected`, `connected-unconfigured`, `partially-configured`, `configured`, `degraded`, and `demo`, covering wallet, ENS, 0G, KeeperHub, signer, payload, and Alchemy readiness evidence.
- Added a generic EIP-1193/MetaMask-first wallet adapter boundary for account/chain reads and `eth_signTypedData_v4` request construction from the existing signer-adapter typed-data shape, with request-only evidence and no wallet-rendered preview claim.
- Added an Alchemy Account Kit readiness boundary that reports missing public config as `not-configured` and does not claim smart-account or session-key enforcement.
- Added Account Kit frontend dependencies for the parent-owned agent smart account path and updated readiness/env docs so `NEXT_PUBLIC_ALCHEMY_API_KEY` plus chain are required while Gas Manager policy IDs remain out of scope.
- Added the Setup Wizard command-card flow with ENS Registry availability checks, receipt-oriented step panels, horizontal custody progress, and explicit disabled states for provider actions that are not yet web-wired.
- Added `POST /api/keeperhub/events` as a KeeperHub reported-event ingest stub with deterministic shape validation, explicit token/signature/replay/source-binding gaps, and non-authoritative display semantics.
- Added Phase 6 midpoint and foundation closeout audits with exact validation evidence and unproven claims for Phase 5C, WalletConnect/mobile, hardware wallets, Ledger Clear Signing, smart-account/session-key enforcement, trusted KeeperHub webhooks, and Phase 7 wizard scope.
- Reframed roadmap sequencing so Phase 6 is the authority dashboard and wallet validator for Phase 5C/5D/5E evidence, Phase 7 is the UX/setup wizard, and stretch standards move to Phase 8.
- Added the exported KeeperHub Phase 4B `ClearIntent Execution Gate` workflow artifact with disabled webhook nodes for later `clearintent.xyz` event ingest, preserving the current manual-trigger/programmatic-submit architecture.
- Recorded first KeeperHub Phase 4B live submit evidence at claim level `keeperhub-live-submitted`: workflow `r8hbrox9eorgvvlunk72b`, execution/run `p5w6v9tydmv80ss4zfr0r`, initially accepted as `running`, with transaction evidence still absent.
- Added `keeperhub live-run-status` to query KeeperHub execution status and logs for `KEEPERHUB_EXECUTION_ID` / `KEEPERHUB_RUN_ID`; the first monitored run returned terminal status `failed` with zero logs, preserving the boundary between submitted workflow evidence and transaction-backed execution proof.
- Recorded corrected KeeperHub workflow execution evidence for simplified run `089to8oqegw0r48i63vbj`, which reached terminal status `executed` with no transaction hash; the claim remains workflow-execution proof, not onchain execution proof.
- Closed Phase 4B at the KeeperHub workflow-execution proof boundary and cleaned the exported workflow artifact so only `ClearIntent Execution Gate -> Evaluate ClearIntent Gate` remains active, with the `Send ClearIntent Event` webhook node disabled and disconnected until the frontend event ingest route exists.
- Replaced the mixed Phase 6.6 frontend/setup-wizard plan with `docs/roadmaps/phase-6-authority-wallet-validator/IMPLEMENTATION_PLAN.md` and routed the guided wizard to `docs/roadmaps/phase-7-ux-wizard-flow/IMPLEMENTATION_PLAN.md`.
- Closed Phase 3B live ENS binding at `ens-live-bound` for `guardian.agent.clearintent.eth`, with live ENS record resolution, required ClearIntent text records present, and expected policy hash verification against the 0G-backed policy artifact.
- Recorded ENS resolver multicall evidence: transaction `0x1dce685d1af441208b5ae22f890cbf3e7ed38b2865c04701c874e1f40d5f861b`, block `25005501`, records `agent.card`, `policy.uri`, `policy.hash`, `audit.latest`, and `clearintent.version`.
- Added the Phase 3B closeout audit and updated roadmap/current-state routing so Phase 4B is unblocked by 0G/ENS prerequisites but remains open until KeeperHub live run/transaction evidence and canonical receipt conversion are recorded.
- Added `docs/roadmaps/May-2-Sprint.md` to capture the next implementation leg: KeeperHub CLI completion, parent-owned agent smart accounts, frontend wizard, canonical ClearIntent payload rendering, software-wallet validation, and hardware-wallet validation.
- Added KeeperHub Phase 4B CLI routes for `keeperhub live-status` and gated `keeperhub live-submit`, including live config parsing, workflow readiness checks, 0G/ENS binding prerequisite checks, explicit submit opt-in through `KEEPERHUB_ENABLE_LIVE_SUBMIT`, and canonical receipt conversion for accepted live submissions.

## 2026-05-01

- Documented the intended hosted-dashboard-first, SDK/CLI-second product abstraction: parent-wallet login, dedicated agent wallet or smart-account setup, policy/escalation configuration, 0G/ENS-backed pointers, and scoped agent-facing runtime inputs.
- Clarified that the hosted dashboard must stay stateless and non-custodial, while the agent-facing runtime must not receive parent-wallet secrets or unrestricted hot-wallet keys.
- Recorded smart-account/session-key enforcement as the preferred future bounded-automation layer while keeping current MVP claims limited to ClearIntent core plus KeeperHub pre-execution policy gating until live evidence exists.
- Closed Phase 2B live 0G Storage smoke evidence at `0g-write-read-verified` with proof-enabled readback, recording root hash `0x8ee47b16e03de745ebf2e65e94ed3b7341395f506a5fb7c8e299f9974aa22484` and transaction hash `0x024cc777830963d7c23500024554ed7692f3cb7562ec44014780f68bfdaa66b7`.
- Updated credential validation and live smoke handling to accept MetaMask-style 64-character private keys without a `0x` prefix while preserving 32-byte EVM key validation and secret-redaction behavior.
- Added Phase 3B live ENS resolver scaffolding and Center CLI `identity live-status`, with deterministic degraded output until ENS RPC/name/text-record configuration is available.
- Added backward-compatible ENS live config aliases so older `.env.local` blocks using `ENS_EVM_RPC`, `CLEARINTENT_ENS_NAME`, and `CLEARINTENT_EXPECTED_POLICY_HASH` still drive `identity live-status`.
- Added Center CLI `memory live-bindings` to upload demo policy, audit pointer, and agent-card artifacts to 0G and print the ENS text-record values needed for `ens-live-bound`.
- Added ENS Public Resolver multicall preparation for ClearIntent text-record binding through `identity bind-records`, enabling a future parent-wallet frontend to set all agent binding records in one wallet transaction.
- Added gated local ENS multicall submission through `identity send-bind-records`, requiring explicit `ENS_ENABLE_LIVE_WRITES=true` and an external `ENS_SIGNER_PRIVATE_KEY` for dedicated demo wallets.

## 2026-04-30

- Added Center CLI `test local` aggregate operator check with simple local/onchain indicators for contracts, core lifecycle, 0G, ENS, KeeperHub, signer payload, metadata, and cross-layer posture without promoting live claims.
- Updated operator testing docs and Center CLI validation so the aggregate local check is available in human and JSON lanes.
- Clarified Phase 5C claim staging as `software-wallet-tested signer-only` before 2B/3B/4B live-testnet context and `software-wallet-tested testnet-integrated` after the wallet signs a payload bound to live 2B/3B/4B evidence.
- Added the `credential-safety` repo-local skill, `credentials status` Center CLI route, and `npm run validate:credentials` preflight so operators can check local env readiness without printing secrets before Phase 2B/3B/4B/5C testing.
- Added `clearintent.config.json` and `operator-secrets/` templates so real wallet/provider secrets can live outside repo-local `.env.local` while the CLI reports only redacted readiness.

## 2026-04-29

- Added Phase 5A and 5B midpoint/closeout audit artifacts under `docs/audits/phase-5-signer-readable-approval/` with exact local validation results.
- Updated Phase 5 roadmap/current-state/profile/file-tree/wallet docs to record local signer claims at `signer-local-fixture`, `eip712-local-fixture`, and `erc7730-local-metadata`.
- Documented Phase 5C prep as request-shape/status/docs only unless an operator-run MetaMask/software-wallet test records real evidence; no `software-wallet-tested`, wallet-rendered preview, secure-device display, or vendor-approved Clear Signing claim is made from local fixtures.
- Added `docs/providers/Wallets/PHASE_5_SOURCE_REVIEW.md` with EIP-712, EIP-1193, ERC-7730, MetaMask, and Clear Signing implementation notes for Phase 5A/5B/5C.
- Added Phase 5 implementation plans for 5A signer payload/local approval, 5B ERC-7730 metadata local scaffold, and 5C MetaMask/software-wallet validation.
- Reflowed Phase 5 into 5A local signer payload/approval scaffold, 5B local ERC-7730 / Clear Signing metadata scaffold, 5C software wallet validation, 5D WalletConnect/mobile validation, and 5E hardware/secure-display validation.
- Clarified that Phase 2B, 3B, and 4B are testnet-first live evidence phases, with livenet/mainnet follow-up preferred after successful testnet proof and separate claim/audit language.
- Completed Phase 4A locally by adding `packages/keeperhub-adapter/` with a typed local KeeperHub execution adapter, deterministic workflow mapping, local submit/monitor simulation, canonical `ExecutionReceipt` conversion, explicit fail-closed issue codes, and `keeperhub-local-fixture` claim level.
- Added `tests/keeperhub-adapter/` coverage for successful mapping, local submit/monitor, canonical receipt schema validation, missing verification, missing signature, unsupported executor, missing workflow ID, failed runs, missing transaction evidence, unavailable live provider, and no live/onchain claim behavior.
- Added Center CLI `execution status` and `keeperhub status` in human-readable and parse-safe JSON modes, including wizard/landing exposure, while keeping execution status as inspection with `authorityOk: false`.
- Added Phase 4A midpoint and closeout audits and routed the next implementation recommendation to Phase 2B live 0G closeout before Phase 3B and Phase 4B live evidence work.
- Split Phase 4 into Phase 4A KeeperHub Execution Local Scaffold and Phase 4B live KeeperHub/onchain execution, matching the local-first pattern from Phase 2A/2B and Phase 3A/3B.
- Added `docs/roadmaps/phase-4-keeperhub-execution-adapter/IMPLEMENTATION_PLAN.md` covering 4A and 4B scope, claim levels, audit points, Center CLI expectations, validation, custody boundaries, and deferred live execution conditions.
- Updated roadmap/current-state routing so Phase 4A can proceed locally while Phase 2B, Phase 3B, and Phase 4B remain gated on credentials, funding, and live evidence.
- Completed Phase 3A by adding `packages/ens-identity/` with local ENS record constants, agent card validation, resolver interfaces, local/mock fixtures, explicit blocked/degraded issue codes, and `ens-local-fixture` claim level.
- Added `tests/ens-identity/` coverage for successful local resolution, agent card pointer resolution, policy URI/hash extraction, audit/latest/version extraction, missing records, policy hash mismatch, and no-live-claim behavior.
- Added Center CLI `identity status` in human-readable and parse-safe JSON modes, including wizard/landing exposure, while keeping identity discovery separate from authority approval.
- Added Phase 3A midpoint and closeout audits and routed the next implementation recommendation to Phase 2B live 0G closeout before Phase 3B live ENS binding.
- Split Phase 3 into Phase 3A local/mock ENS identity scaffold and Phase 3B live ENS binding, with Phase 3B gated on Phase 2B live 0G upload/readback/hash closeout evidence.
- Added `docs/roadmaps/phase-3-ens-agent-identity/IMPLEMENTATION_PLAN.md` covering 3A and 3B scope, claim levels, audit points, Center CLI expectations, validation, and deferred boundaries.
- Updated roadmap/current-state routing to allow Phase 3A to proceed while Phase 2B waits on local `.env` values, wallet credentials, live-write opt-in, and funded testnet tokens.
- Clarified Phase 2C as an optional 0G Compute advisory lane that does not block Phase 3A or 3B.

## 2026-04-28

- Completed Phase 2A locally by adding `packages/zerog-memory/` with a deterministic `local-adapter` memory/audit implementation, blocked/degraded storage results, hash validation, audit-bundle rollup, focused tests, and Center CLI `memory status`, `memory check`, and `memory audit-bundle` commands.
- Added the Phase 2A closeout audit with exact validation evidence and routed the next implementation target to Phase 2B live 0G Storage integration behind the same interfaces.
- Added Phase 2B readiness wiring with `.env.example`, ignored local env files, official 0G SDK dependency wiring, live config/preflight checks, and `memory live-status` CLI output that fails closed until credentials, tokens, and live write/read evidence exist.
- Updated phase planning, execution prompt, and audit templates to require Center CLI phases to account for direct human commands, agent JSON commands, and the bare `npm run clearintent` guided wizard journey.
- Added the Phase 2A midpoint audit for the local 0G policy memory and audit scaffold, documenting `local-adapter` as the target claim level, leaving Center CLI memory command evidence as placeholders, and explicitly making no live 0G usage claim.
- Updated Phase 2A routing docs to keep Phase 2B as the live 0G Storage backend replacement and require final local write/read/hash/audit-bundle evidence before closeout.
- Updated `docs/FILE_TREE.md` for the new Phase 2A audit artifact and current observed local 0G memory scaffold files.

## 2026-04-27

- Tightened Phase 2A acceptance criteria around SDK-shaped local 0G memory semantics, dual human/JSON CLI output, visually distinct degraded-state reporting, and end-to-end CLI tests before live 0G replacement in Phase 2B.
- Updated `REPO_PROFILE.json` to authorize Phase 2A local `packages/zerog-memory/` scaffolding while keeping live 0G provider integration deferred to Phase 2B.
- Clarified the two risk-tolerance lanes for ClearIntent: default full human-in-the-loop review on every transaction, and optional power-user conditional autonomy with threshold-triggered human intervention while preserving per-transaction audit/replay evidence.
- Added roadmap scope for conditional human-review gates: routine autonomous actions can remain automatic inside policy bounds, while thresholded or degraded actions escalate to visible human approval before signing or execution.
- Documented the Phase 6 Next.js Agent Audit dashboard as the wallet-gated human proof surface for the Guardian Agent demo, with Reown authentication, ENS/0G/Alchemy/onchain/KeeperHub evidence reads, and no traditional database authority source.
- Split Phase 2 planning into Phase 2A local policy memory/audit scaffold, Phase 2B live 0G Storage integration, and deferred Phase 2C 0G Compute risk/reflection.
- Added `docs/roadmaps/phase-2-zerog-policy-memory-audit/IMPLEMENTATION_PLAN.md` with artifact strategy, claim levels, stop conditions, and closeout requirements.
- Expanded 0G provider routing to include the recommended Storage Web, Compute TypeScript, Deployment Scripts, and Agentic ID starter/example repositories, with an explicit starter-kit posture.
- Completed Phase 1.5 by adding `packages/center-cli/` with fixture-backed `center status`, `center inspect`, `intent validate`, `intent state`, `authority evaluate`, `module list`, and `module doctor` command routing over `packages/core`.
- Added Center CLI tests for command routing, human-readable output, deterministic JSON output, missing-evidence fail-closed behavior, authority evaluation issue codes, module doctor deferred-adapter reporting, fixture-scope metadata, and the bare CLI landing path.
- Added a no-dependency human Center menu for bare `npm run clearintent` in interactive terminals, while preserving explicit command/`--json` usage for AI-readable automation.
- Added the `center-cli-operator` repo-local skill and `npm run validate:center-cli` shell validation so future agents can operate the Center CLI through explicit human and AI lanes without blurring command success and authority state.
- Added Phase 1.5 midpoint and closeout audits, updated roadmap/current-state routing, and documented that provider adapter work may start next only through the Center/core boundary.
- Added `docs/providers/Wallets/` as the signer strategy center with software wallet, WalletConnect, hardware wallet, smart-account, and generic standards subtrees.
- Reframed ClearIntent signing posture around wallet-neutral signer adapters, clear-signing-ready EIP-712 intents, ClearIntent human-readable approval metadata, and wallet capability levels.
- Updated roadmap, architecture, provider, and hackathon demo docs to treat software wallets and WalletConnect as first-class paths while keeping official secure-screen Clear Signing as wallet/vendor-specific proof.
- Normalized wallet provider docs into per-wallet folders with GitHub maps for MetaMask, Rabby, Coinbase Wallet, Rainbow, WalletConnect, Trust Wallet, Tangem, Trezor, Safe, Base Account, and Privy.
- Removed stale duplicate `DECISIONS 2.md`, `ROADMAP 2.md`, and `docs/FILE_TREE 2.md`; moved wallet demo strategy from providers to hackathon ownership.

## 2026-04-26

- Started Phase 1C by adding `packages/core/` with schema-backed contract validation, lifecycle transition helpers, lifecycle status/missing-evidence inspection, deterministic hashing, fail-closed authority verification, and focused `tests/core/` coverage.
- Added `packages/core/API.md` to define the callable core API and avoid HTTP `GET`/`POST` ambiguity before CLI, webhook, or service wrappers exist.
- Completed Phase 1C with additional fail-closed semantic checks for nonce, policy deadline window, value limit, risk decision/severity, human review, signature, lifecycle evidence mismatch, a closeout audit, and a Phase 1D fresh-session handoff prompt.
- Expanded the Phase 1D handoff prompt and `packages/core/API.md` with explicit completion criteria and the target core state snapshot API.
- Completed Phase 1D by adding the `deriveCoreStateSnapshot` API with evidence summaries, next-action codes, degraded-signal visibility, terminal-state handling, tests, and closeout routing.
- Completed Phase 1E by adding `evaluateCoreAuthority`, stable public API guidance, and module-facing tests that compose state snapshots, lifecycle advancement, and authority verification.
- Completed Phase 1F by closing the contract/core stability handoff and routing the next implementation target to a Phase 1.5 Center CLI skeleton over `packages/core`.
- Added the Phase 1.5 Center CLI skeleton roadmap package with rationale, human/AI readability layering, implementation plan, and execution prompt.
- Added implementation-facing repo-local skills for roadmap phase planning, feature implementation, contract fixture authoring, adapter scaffolding, repo doc routing, hackathon submission auditing, and pre-commit quality gates.
- Added explicit repo-local skill discovery and maintenance guidance to `AGENTS.md`, root `README.md`, and `skills/README.md`.
- Modernized root repo-local skills with YAML frontmatter, clearer trigger descriptions, skill-local templates, and a `core-enforcement` skill for the planned `packages/core/` implementation layer.
- Converted root `ROADMAP.md` and `DECISIONS.md` into high-visibility indexes, moved detailed roadmap scope into `docs/roadmaps/ROADMAP.md`, and split durable decisions into dated logs under `docs/decisions/`.
- Moved top-level architecture and repo-boundary docs into `docs/architecture/`, moved repo-local skill templates to root `skills/`, and updated scaffold routing/validation references.
- Added a machine-readable `REPO_PROFILE.json`, scaffold validation command, agent start guide, repo-local skill templates, handoff templates, minimal GitHub hygiene, and docs routing for agent-friendly onboarding.
- Hardened the Phase 1B package and documentation baseline with a first-class `npm run typecheck` script, clearer install and validation instructions, explicit `tests/` quality-gate expectations, and updated Phase 1 routing toward `packages/core/`.
- Added a contract/core stability handoff governance doc and reusable scaffold prompt so future projects can establish canonical truth, executable core enforcement, and local quality gates before adapter or demo work.

## 2026-04-25

- Added initial ClearIntent governance and documentation scaffold.
- Added root README, AGENTS, architecture, repository boundaries, roadmap, decisions, changelog, contribution, and AI usage docs.
- Added `.claude/` bootstrap folder pointing Claude to `AGENTS.md` as the canonical operating guide.
- Added docs index under `docs/README.md`.
- Added repo-truth docs for THC methodology, ClearIntent-specific THC mapping, source material, operating doctrine, and truth boundaries.
- Added governance docs for audit philosophy, multi-agent workflow, worktree governance, code quality standards, phase cadence, and open-source posture.
- Added hackathon docs for objective, rules, vendor-track eligibility, judging strategy, demo plan, and submission checklist.
- Added feature-level roadmap files with dependencies and subphases.
- Added reusable phase, audit, and execution prompt templates.
- Added provider documentation funnels for 0G, ENS, KeeperHub, and Ledger under `docs/providers/`, plus a repo-truth provider source intake note.
- Added Phase 1A contract authority baseline under `contracts/`, including lifecycle docs, JSON schemas, fixtures, and directive updates requiring agents to treat `contracts/` as canonical authority truth.
- Added Phase 1B repo-local TypeScript contract validation tooling with `npm run validate:contracts`, Vitest contract tests, shared `tests/` quality-gate docs, and a closeout audit.
