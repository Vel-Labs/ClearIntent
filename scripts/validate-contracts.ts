import Ajv2020, { type ErrorObject, type ValidateFunction } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const FIXED_TEST_CLOCK = "2026-04-26T00:00:00Z";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const schemasDir = path.join(repoRoot, "contracts", "schemas");
const examplesDir = path.join(repoRoot, "contracts", "examples");

const validFixtureSchemas: Record<string, string> = {
  "valid-agent-intent.json": "AgentIntent",
  "valid-agent-policy.json": "AgentPolicy",
  "valid-risk-report.json": "RiskReport",
  "valid-human-review-checkpoint.json": "HumanReviewCheckpoint",
  "valid-execution-receipt.json": "ExecutionReceipt",
  "valid-audit-bundle.json": "AuditBundle"
};

type ContractJson = Record<string, unknown>;

export type ContractValidationResult = {
  ok: boolean;
  lines: string[];
};

export type ContractCorpus = {
  schemas: Map<string, ContractJson>;
  examples: Map<string, ContractJson>;
};

export async function loadContractCorpus(): Promise<ContractCorpus> {
  return {
    schemas: await loadJsonFiles(schemasDir, ".schema.json"),
    examples: await loadJsonFiles(examplesDir, ".json")
  };
}

export function createAjv(): Ajv2020 {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  return ajv;
}

export function schemaTitleForFixture(fixtureName: string): string | undefined {
  return validFixtureSchemas[fixtureName];
}

export function validateContracts(corpus: ContractCorpus): ContractValidationResult {
  const lines: string[] = [];
  const failures: string[] = [];
  const validators = compileSchemas(corpus.schemas);

  const validFixtureNames = [...corpus.examples.keys()].filter((fixtureName) => fixtureName.startsWith("valid-")).sort();
  for (const fixtureName of validFixtureNames) {
    const schemaTitle = validFixtureSchemas[fixtureName];
    if (schemaTitle === undefined) {
      fail(failures, lines, `schema ${fixtureName}`, "fixture has no intended schema mapping");
      continue;
    }
    const fixture = requireExample(corpus, fixtureName);
    const validator = requireValidator(validators, schemaTitle);
    if (validator(fixture)) {
      lines.push(`PASS schema ${fixtureName} -> ${schemaTitle}`);
    } else {
      fail(failures, lines, `schema ${fixtureName} -> ${schemaTitle}`, formatAjvErrors(validator.errors));
    }
  }

  const intentValidator = requireValidator(validators, "AgentIntent");
  const missingPolicy = requireExample(corpus, "invalid-missing-policy.json");
  if (!intentValidator(missingPolicy)) {
    lines.push("PASS invalid-missing-policy.json rejected by AgentIntent schema");
  } else {
    fail(failures, lines, "invalid-missing-policy.json schema rejection", "fixture unexpectedly passed AgentIntent schema");
  }

  const expiredDeadline = requireExample(corpus, "invalid-expired-deadline.json");
  const expiredMessage = assertExpiredDeadline(expiredDeadline, FIXED_TEST_CLOCK);
  if (expiredMessage === undefined) {
    lines.push(`PASS invalid-expired-deadline.json expired before fixed clock ${FIXED_TEST_CLOCK}`);
  } else {
    fail(failures, lines, "invalid-expired-deadline.json semantic expiry", expiredMessage);
  }

  const policyMismatch = requireExample(corpus, "invalid-policy-hash.json");
  const policy = requireExample(corpus, "valid-agent-policy.json");
  const mismatchMessage = assertPolicyHashMismatch(policyMismatch, policy);
  if (mismatchMessage === undefined) {
    lines.push("PASS invalid-policy-hash.json does not match valid-agent-policy.json");
  } else {
    fail(failures, lines, "invalid-policy-hash.json semantic mismatch", mismatchMessage);
  }

  const intent = requireExample(corpus, "valid-agent-intent.json");
  const humanReview = requireExample(corpus, "valid-human-review-checkpoint.json");
  const reviewMessage = assertHumanReviewBindsIntent(humanReview, intent);
  if (reviewMessage === undefined) {
    lines.push("PASS valid-human-review-checkpoint.json binds valid-agent-intent.json intent hash");
  } else {
    fail(failures, lines, "human review intent hash binding", reviewMessage);
  }

  const auditBundle = requireExample(corpus, "valid-audit-bundle.json");
  const auditMessage = assertAuditBundleBindsIntentAndPolicy(auditBundle, intent, policy);
  if (auditMessage === undefined) {
    lines.push("PASS valid-audit-bundle.json binds valid intent and policy hashes");
  } else {
    fail(failures, lines, "audit bundle hash binding", auditMessage);
  }

  if (failures.length === 0) {
    lines.push("contract validation ok");
  }

  return { ok: failures.length === 0, lines };
}

export function compileSchemas(schemas: Map<string, ContractJson>): Map<string, ValidateFunction> {
  const ajv = createAjv();
  const validators = new Map<string, ValidateFunction>();

  for (const schema of schemas.values()) {
    ajv.addSchema(schema);
  }

  for (const schema of schemas.values()) {
    const title = stringField(schema, "title");
    const id = stringField(schema, "$id");
    const validator = ajv.getSchema(id) ?? ajv.compile(schema);
    validators.set(title, validator);
  }

  return validators;
}

export function assertExpiredDeadline(intent: ContractJson, fixedClock: string): string | undefined {
  const deadline = nestedString(intent, ["authority", "deadline"]);
  const deadlineTime = Date.parse(deadline);
  const clockTime = Date.parse(fixedClock);

  if (!Number.isFinite(deadlineTime)) {
    return `authority.deadline is not parseable: ${deadline}`;
  }
  if (!Number.isFinite(clockTime)) {
    return `fixed clock is not parseable: ${fixedClock}`;
  }
  if (deadlineTime >= clockTime) {
    return `deadline ${deadline} is not before fixed clock ${fixedClock}`;
  }
  return undefined;
}

export function assertPolicyHashMismatch(intent: ContractJson, policy: ContractJson): string | undefined {
  const intentPolicyHash = nestedString(intent, ["policy", "policyHash"]);
  const loadedPolicyHash = stringField(policy, "policyHash");

  if (intentPolicyHash === loadedPolicyHash) {
    return `intent policy hash ${intentPolicyHash} unexpectedly matches loaded policy hash`;
  }
  return undefined;
}

export function assertHumanReviewBindsIntent(review: ContractJson, intent: ContractJson): string | undefined {
  const approvedIntentHash = stringField(review, "approvedIntentHash");
  const intentHash = nestedString(intent, ["hashes", "intentHash"]);

  if (approvedIntentHash !== intentHash) {
    return `review approvedIntentHash ${approvedIntentHash} does not match intent hash ${intentHash}`;
  }
  return undefined;
}

export function assertAuditBundleBindsIntentAndPolicy(
  auditBundle: ContractJson,
  intent: ContractJson,
  policy: ContractJson
): string | undefined {
  const bundleIntentHash = stringField(auditBundle, "intentHash");
  const bundlePolicyHash = stringField(auditBundle, "policyHash");
  const artifactIntentHash = nestedString(auditBundle, ["artifacts", "intent", "hash"]);
  const artifactPolicyHash = nestedString(auditBundle, ["artifacts", "policy", "hash"]);
  const intentHash = nestedString(intent, ["hashes", "intentHash"]);
  const policyHash = stringField(policy, "policyHash");

  if (bundleIntentHash !== intentHash) {
    return `bundle intentHash ${bundleIntentHash} does not match intent hash ${intentHash}`;
  }
  if (artifactIntentHash !== intentHash) {
    return `bundle artifacts.intent.hash ${artifactIntentHash} does not match intent hash ${intentHash}`;
  }
  if (bundlePolicyHash !== policyHash) {
    return `bundle policyHash ${bundlePolicyHash} does not match policy hash ${policyHash}`;
  }
  if (artifactPolicyHash !== policyHash) {
    return `bundle artifacts.policy.hash ${artifactPolicyHash} does not match policy hash ${policyHash}`;
  }
  return undefined;
}

async function loadJsonFiles(directory: string, suffix: string): Promise<Map<string, ContractJson>> {
  const files = (await readdir(directory)).filter((file) => file.endsWith(suffix)).sort();
  const loaded = new Map<string, ContractJson>();

  for (const file of files) {
    const raw = await readFile(path.join(directory, file), "utf8");
    loaded.set(file, JSON.parse(raw) as ContractJson);
  }

  return loaded;
}

function requireExample(corpus: ContractCorpus, fixtureName: string): ContractJson {
  const fixture = corpus.examples.get(fixtureName);
  if (fixture === undefined) {
    throw new Error(`Missing contract fixture: ${fixtureName}`);
  }
  return fixture;
}

function requireValidator(validators: Map<string, ValidateFunction>, schemaTitle: string): ValidateFunction {
  const validator = validators.get(schemaTitle);
  if (validator === undefined) {
    throw new Error(`Missing compiled schema validator: ${schemaTitle}`);
  }
  return validator;
}

function stringField(value: ContractJson, field: string): string {
  const result = value[field];
  if (typeof result !== "string") {
    throw new Error(`Expected string field ${field}`);
  }
  return result;
}

function nestedString(value: ContractJson, pathParts: string[]): string {
  let current: unknown = value;
  for (const pathPart of pathParts) {
    if (typeof current !== "object" || current === null || !(pathPart in current)) {
      throw new Error(`Expected nested string field ${pathParts.join(".")}`);
    }
    current = (current as Record<string, unknown>)[pathPart];
  }
  if (typeof current !== "string") {
    throw new Error(`Expected nested string field ${pathParts.join(".")}`);
  }
  return current;
}

function fail(failures: string[], lines: string[], label: string, detail: string): void {
  const message = `${label}: ${detail}`;
  failures.push(message);
  lines.push(`FAIL ${message}`);
}

function formatAjvErrors(errors: ErrorObject[] | null | undefined): string {
  if (errors === undefined || errors === null || errors.length === 0) {
    return "unknown AJV validation error";
  }
  return errors.map((error) => `${error.instancePath || "$"} ${error.message ?? "failed"}`).join("; ");
}

async function main(): Promise<void> {
  const result = validateContracts(await loadContractCorpus());
  for (const line of result.lines) {
    console.log(line);
  }
  if (!result.ok) {
    process.exitCode = 1;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
