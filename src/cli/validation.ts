import { CliError, ExitCode } from "./client";

/**
 * Validate that a required CLI flag value is a non-empty, non-whitespace string.
 * Throws a CliError with ExitCode.VALIDATION when the value is undefined,
 * empty, or whitespace-only.
 *
 * @param name  The flag name (used in the error message, e.g. '--title')
 * @param value The raw flag value from the parsed args
 */
export function validateRequired(
  name: string,
  value: string | boolean | undefined
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new CliError(
      `${name} must be a non-empty string`,
      ExitCode.VALIDATION
    );
  }
  return value.trim();
}
