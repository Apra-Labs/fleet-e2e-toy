export function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

export function validateRequired(
  name: string,
  value: string | undefined
): string | null {
  if (value === undefined || isBlank(value)) {
    return `Error: ${name} must not be empty`;
  }
  return null;
}
