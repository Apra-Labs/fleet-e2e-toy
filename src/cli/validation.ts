import { CliError } from "./client";

/**
 * Asserts that a flag value is non-blank (not empty or whitespace-only).
 * Throws a CliError with a human-readable message if the value is blank.
 */
export function assertNonBlank(name: string, value: string): void {
  if (value.trim() === "") {
    throw new CliError(0, `Error: ${name} must not be empty`);
  }
}
