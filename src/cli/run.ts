import { parseArgs } from "./parse";
import { createOutputWriter } from "./output";
import pkg from "../../package.json";

export async function run(argv: string[]): Promise<number> {
  const parsed = parseArgs(argv);
  const writer = createOutputWriter(parsed.json);

  // Handle --version flag (takes precedence over subcommands)
  if (parsed.version) {
    if (parsed.json) {
      writer.json({ name: "fleet-e2e-toy", version: pkg.version });
    } else {
      writer.text(`fleet-e2e-toy v${pkg.version}`);
    }
    return 0;
  }

  // Placeholder default command — replaced by real dispatch in later phases
  if (parsed.json) {
    writer.json({ status: "ok", command: parsed.command ?? null, args: parsed.args });
  } else {
    const cmd = parsed.command ?? "(none)";
    writer.text(`fleet-e2e-toy: command=${cmd}`);
  }

  return 0;
}
