export interface ParsedArgs {
  command: string;
  flags: Record<string, string | boolean>;
  positional: string[];
}

/**
 * Parse a raw argv slice (excluding node + script path) into a structured form.
 *
 * Supports:
 *   --flag value   → { flag: "value" }
 *   --flag=value   → { flag: "value" }
 *   --flag         → { flag: true }   (boolean, when no value follows)
 *   -f value       → { f: "value" }
 *   -f             → { f: true }
 *
 * The first non-flag token is treated as the command; remaining non-flag
 * tokens are collected as positional arguments.
 */
export function parseArgs(argv: string[]): ParsedArgs {
  const flags: Record<string, string | boolean> = {};
  const positional: string[] = [];
  let command = "";

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];

    if (token.startsWith("--")) {
      const body = token.slice(2);
      const eq = body.indexOf("=");
      if (eq !== -1) {
        flags[body.slice(0, eq)] = body.slice(eq + 1);
      } else {
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith("-")) {
          flags[body] = next;
          i++;
        } else {
          flags[body] = true;
        }
      }
    } else if (token.startsWith("-") && token.length > 1) {
      const body = token.slice(1);
      const eq = body.indexOf("=");
      if (eq !== -1) {
        flags[body.slice(0, eq)] = body.slice(eq + 1);
      } else {
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith("-")) {
          flags[body] = next;
          i++;
        } else {
          flags[body] = true;
        }
      }
    } else if (command === "") {
      command = token;
    } else {
      positional.push(token);
    }
  }

  return { command, flags, positional };
}
