import { ParsedArgs, FlagValue } from "./types";

/** Long flags that are always treated as booleans (never consume a value). */
const BOOLEAN_LONG_FLAGS = new Set(["version", "help"]);

/**
 * Parse raw CLI arguments into a structured shape.
 *
 * Supports:
 *   --flag value     (space-separated value)
 *   --flag=value     (inline value)
 *   --flag           (boolean long flag)
 *   -v / -h          (boolean short flags)
 *
 * The first non-flag token becomes `command`; subsequent non-flag tokens
 * are collected as positionals.
 */
export function parseArgs(argv: string[]): ParsedArgs {
  const flags: Record<string, FlagValue> = {};
  const positionals: string[] = [];
  let command: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];

    if (token.startsWith("--")) {
      const body = token.slice(2);
      const eq = body.indexOf("=");

      if (eq !== -1) {
        // --flag=value
        const name = body.slice(0, eq);
        const value = body.slice(eq + 1);
        flags[name] = value;
        continue;
      }

      const name = body;
      if (BOOLEAN_LONG_FLAGS.has(name)) {
        flags[name] = true;
        continue;
      }

      // --flag value : consume next token if it is not another flag.
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("-")) {
        flags[name] = next;
        i++;
      } else {
        flags[name] = true;
      }
      continue;
    }

    if (token.startsWith("-") && token.length > 1) {
      // Short flag(s) such as -v or -h. Each character is a boolean flag,
      // so -vh sets both v and h to true.
      const chars = token.slice(1).split("");
      for (const ch of chars) {
        flags[ch] = true;
      }
      continue;
    }

    // Non-flag token.
    if (command === undefined) {
      command = token;
    } else {
      positionals.push(token);
    }
  }

  return { command, flags, positionals };
}
