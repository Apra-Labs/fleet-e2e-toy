import * as fs from "fs";
import { parseArgs } from "./parse";
import { createOutputWriter } from "./output";
import { register } from "./tempfiles";
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

  // write <filename> — writes a file and registers it for SIGINT cleanup
  if (parsed.command === "write") {
    const filename = parsed.args[0];
    if (!filename) {
      writer.error("write requires a filename");
      return 1;
    }
    fs.writeFileSync(filename, "fleet-e2e-toy output\n");
    register(filename);
    writer.text("Wrote " + filename);
    writer.json({ command: "write", path: filename, status: "ok" });
    return 0;
  }

  // Default: no command or unknown command
  if (parsed.json) {
    writer.json({ status: "ok", command: parsed.command ?? null, args: parsed.args });
  } else {
    const cmd = parsed.command ?? "(none)";
    writer.text(`fleet-e2e-toy: command=${cmd}`);
  }

  return 0;
}
