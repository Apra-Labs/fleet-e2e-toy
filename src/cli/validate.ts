/**
 * CLI-layer input validation. Rejects empty or whitespace-only values for
 * required arguments before any HTTP call is made.
 */

/** Thrown when a required CLI argument is missing, empty, or whitespace-only. */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Ensures `value` is present and not empty/whitespace-only. Returns the
 * trimmed value on success. Throws a `ValidationError` with a clear,
 * one-line message otherwise.
 */
export function requireNonBlank(value: string | undefined, flagName: string): string {
  if (value === undefined || value.trim().length === 0) {
    throw new ValidationError(`--${flagName} is required and cannot be empty.`);
  }
  return value.trim();
}

/**
 * Validates an optional flag: if present, it must not be blank/whitespace-only.
 * Returns the trimmed value, or undefined when the flag was not supplied.
 */
export function optionalNonBlank(value: string | undefined, flagName: string): string | undefined {
  if (value === undefined) return undefined;
  if (value.trim().length === 0) {
    throw new ValidationError(`--${flagName} cannot be empty or whitespace-only.`);
  }
  return value.trim();
}
