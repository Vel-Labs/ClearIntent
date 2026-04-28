import { runCenterCommand } from "./commands";
import { renderHuman } from "./output";

type WizardItem = {
  label: string;
  description: string;
  args: string[];
};

const wizardItems: WizardItem[] = [
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
    label: "Authority evaluate",
    description: "Run core authority evaluation for the fixture.",
    args: ["authority", "evaluate"]
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
    "  npm run --silent clearintent -- center inspect --json",
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
