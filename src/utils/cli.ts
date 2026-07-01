export const VERSION_STRING = "fleet-e2e-toy v1.0.0";

export function isVersionFlag(argv: string[]): boolean {
  return argv.includes("--version") || argv.includes("-v");
}
