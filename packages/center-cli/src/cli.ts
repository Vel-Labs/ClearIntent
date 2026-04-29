#!/usr/bin/env node
import { parseArgs, runCenterCommand } from "./commands";
import { loadLocalEnv } from "./env";
import { renderHuman, renderJson } from "./output";
import { renderLanding, runInteractiveWizard } from "./wizard";

export async function runCli(args: string[] = process.argv.slice(2)): Promise<{ exitCode: number; stdout: string }> {
  try {
    loadLocalEnv();

    if (args.length === 0) {
      return {
        exitCode: 0,
        stdout: renderLanding()
      };
    }

    const parsed = parseArgs(args);
    const result = await runCenterCommand(args);
    return {
      exitCode: result.command === "unknown" ? 1 : 0,
      stdout: parsed.options.json ? renderJson(result) : renderHuman(result)
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const result = {
      command: "error",
      ok: false,
      commandOk: false,
      authorityOk: false,
      summary: message,
      data: {},
      issues: [{ code: "cli_error", message }]
    };
    return {
      exitCode: 1,
      stdout: args.includes("--json") ? renderJson(result) : renderHuman(result)
    };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.length === 2 && process.stdin.isTTY && process.stdout.isTTY) {
    await runInteractiveWizard();
  } else {
    const result = await runCli();
    console.log(result.stdout);
    process.exitCode = result.exitCode;
  }
}
