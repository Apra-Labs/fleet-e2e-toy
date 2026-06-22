/**
 * CLI-level input validation helpers.
 *
 * These complement the server-side validators in src/utils/validation.ts and
 * are used to catch bad input before ever making an API call.
 */

/** Thrown when a required CLI argument is missing, empty, or whitespace-only. */
export class ValidationError extends Error {
  constructor(public readonly field: string, message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Assert that a required CLI argument is present and non-blank.
 *
 * @param name  - The argument name (used in the error message).
 * @param value - The raw string value from the parsed flags.
 * @returns The trimmed, non-empty string on success.
 * @throws {ValidationError} when value is undefined, empty, or whitespace-only.
 */
export function validateRequired(name: string, value: string | undefined): string {
  if (value === undefined || value.trim().length === 0) {
    throw new ValidationError(name, `'${name}' is required and must not be blank`);
  }
  return value.trim();
}
