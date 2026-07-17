// Small flag-parsing helper shared across CLI subcommands.
// Parses `--flag value` pairs from an argv-style array of strings.

export function parseFlags(args: string[]): Record<string, string> {
  const flags: Record<string, string> = {};

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const name = arg.slice(2);
      const next = args[i + 1];
      if (next !== undefined && !next.startsWith("--")) {
        flags[name] = next;
        i += 1;
      } else {
        flags[name] = "";
      }
    }
  }

  return flags;
}
