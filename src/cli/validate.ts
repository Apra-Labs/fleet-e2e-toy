// Shared input validation for the NoteAPI CLI.
//
// This is deliberately separate from src/utils/validation.ts, which validates
// request *bodies* on the server. Here we validate CLI *arguments* — the values
// pulled off argv for a subcommand's flags — so that a missing, empty, or
// whitespace-only required argument is rejected BEFORE any network call is made.
//
// The CRUD subcommands (gh-toy-2fq.5/.6) call these helpers for their required
// fields (e.g. --id for read/update/delete; --title/--content for create).
//
// The helpers throw a plain `Error` whose message names the offending argument.
// The dispatcher (index.ts) already catches thrown errors and writes
// `Error: <message>` to stderr with a non-zero exit and no stack trace, so
// callers get the required behaviour for free by letting the error propagate.

/** Error raised when a required CLI argument is missing or blank. */
export class CliValidationError extends Error {
  /** The argument/flag name that failed validation (e.g. "--id"). */
  readonly argName: string;

  constructor(argName: string, message: string) {
    super(message);
    this.name = "CliValidationError";
    this.argName = argName;
  }
}

/**
 * Ensure a required argument is present and not blank.
 *
 * Rejects `undefined`/`null`, the empty string, and whitespace-only strings.
 * On success, returns the original (untrimmed) value so callers keep control
 * over any trimming they need. On failure, throws a {@link CliValidationError}
 * whose message names `argName`.
 *
 * @param value   The raw argument value read from argv (may be undefined).
 * @param argName The flag/argument name to report, e.g. "--id" or "--title".
 */
export function requireNonBlank(
  value: string | undefined | null,
  argName: string
): string {
  if (value === undefined || value === null || value.trim().length === 0) {
    throw new CliValidationError(
      argName,
      `missing required argument '${argName}'`
    );
  }
  return value;
}
