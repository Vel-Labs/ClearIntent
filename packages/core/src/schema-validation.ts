import Ajv2020, { type ErrorObject, type ValidateFunction } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ContractKind, CoreResult } from "./types";

const schemaFiles: Record<ContractKind, string> = {
  AgentIntent: "agent-intent.schema.json",
  AgentPolicy: "agent-policy.schema.json",
  RiskReport: "risk-report.schema.json",
  HumanReviewCheckpoint: "human-review-checkpoint.schema.json",
  ExecutionReceipt: "execution-receipt.schema.json",
  AuditBundle: "audit-bundle.schema.json"
};

export type ContractValidator = {
  validateContract: (kind: ContractKind, value: unknown) => CoreResult<unknown>;
};

export async function createContractValidator(options: { contractsDir?: string } = {}): Promise<ContractValidator> {
  const contractsDir = options.contractsDir ?? path.resolve(process.cwd(), "contracts");
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);

  const validators = new Map<ContractKind, ValidateFunction>();
  for (const [kind, file] of Object.entries(schemaFiles) as [ContractKind, string][]) {
    const schemaPath = path.join(contractsDir, "schemas", file);
    const schema = JSON.parse(await readFile(schemaPath, "utf8")) as Record<string, unknown>;
    ajv.addSchema(schema);
    const id = schema.$id;
    if (typeof id !== "string") {
      throw new Error(`Schema ${file} is missing $id`);
    }
    validators.set(kind, ajv.getSchema(id) ?? ajv.compile(schema));
  }

  return {
    validateContract(kind, value) {
      const validator = validators.get(kind);
      if (validator === undefined) {
        return {
          ok: false,
          issues: [{ code: "unknown_contract_kind", message: `No validator registered for ${kind}.` }]
        };
      }

      if (validator(value)) {
        return { ok: true, value, issues: [] };
      }

      return {
        ok: false,
        issues: formatAjvErrors(validator.errors).map((message) => ({
          code: "schema_validation_failed",
          message
        }))
      };
    }
  };
}

function formatAjvErrors(errors: ErrorObject[] | null | undefined): string[] {
  if (errors === undefined || errors === null || errors.length === 0) {
    return ["Unknown AJV validation error."];
  }
  return errors.map((error) => `${error.instancePath || "$"} ${error.message ?? "failed"}`);
}

