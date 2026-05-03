import { runCenterCommand } from "./commands";
import { renderHuman } from "./output";

type WizardItem = {
  label: string;
  description: string;
  args: string[];
};

const wizardItems: WizardItem[] = [
  {
    label: "Local operator setup",
    description: "Create external-secrets and .clearintent workspace scaffolding without writing private keys.",
    args: ["setup", "local-operator"]
  },
  {
    label: "Agent context",
    description: "Show the custody, policy, audit, and KeeperHub context an agent must inspect before acting.",
    args: ["agent", "context"]
  },
  {
    label: "Center status",
    description: "Show the default fixture-backed lifecycle summary.",
    args: ["center", "status"]
  },
  {
    label: "Center inspect",
    description: "Show the full fixture-backed lifecycle snapshot.",
    args: ["center", "inspect"]
  },
  {
    label: "Intent validate",
    description: "Validate fixture payloads against canonical contracts.",
    args: ["intent", "validate"]
  },
  {
    label: "Intent state",
    description: "Inspect missing evidence and next action.",
    args: ["intent", "state"]
  },
  {
    label: "Intent create",
    description: "Draft a local ClearIntent payload without authority approval.",
    args: ["intent", "create"]
  },
  {
    label: "Intent evaluate",
    description: "Evaluate the latest local intent draft and block mismatched policy/context.",
    args: ["intent", "evaluate"]
  },
  {
    label: "Intent submit",
    description: "Require an approved evaluation before the executor handoff.",
    args: ["intent", "submit"]
  },
  {
    label: "Intent execute",
    description: "Fail closed unless a configured executor adapter has recorded required evidence.",
    args: ["intent", "execute"]
  },
  {
    label: "Authority evaluate",
    description: "Run core authority evaluation for the fixture.",
    args: ["authority", "evaluate"]
  },
  {
    label: "Local layer test",
    description: "Run aggregate local tests for contracts, core, memory, identity, execution, signer, metadata, and cross-layer posture.",
    args: ["test", "local"]
  },
  {
    label: "Credential safety",
    description: "Check local .env and live-provider credential posture without printing secrets.",
    args: ["credentials", "status"]
  },
  {
    label: "Identity status",
    description: "Inspect the Phase 3A ENS identity fixture route.",
    args: ["identity", "status"]
  },
  {
    label: "Identity live status",
    description: "Inspect the Phase 3B live ENS read route.",
    args: ["identity", "live-status"]
  },
  {
    label: "Execution status",
    description: "Inspect the Phase 4A KeeperHub local execution fixture route.",
    args: ["execution", "status"]
  },
  {
    label: "KeeperHub live status",
    description: "Inspect the Phase 4B KeeperHub live readiness route without submitting execution.",
    args: ["keeperhub", "live-status"]
  },
  {
    label: "KeeperHub live run status",
    description: "Inspect a submitted KeeperHub execution status and logs without submitting another run.",
    args: ["keeperhub", "live-run-status"]
  },
  {
    label: "Signer status",
    description: "Inspect local signer fixture, typed-data, and metadata claim posture.",
    args: ["signer", "status"]
  },
  {
    label: "Signer preview",
    description: "Inspect the local ClearIntent approval preview route.",
    args: ["signer", "preview"]
  },
  {
    label: "Signer metadata",
    description: "Inspect the local ERC-7730/Clear Signing metadata route.",
    args: ["signer", "metadata"]
  },
  {
    label: "Module doctor",
    description: "Check local module readiness and deferred adapters.",
    args: ["module", "doctor"]
  }
];

export function renderLanding(): string {
  return [
    "ClearIntent Center",
    "",
    "Human lane:",
    "  npm run clearintent",
    "  Opens an interactive terminal menu when run in a TTY.",
    "",
    "AI lane:",
    "  npm run --silent clearintent -- setup local-operator --json",
    "  npm run --silent clearintent -- agent context --json",
    "  npm run --silent clearintent -- center inspect --json",
    "  npm run --silent clearintent -- intent create --json",
    "  npm run --silent clearintent -- intent evaluate --json",
    "  npm run --silent clearintent -- identity status --json",
    "  npm run --silent clearintent -- identity live-status --json",
    "  npm run --silent clearintent -- execution status --json",
    "  npm run --silent clearintent -- keeperhub live-status --json",
    "  npm run --silent clearintent -- keeperhub live-run-status --json",
    "  npm run --silent clearintent -- signer status --json",
    "  npm run --silent clearintent -- test local --json",
    "  npm run --silent clearintent -- credentials status --json",
    "  Emits deterministic JSON with no CLI prose.",
    "",
    "Common commands:",
    ...wizardItems.map((item) => `  npm run clearintent -- ${item.args.join(" ")}  # ${item.description}`),
    "",
    "Current mode: fixture-only",
    "Fixture source: contracts/examples/",
    "Live providers: disabled"
  ].join("\n");
}

export async function runInteractiveWizard(): Promise<void> {
  const input = process.stdin;
  const output = process.stdout;
  let selected = 0;

  const render = (): void => {
    output.write("\x1Bc");
    output.write("ClearIntent Center\n\n");
    output.write("Use arrow keys, Enter, or Space. Press q to exit.\n\n");
    for (let index = 0; index < wizardItems.length; index += 1) {
      const item = wizardItems[index];
      const marker = index === selected ? ">" : " ";
      output.write(`${marker} ${item.label}\n`);
      output.write(`  ${item.description}\n`);
    }
    output.write("\nMode: fixture-only\nSource: contracts/examples/\nLive providers: disabled\n");
  };

  const pause = async (): Promise<void> =>
    new Promise((resolve) => {
      const onData = (): void => {
        input.off("data", onData);
        resolve();
      };
      input.on("data", onData);
    });

  const select = async (): Promise<void> => {
    output.write("\x1Bc");
    const result = await runCenterCommand(wizardItems[selected].args);
    output.write(`${renderHuman(result)}\n\n`);
    output.write("Press any key to return to the Center menu.");
    await pause();
  };

  input.setRawMode(true);
  input.resume();
  input.setEncoding("utf8");

  try {
    let running = true;
    while (running) {
      render();
      const key = await new Promise<string>((resolve) => input.once("data", resolve));
      if (key === "\u0003" || key === "q") {
        running = false;
      } else if (key === "\u001B[A") {
        selected = selected === 0 ? wizardItems.length - 1 : selected - 1;
      } else if (key === "\u001B[B") {
        selected = selected === wizardItems.length - 1 ? 0 : selected + 1;
      } else if (key === "\r" || key === " ") {
        await select();
      }
    }
  } finally {
    input.setRawMode(false);
    input.pause();
    output.write("\n");
  }
}
