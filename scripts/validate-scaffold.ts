import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

type RepoProfile = {
  canonicalPaths: Record<string, string>;
  readFirstFiles: string[];
  commands: Record<string, string>;
  governanceLockedPaths: string[];
  forbiddenEarlyScopeDirectories: string[];
  importantSourceDirectories: string[];
  importantDocsDirectories: string[];
  knownQualityGates: string[];
  allowedTemplatePlaceholders: string[];
};

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const profilePath = path.join(repoRoot, "REPO_PROFILE.json");
const packageJsonPath = path.join(repoRoot, "package.json");
const fileTreePath = path.join(repoRoot, "docs", "FILE_TREE.md");
const placeholderScanRoots = ["docs/templates", "docs/agent-skills"];
const ignoredTreeDirs = new Set([".git", "node_modules"]);

const npmBuiltinCommands = new Set(["npm install", "npm ci", "npm test"]);

async function main(): Promise<void> {
  const failures: string[] = [];
  const profile = await loadJson<RepoProfile>(profilePath);
  const packageJson = await loadJson<{ scripts?: Record<string, string> }>(packageJsonPath);
  const packageScripts = packageJson.scripts ?? {};

  await assertPathsExist("canonicalPaths", Object.values(profile.canonicalPaths), failures);
  await assertPathsExist("readFirstFiles", profile.readFirstFiles, failures);
  await assertPathsExist("governanceLockedPaths", profile.governanceLockedPaths, failures);
  await assertPathsExist("importantSourceDirectories", profile.importantSourceDirectories, failures);
  await assertPathsExist("importantDocsDirectories", profile.importantDocsDirectories, failures);
  assertCommandsResolve(profile.commands, packageScripts, failures);
  assertKnownQualityGatesResolve(profile.knownQualityGates, packageScripts, failures);
  await assertForbiddenDirectoriesAbsent(profile.forbiddenEarlyScopeDirectories, failures);
  await assertFileTreeCurrent(failures);
  await assertPlaceholdersRegistered(profile.allowedTemplatePlaceholders, failures);

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`FAIL ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("PASS scaffold profile paths exist");
  console.log("PASS profile commands resolve to package scripts or npm builtins");
  console.log("PASS forbidden early-scope directories are absent");
  console.log("PASS docs/FILE_TREE.md is current for tracked scaffold files");
  console.log("PASS template placeholders are registered");
  console.log("scaffold validation ok");
}

async function loadJson<T>(absolutePath: string): Promise<T> {
  return JSON.parse(await readFile(absolutePath, "utf8")) as T;
}

async function assertPathsExist(label: string, paths: string[], failures: string[]): Promise<void> {
  for (const repoPath of paths) {
    if (!(await pathExists(repoPath))) {
      failures.push(`${label} path is missing: ${repoPath}`);
    }
  }
}

function assertCommandsResolve(
  commands: Record<string, string>,
  packageScripts: Record<string, string>,
  failures: string[]
): void {
  for (const [name, command] of Object.entries(commands)) {
    if (npmBuiltinCommands.has(command)) {
      continue;
    }
    const scriptName = npmRunScript(command);
    if (scriptName === undefined) {
      failures.push(`profile command ${name} is not an npm builtin or npm run script: ${command}`);
      continue;
    }
    if (packageScripts[scriptName] === undefined) {
      failures.push(`profile command ${name} references missing package script: ${scriptName}`);
    }
  }
}

function assertKnownQualityGatesResolve(gates: string[], packageScripts: Record<string, string>, failures: string[]): void {
  for (const gate of gates) {
    if (npmBuiltinCommands.has(gate)) {
      continue;
    }
    const scriptName = npmRunScript(gate);
    if (scriptName === undefined || packageScripts[scriptName] === undefined) {
      failures.push(`known quality gate does not resolve to a package script: ${gate}`);
    }
  }
}

function npmRunScript(command: string): string | undefined {
  const match = command.match(/^npm run ([A-Za-z0-9:_-]+)$/);
  return match?.[1];
}

async function assertForbiddenDirectoriesAbsent(paths: string[], failures: string[]): Promise<void> {
  for (const repoPath of paths) {
    if (await pathExists(repoPath)) {
      failures.push(`forbidden early-scope directory exists before roadmap handoff: ${repoPath}`);
    }
  }
}

async function assertFileTreeCurrent(failures: string[]): Promise<void> {
  const tree = await readFile(fileTreePath, "utf8");
  const documentedEntries = tree.match(/```text\n(?<entries>[\s\S]*?)\n```/)?.groups?.entries.split("\n").filter(Boolean) ?? [];
  const actualEntries = await listRepoFiles(".");

  const documented = new Set(documentedEntries);
  const actual = new Set(actualEntries);

  for (const entry of actualEntries) {
    if (!documented.has(entry)) {
      failures.push(`docs/FILE_TREE.md missing current entry: ${entry}`);
    }
  }
  for (const entry of documentedEntries) {
    if (!actual.has(entry)) {
      failures.push(`docs/FILE_TREE.md lists missing file: ${entry}`);
    }
  }
}

async function assertPlaceholdersRegistered(allowed: string[], failures: string[]): Promise<void> {
  const allowedSet = new Set(allowed);
  const markdownFiles = await listMarkdownFiles(placeholderScanRoots);
  const placeholderPattern = /<[^>\n]+>/g;

  for (const file of markdownFiles) {
    const content = await readFile(path.join(repoRoot, file), "utf8");
    const matches = content.match(placeholderPattern) ?? [];
    for (const placeholder of matches) {
      if (!allowedSet.has(placeholder)) {
        failures.push(`unregistered template placeholder ${placeholder} in ${file}`);
      }
    }
  }
}

async function listMarkdownFiles(roots: string[]): Promise<string[]> {
  const files: string[] = [];
  for (const root of roots) {
    if (!(await pathExists(root))) {
      continue;
    }
    await collectMarkdownFiles(root, files);
  }
  return files.sort();
}

async function collectMarkdownFiles(repoPath: string, files: string[]): Promise<void> {
  const absolutePath = path.join(repoRoot, repoPath);
  const entries = await readdir(absolutePath, { withFileTypes: true });
  for (const entry of entries) {
    const child = path.join(repoPath, entry.name);
    if (entry.isDirectory()) {
      await collectMarkdownFiles(child, files);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(child);
    }
  }
}

async function listRepoFiles(repoPath: string): Promise<string[]> {
  const files: string[] = [];
  await collectRepoFiles(repoPath, files);
  return files.sort();
}

async function collectRepoFiles(repoPath: string, files: string[]): Promise<void> {
  const absolutePath = path.join(repoRoot, repoPath);
  const entries = await readdir(absolutePath, { withFileTypes: true });
  for (const entry of entries) {
    if (ignoredTreeDirs.has(entry.name)) {
      continue;
    }
    const child = repoPath === "." ? entry.name : path.join(repoPath, entry.name);
    if (entry.isDirectory()) {
      await collectRepoFiles(child, files);
    } else if (entry.isFile()) {
      files.push(child);
    }
  }
}

async function pathExists(repoPath: string): Promise<boolean> {
  try {
    await stat(path.join(repoRoot, repoPath));
    return true;
  } catch {
    return false;
  }
}

void main();
