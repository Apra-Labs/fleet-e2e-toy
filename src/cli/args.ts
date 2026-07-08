// Minimal argument parser for the CLI.
//
// Supports:
//   --flag=value   (long flag with value)
//   --flag value   (long flag with value, space-separated)
//   --flag         (long boolean flag)
//   -f value       (shorthand flag with value)
//   -f             (shorthand boolean flag)
//
// Positional (non-flag) arguments are collected in order under `positionals`.

export interface ParsedArgs {
  positionals: string[];
  flags: Record<string, string | boolean>;
}

/**
 * Parses an argv-style array (already stripped of `node`/script path) into
 * positionals and flags. Long flags start with `--`, shorthand flags start
 * with a single `-`.
 */
export function parseArgs(argv: string[]): ParsedArgs {
  const positionals: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg.startsWith("--")) {
      const body = arg.slice(2);
      const eqIndex = body.indexOf("=");
      if (eqIndex !== -1) {
        const key = body.slice(0, eqIndex);
        const value = body.slice(eqIndex + 1);
        flags[key] = value;
      } else {
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith("-")) {
          flags[body] = next;
          i++;
        } else {
          flags[body] = true;
        }
      }
    } else if (arg.startsWith("-") && arg.length > 1) {
      const key = arg.slice(1);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("-")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positionals.push(arg);
    }
  }

  return { positionals, flags };
}

/** Returns the flag value as a string, or undefined if not present/boolean. */
export function getFlagString(flags: Record<string, string | boolean>, key: string): string | undefined {
  const value = flags[key];
  if (typeof value === "string") return value;
  return undefined;
}

/** Returns true if either the long or short flag is present (as boolean or any value). */
export function hasFlag(flags: Record<string, string | boolean>, ...keys: string[]): boolean {
  return keys.some((k) => flags[k] !== undefined);
}
