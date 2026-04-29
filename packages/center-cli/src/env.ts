import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const envFiles = [".env", ".env.local"];

export function loadLocalEnv(cwd = process.cwd()): void {
  for (const file of envFiles) {
    const absolutePath = path.join(cwd, file);
    if (!existsSync(absolutePath)) {
      continue;
    }
    loadEnvFile(absolutePath);
  }
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
