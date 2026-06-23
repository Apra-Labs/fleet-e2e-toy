/**
 * Minimal CLI argument parser for fleet-e2e-toy.
 *
 * Splits the raw argv (already stripped of node + script path) into a
 * subcommand, a set of flags, and any remaining positional arguments.
 *
 * Supported flag forms:
 *   --flag value     (value-bearing flag)
 *   --flag=value     (value-bearing flag, inline)
 *   --flag           (boolean flag, when not followed by a value)
 *   -f               (short boolean flag)
 */

export interface ParsedArgs {
  /** The first non-flag token, or undefined when no subcommand was given. */
  command: string | undefined;
  /** Flags keyed by name (leading dashes stripped). Boolean flags map to true. */
  flags: Record<string, string | boolean>;
  /** Positional arguments that follow the subcommand. */
  positionals: string[];
}

function isFlag(token: string): boolean {
  return token.startsWith("-");
}

function flagName(token: string): string {
  return token.replace(/^-+/, "");
}

/**
 * Parse an array of raw CLI arguments into a structured ParsedArgs object.
 * The input should already exclude the node executable and script path
 * (i.e. pass process.argv.slice(2)).
 */
export function parseArgs(argv: string[]): ParsedArgs {
  const flags: Record<string, string | boolean> = {};
  const positionals: string[] = [];
  let command: string | undefined;

  let i = 0;
  while (i < argv.length) {
    const token = argv[i];

    if (isFlag(token)) {
      const eqIndex = token.indexOf("=");
      if (eqIndex !== -1) {
        // --flag=value form
        const name = flagName(token.slice(0, eqIndex));
        const value = token.slice(eqIndex + 1);
        flags[name] = value;
        i += 1;
        continue;
      }

      const name = flagName(token);
      const next = argv[i + 1];
      if (next !== undefined && !isFlag(next)) {
        // --flag value form
        flags[name] = next;
        i += 2;
        continue;
      }

      // boolean flag
      flags[name] = true;
      i += 1;
      continue;
    }

    // non-flag token: first becomes the command, rest are positionals
    if (command === undefined) {
      command = token;
    } else {
      positionals.push(token);
    }
    i += 1;
  }

  return { command, flags, positionals };
}

/**
 * Validate that a CLI argument value is a non-empty, non-whitespace-only string.
 * Returns the trimmed value on success, or throws an error with a clear message.
 */
export function validateNonBlank(value: string | boolean | undefined, argName: string): string {
  if (value === undefined || value === true || value === false) {
    throw new Error(`Argument '${argName}' is required`);
  }
  if (typeof value === "string" && value.trim().length === 0) {
    throw new Error(`Argument '${argName}' must not be empty or whitespace-only`);
  }
  return (value as string).trim();
}
