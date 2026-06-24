export function validateOptions(options: Record<string, string | boolean>): void {
  for (const [key, value] of Object.entries(options)) {
    if (typeof value === "string" && value.trim() === "") {
      throw new Error(`${key} must not be empty`);
    }
  }
}
