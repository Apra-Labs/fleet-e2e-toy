// resolveJsonModule is enabled — package.json can be imported directly.
import pkg from "../../package.json";

export const TOOL_NAME = "fleet-e2e-toy";
export const VERSION: string = pkg.version;

export function printVersion(): void {
  process.stdout.write(`${TOOL_NAME} v${VERSION}\n`);
}
