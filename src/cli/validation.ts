// Input validation for CLI flag values.
// Mirrors the pattern/spirit of src/utils/validation.ts (trim then check non-empty).

export interface RequiredFlagResult {
  valid: boolean;
  value: string;
  error?: string;
}

/**
 * Validates a required flag value: rejects undefined, empty, or
 * whitespace-only values. Returns the trimmed value when valid.
 */
export function validateRequiredFlag(flagName: string, rawValue: string | undefined): RequiredFlagResult {
  if (rawValue === undefined || rawValue.trim().length === 0) {
    return {
      valid: false,
      value: "",
      error: `--${flagName} is required and must not be empty or whitespace-only`,
    };
  }

  return { valid: true, value: rawValue.trim() };
}

/**
 * Validates an optional flag value: if present, rejects empty or
 * whitespace-only values. Returns undefined when the flag was not
 * supplied, or the trimmed value when valid.
 */
export function validateOptionalFlag(flagName: string, rawValue: string | undefined): RequiredFlagResult {
  if (rawValue === undefined) {
    return { valid: true, value: "" };
  }

  if (rawValue.trim().length === 0) {
    return {
      valid: false,
      value: "",
      error: `--${flagName} must not be empty or whitespace-only`,
    };
  }

  return { valid: true, value: rawValue.trim() };
}
