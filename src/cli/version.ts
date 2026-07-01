import * as fs from "fs";
import * as path from "path";

// Read version from package.json
function getVersion(): string {
  const packageJsonPath = path.join(__dirname, "../../package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  return packageJson.version;
}

export const VERSION = getVersion();

export function printVersion(): void {
  process.stdout.write(`fleet-e2e-toy v${VERSION}\n`);
}
