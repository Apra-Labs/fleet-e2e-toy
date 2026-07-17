// Client-side input validation for the CLI.
//
// Mirrors the spirit of src/utils/validation.ts (reject empty/blank required
// strings) but is intentionally independent — the CLI lives on the far side
// of a process boundary from the server and must not import server internals.
//
// Validation runs before any HTTP request is made, so bad input never reaches
// the network layer. On failure, callers get a clean message (no stack
// trace) suitable for printing to stderr, and should exit with a non-zero
// status.

export class CliValidationError extends Error {
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = "CliValidationError";
    this.field = field;
  }
}

// Returns true only for a non-empty, non-whitespace-only string.
function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

// Validates a required string argument, throwing CliValidationError when the
// value is missing, empty, or whitespace-only. Returns the original value on
// success (not trimmed — trimming is a server-side concern).
function requireNonBlank(field: string, flag: string, value: string | undefined): string {
  if (value === undefined || isBlank(value)) {
    throw new CliValidationError(field, `--${flag} is required and must not be empty`);
  }
  return value;
}

export function validateTitle(value: string | undefined): string {
  return requireNonBlank("title", "title", value);
}

export function validateContent(value: string | undefined): string {
  return requireNonBlank("content", "content", value);
}

export function validateId(value: string | undefined): string {
  return requireNonBlank("id", "id", value);
}
