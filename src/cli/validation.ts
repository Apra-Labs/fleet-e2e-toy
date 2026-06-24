/**
 * CLI argument validation helpers.
 * Rejects empty or whitespace-only strings, naming the failing flag.
 */
export function validateRequiredString(value: string, flagName: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`--${flagName} must be a non-empty string`);
  }
}

/**
 * Validates that a string value (if provided) is not blank.
 * For optional flags that, when provided, must not be blank.
 */
export function validateOptionalString(
  value: string | undefined,
  flagName: string
): void {
  if (value !== undefined && value.trim().length === 0) {
    throw new Error(`--${flagName} must be a non-empty string if provided`);
  }
}
