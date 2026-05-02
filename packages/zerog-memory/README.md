# ClearIntent 0G Memory Adapter

Phase 2A implements a deterministic local adapter for policy memory and audit artifacts. It is shaped like a future 0G Storage integration, but it performs no live network calls and requires no credentials.

Current claim level: `local-adapter`.

Import from:

```ts
import {
  createLocalAuditStore,
  createLocalMemoryAdapter,
  runLocalMemoryDoctor
} from "./packages/zerog-memory/src";
```

The local adapter supports independent artifact writes, readback hash validation, and audit bundle generation for policy, intent, risk report, human review checkpoint, signature evidence, execution receipt, and audit bundle artifacts.

Missing artifacts and hash mismatches are blocked states. Missing live proof is reported as a degraded/local-only state until Phase 2B connects the same interface to real 0G write/read/proof behavior.

## Phase 2B Readiness

The package also exposes a live-readiness preflight for 0G Storage:

```ts
import { getZeroGLiveReadinessStatus, loadZeroGLiveConfig } from "./packages/zerog-memory/src";
```

The readiness layer checks env/config shape and SDK importability without uploading or downloading artifacts. It does not advance the claim level beyond `local-adapter`.

Use the Center CLI:

```bash
npm run --silent clearintent -- memory live-status
npm run --silent clearintent -- memory live-status --json
npm run --silent clearintent -- memory live-smoke
npm run --silent clearintent -- memory live-smoke --json
npm run --silent clearintent -- memory live-bindings
npm run --silent clearintent -- memory live-bindings --json
```

`memory live-bindings` uploads the demo policy, audit pointer, and agent-card artifacts, reads them back, and returns the exact ENS text-record values for `agent.card`, `policy.uri`, `policy.hash`, `audit.latest`, and `clearintent.version`. It uses `ENS_NAME` or `CLEARINTENT_ENS_NAME` for the identity name and `ZERO_G_WALLET_ADDRESS` as the controller address. `KEEPERHUB_EXECUTOR_ADDRESS` can be set before upload to bind a real executor; otherwise the command reports a degraded `keeperhub_executor_unbound` reason.

Set local credentials in `.env.local` using `.env.example` as the template. Never commit private keys or live run logs.
