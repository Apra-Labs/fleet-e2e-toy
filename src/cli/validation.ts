/**
 * Shared CLI input validation helpers.
 *
 * Command handlers use these to reject empty or whitespace-only flag
 * values with a clear, non-stack-trace error before making any API call.
 */

/**
 * Asserts that `value` is present and, once trimmed, non-empty. Throws a
 * plain `Error` with a clean message (caught by the CLI dispatcher and
 * printed as `Error: <message>` with a non-zero exit code) when the
 * assertion fails.
 */
export function requireNonBlank(name: string, value: string | undefined): string {
  if (value === undefined || value.trim().length === 0) {
    throw new Error(`${name} must not be empty`);
  }
  return value;
}
