// Input validation helpers for CLI subcommands. Validation runs before any
// HTTP call is made; failures are reported as a single error message.

export type ValidationResult = { valid: true } | { valid: false; message: string };

function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

/** Validates that a required string flag is present and non-blank. */
export function requireNonBlank(value: string | undefined, flagName: string): ValidationResult {
  if (value === undefined) {
    return { valid: false, message: `--${flagName} is required` };
  }
  if (isBlank(value)) {
    return { valid: false, message: `--${flagName} cannot be empty or whitespace` };
  }
  return { valid: true };
}

export function validateReadArgs(id: string | undefined): ValidationResult {
  return requireNonBlank(id, "id");
}

export function validateDeleteArgs(id: string | undefined): ValidationResult {
  return requireNonBlank(id, "id");
}

export function validateCreateArgs(
  title: string | undefined,
  content: string | undefined
): ValidationResult {
  const titleResult = requireNonBlank(title, "title");
  if (!titleResult.valid) return titleResult;

  const contentResult = requireNonBlank(content, "content");
  if (!contentResult.valid) return contentResult;

  return { valid: true };
}

export function validateUpdateArgs(
  id: string | undefined,
  title: string | undefined,
  content: string | undefined,
  tags: string | undefined
): ValidationResult {
  const idResult = requireNonBlank(id, "id");
  if (!idResult.valid) return idResult;

  if (title !== undefined) {
    const titleResult = requireNonBlank(title, "title");
    if (!titleResult.valid) return titleResult;
  }

  if (content !== undefined) {
    const contentResult = requireNonBlank(content, "content");
    if (!contentResult.valid) return contentResult;
  }

  if (title === undefined && content === undefined && tags === undefined) {
    return {
      valid: false,
      message: "update requires at least one of --title, --content, or --tags",
    };
  }

  return { valid: true };
}
