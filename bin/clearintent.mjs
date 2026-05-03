#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const binDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(binDirectory, "..");
const cliPath = path.join(repoRoot, "packages", "center-cli", "src", "cli.ts");
const require = createRequire(import.meta.url);
const tsxLoader = require.resolve("tsx");

const result = spawnSync(process.execPath, ["--import", tsxLoader, cliPath, ...process.argv.slice(2)], {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit"
});

process.exitCode = result.status ?? 1;
