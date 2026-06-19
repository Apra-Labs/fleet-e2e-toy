import { CliArgs } from "./types";

export function parseArgs(argv: string[]): CliArgs {
  // Remove first two elements (node path and script path)
  const args = argv.slice(2);

  if (args.length === 0) {
    return {
      subcommand: "",
      flags: {},
    };
  }

  // First non-flag argument is the subcommand
  let subcommand = "";
  const flags: Record<string, unknown> = {};

  // Find the first argument that doesn't start with -- or -
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith("-")) {
      subcommand = arg;
      break;
    }
  }

  // Parse flags before and after the subcommand
  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg.startsWith("--")) {
      // Long flag format: --key=value or --key value or --key (boolean)
      const flagContent = arg.slice(2);
      const eqIndex = flagContent.indexOf("=");

      if (eqIndex > -1) {
        const key = flagContent.slice(0, eqIndex);
        const value = flagContent.slice(eqIndex + 1);
        flags[key] = value;
        i++;
      } else {
        // Check if the next argument is a value (not a flag)
        const nextArg = args[i + 1];
        if (nextArg !== undefined && !nextArg.startsWith("-")) {
          flags[flagContent] = nextArg;
          i += 2;
        } else {
          flags[flagContent] = true;
          i++;
        }
      }
    } else if (arg.startsWith("-") && arg.length === 2) {
      // Short flag format: -h, -v
      const key = arg.slice(1);
      flags[key] = true;
      i++;
    } else {
      i++;
    }
  }

  return {
    subcommand,
    flags: flags as CliArgs["flags"],
  };
}
