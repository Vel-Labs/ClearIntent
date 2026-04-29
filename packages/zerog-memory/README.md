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
```

Set local credentials in `.env.local` using `.env.example` as the template. Never commit private keys or live run logs.
