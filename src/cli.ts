#!/usr/bin/env node
import { validateNonBlank } from "./utils/validation";

const VERSION = "fleet-e2e-toy v1.0.0";
const HELP_TEXT = [
  "Usage: fleet-e2e-toy [command|flags] [args...]",
  "",
  "Commands:",
  "  help                  Show this help text",
  "",
  "Flags:",
  "  --version, -v         Print the CLI version and exit",
  "  --help, -h            Show this help text and exit",
].join("\n");

function main(argv: string[]): number {
  // Precedence (D3):
  if (argv.includes("--version") || argv.includes("-v")) {
    console.log(VERSION);
    return 0;
  }
  if (argv.includes("help") || argv.includes("--help") || argv.includes("-h")) {
    console.log(HELP_TEXT);
    return 0;
  }
  const positionals = argv.filter((a) => !a.startsWith("-"));
  if (positionals.length === 0) {
    console.log(HELP_TEXT);
    return 0;
  }
  try {
    positionals.forEach((p, i) => validateNonBlank(p, `arg${i + 1}`));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(msg + "\n");
    return 1;
  }
  // No further subcommands in this sprint; successful no-op for valid args.
  return 0;
}

process.exit(main(process.argv.slice(2)));
