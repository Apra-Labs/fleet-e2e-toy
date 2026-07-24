// Shared CLI argument validation. Mirrors the trim-based required/non-empty
// checks used by src/utils/validation.ts for request bodies.

/**
 * Returns true when `value` is present and contains at least one
 * non-whitespace character. Missing (undefined) and empty/whitespace-only
 * values are both treated as "not provided".
 */
export function isNonEmpty(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Validates that every named flag in `flags` has a non-empty, non-whitespace
 * value. Throws a human-readable Error (no stack trace shown to the user)
 * naming the first missing/blank flag, using `usage` as the message prefix.
 */
export function requireNonEmptyFlags(
  flags: Record<string, string | undefined>,
  names: string[],
  usage: string
): void {
  for (const name of names) {
    if (!isNonEmpty(flags[name])) {
      throw new Error(usage);
    }
  }
}
