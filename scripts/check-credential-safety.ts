import { getCredentialSafetyStatus } from "../packages/center-cli/src/credential-safety";
import { loadLocalEnv } from "../packages/center-cli/src/env";
import { stableStringify } from "../packages/core/src";

loadLocalEnv();

const status = getCredentialSafetyStatus();

console.log(
  stableStringify({
    commandOk: true,
    ok: status.ok,
    liveReady: status.liveReady,
    liveWritesEnabled: status.liveWritesEnabled,
    secretsPrinted: status.secretsPrinted,
    checks: status.checks,
    blockingReasons: status.blockingReasons,
    warnings: status.warnings,
    nextActions: status.nextActions
  })
);

process.exitCode = status.ok ? 0 : 1;
