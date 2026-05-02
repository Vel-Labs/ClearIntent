import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const envFiles = [".env", ".env.local"];
const configFile = "clearintent.config.json";
const defaultSecretsFile = "~/.clearintent/clearintent.secrets.env";
const secretsFileEnvKey = "CLEARINTENT_SECRETS_FILE";

type ClearIntentConfig = {
  operatorSecretsFile?: string;
  operatorSecretsFileEnv?: string;
};

export function loadLocalEnv(cwd = process.cwd()): void {
  for (const file of envFiles) {
    const absolutePath = path.join(cwd, file);
    if (!existsSync(absolutePath)) {
      continue;
    }
    loadEnvFile(absolutePath);
  }

  const secretsPath = getOperatorSecretsFilePath(cwd);
  if (secretsPath !== undefined && existsSync(secretsPath)) {
    loadEnvFile(secretsPath);
  }
}

export function getOperatorSecretsFilePath(cwd = process.cwd(), env: NodeJS.ProcessEnv = process.env): string | undefined {
  const config = readConfig(cwd);
  const envKey = config.operatorSecretsFileEnv ?? secretsFileEnvKey;
  const overridePath = nonEmpty(env[envKey]);
  const configuredPath = overridePath ?? nonEmpty(config.operatorSecretsFile) ?? defaultSecretsFile;
  return configuredPath === undefined ? undefined : resolveOperatorPath(configuredPath);
}

function loadEnvFile(absolutePath: string): void {
  const content = readFileSync(absolutePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
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
    if (key.length > 0 && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function unquote(value: string): string {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function readConfig(cwd: string): ClearIntentConfig {
  const absolutePath = path.join(cwd, configFile);
  if (!existsSync(absolutePath)) {
    return {};
  }
  try {
    return JSON.parse(readFileSync(absolutePath, "utf8")) as ClearIntentConfig;
  } catch {
    return {};
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

function nonEmpty(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed.length === 0 ? undefined : trimmed;
}
