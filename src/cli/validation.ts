export function requireNonEmptyString(name: string, value: string | undefined): string {
  if (value === undefined || value.trim().length === 0) {
    throw new Error(`--${name} must be a non-empty string`);
  }
  return value.trim();
}
