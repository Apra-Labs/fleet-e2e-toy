import { parseArgs } from "./parse";
import { createOutputWriter } from "./output";

export async function run(argv: string[]): Promise<number> {
  const parsed = parseArgs(argv);
  const writer = createOutputWriter(parsed.json);

  // Placeholder default command — replaced by real dispatch in later phases
  if (parsed.json) {
    writer.json({ status: "ok", command: parsed.command ?? null, args: parsed.args });
  } else {
    const cmd = parsed.command ?? "(none)";
    writer.text(`fleet-e2e-toy: command=${cmd}`);
  }

  return 0;
}
