import { CliError } from "./types";
import { ParsedArgs } from "./types";

/**
 * Require a flag value from parsed args.
 * Returns the trimmed string value or throws a CliError if missing/blank.
 */
export function requireFlag(flags: ParsedArgs["flags"], name: string): string {
  const value = flags[name];

  if (value === undefined || value === true || value === false) {
    throw new CliError(`--${name} is required and cannot be empty`);
  }

  const trimmed = (value as string).trim();
  if (trimmed.length === 0) {
    throw new CliError(`--${name} is required and cannot be empty`);
  }

  return trimmed;
}

/**
 * Get an optional flag value from parsed args.
 * Returns the trimmed string value or undefined if missing/blank.
 */
export function optionalFlag(flags: ParsedArgs["flags"], name: string): string | undefined {
  const value = flags[name];

  if (value === undefined || value === true || value === false) {
    return undefined;
  }

  const trimmed = (value as string).trim();
  return trimmed.length === 0 ? undefined : trimmed;
}
