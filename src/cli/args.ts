// Shared CLI argument-parsing helpers: turning `--flag value` pairs into a
// map, and validating that required string flags are non-empty/non-blank
// before a subcommand acts on them.

// Parses a flat argv slice (subcommand args, i.e. everything after the
// subcommand name) into a map of flag name -> value. Repeated flags keep the
// last occurrence. Boolean-style flags (no following value, or followed by
// another flag) are recorded with value "" so callers can still detect
// presence.
export function parseFlags(args: string[]): Record<string, string> {
  const flags: Record<string, string> = {};

  for (let i = 0; i < args.length; i++) {
    const token = args[i];
    if (!token.startsWith("--") && !(token.startsWith("-") && token.length === 2)) {
      continue;
    }
    const name = token.replace(/^-+/, "");
    const next = args[i + 1];
    if (next !== undefined && !next.startsWith("-")) {
      flags[name] = next;
      i++;
    } else {
      flags[name] = "";
    }
  }

  return flags;
}

export class ValidationError extends Error {
  readonly flag: string;

  constructor(flag: string, message: string) {
    super(message);
    this.name = "ValidationError";
    this.flag = flag;
  }
}

// Validates that a required string flag's value is present and not empty or
// whitespace-only. Throws a ValidationError naming the offending flag if it
// is missing, empty, or blank. Returns the trimmed value on success.
export function validateNonEmpty(flag: string, value: string | undefined): string {
  if (value === undefined) {
    throw new ValidationError(flag, `--${flag} is required`);
  }
  if (value.trim().length === 0) {
    throw new ValidationError(flag, `--${flag} must not be empty or blank`);
  }
  return value;
}
