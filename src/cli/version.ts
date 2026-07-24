import * as fs from "fs";
import * as path from "path";

export function getVersion(): string {
  try {
    // Read package.json from the project root
    const packageJsonPath = path.resolve(__dirname, "../../package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    return packageJson.version;
  } catch {
    return "unknown";
  }
}

export function printVersion(): void {
  console.log(`noteapi v${getVersion()}`);
}

export function isVersionFlag(arg: string | undefined): boolean {
  return arg === "--version" || arg === "-v";
}
