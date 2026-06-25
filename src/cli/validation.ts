export class CliValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CliValidationError";
  }
}

export function validateNonEmpty(value: string, name: string): void {
  if (!value || value.trim().length === 0) {
    throw new CliValidationError(`--${name} must not be empty`);
  }
}
