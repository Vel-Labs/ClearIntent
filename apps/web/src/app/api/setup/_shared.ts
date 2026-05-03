import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

export type JsonResult = { ok: true; value: Record<string, unknown> } | { ok: false; response: Response };

export function loadSetupEnv(): NodeJS.ProcessEnv {
  const repoRoot = findRepoRoot(process.cwd());
  const env = { ...process.env };

  Object.assign(env, readEnvFile(path.join(repoRoot, ".env")));
  Object.assign(env, readEnvFile(path.join(repoRoot, ".env.local")));

  const secretsPath = resolveOperatorPath(
    env.CLEARINTENT_SECRETS_FILE || readConfiguredSecretsPath(repoRoot) || "~/.clearintent/clearintent.secrets.env"
  );
  Object.assign(env, readEnvFile(secretsPath));

  return env;
}

export async function parseJsonObject(request: Request): Promise<JsonResult> {
  try {
    const value = (await request.json()) as unknown;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return { ok: true, value: value as Record<string, unknown> };
    }
    return { ok: false, response: json({ error: "Request body must be a JSON object." }, 400) };
  } catch {
    return { ok: false, response: json({ error: "Request body must be valid JSON." }, 400) };
  }
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

export function stringField(input: Record<string, unknown>, key: string): string | undefined {
  const value = input[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function findRepoRoot(start: string): string {
  let current = start;
  for (;;) {
    if (existsSync(path.join(current, "contracts")) && existsSync(path.join(current, "packages"))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return start;
    }
    current = parent;
  }
}

function readEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) {
    return {};
  }

  const parsed: Record<string, string> = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) {
      continue;
    }
    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }
    const key = trimmed.slice(0, separator).trim();
    const value = unquote(trimmed.slice(separator + 1).trim());
    if (key.length > 0) {
      parsed[key] = value;
    }
  }
  return parsed;
}

function readConfiguredSecretsPath(repoRoot: string): string | undefined {
  const configPath = path.join(repoRoot, "clearintent.config.json");
  if (!existsSync(configPath)) {
    return undefined;
  }

  try {
    const config = JSON.parse(readFileSync(configPath, "utf8")) as { operatorSecretsFile?: string };
    return config.operatorSecretsFile;
  } catch {
    return undefined;
  }
}

function resolveOperatorPath(filePath: string): string {
  if (filePath === "~") {
    return homedir();
  }
  if (filePath.startsWith("~/")) {
    return path.join(homedir(), filePath.slice(2));
  }
  return path.resolve(filePath);
}

function unquote(value: string): string {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}
