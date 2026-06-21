import { ParsedArgs } from "./types";

/**
 * Parse CLI arguments into a structured form.
 * Supports:
 *   --flag value        (string flag)
 *   --flag=value        (string flag with equals)
 *   --flag              (boolean flag)
 *   -h                  (short boolean flag)
 * Pure function — never accesses process directly.
 */
export function parseArgs(argv: string[]): ParsedArgs {
  const flags: Record<string, string | boolean> = {};
  const positionals: string[] = [];
  let command: string | undefined;

  let i = 0;

  // First non-flag argument is the command
  while (i < argv.length) {
    const arg = argv[i];

    if (arg.startsWith("--")) {
      // Long flag
      const withoutDashes = arg.slice(2);
      const eqIndex = withoutDashes.indexOf("=");

      if (eqIndex !== -1) {
        // --flag=value
        const key = withoutDashes.slice(0, eqIndex);
        const value = withoutDashes.slice(eqIndex + 1);
        flags[key] = value;
        i++;
      } else {
        // --flag [value] or boolean --flag
        const key = withoutDashes;
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith("-")) {
          flags[key] = next;
          i += 2;
        } else {
          flags[key] = true;
          i++;
        }
      }
    } else if (arg.startsWith("-") && arg.length === 2) {
      // Short flag like -h
      const key = arg.slice(1);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("-")) {
        flags[key] = next;
        i += 2;
      } else {
        flags[key] = true;
        i++;
      }
    } else {
      // Positional or command
      if (command === undefined) {
        command = arg;
      } else {
        positionals.push(arg);
      }
      i++;
    }
  }

  return { command, flags, positionals };
}
