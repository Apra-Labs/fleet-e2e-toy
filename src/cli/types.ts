/**
 * Shared types for the CLI layer.
 */

/** A parsed flag value: either a string (--flag value) or boolean (--flag). */
export type FlagValue = string | boolean;

/** Result of parsing raw argv into a structured shape. */
export interface ParsedArgs {
  /** The first non-flag token, treated as the subcommand name. */
  command?: string;
  /** Map of flag name (without leading dashes) to its value. */
  flags: Record<string, FlagValue>;
  /** Remaining non-flag tokens after the command. */
  positionals: string[];
}

/** Outcome of running a command: an exit code plus optional output. */
export interface CommandResult {
  /** Process exit code: 0 for success, non-zero for failure. */
  code: number;
  /** Optional message to write to stdout on success. */
  stdout?: string;
  /** Optional message to write to stderr on failure. */
  stderr?: string;
}
