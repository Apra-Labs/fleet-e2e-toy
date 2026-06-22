import * as fs from "fs";
import * as path from "path";

/**
 * Get the version string from package.json.
 * Returns the version in the format "fleet-e2e-toy vX.Y.Z".
 */
export function getVersionString(): string {
  const packageJsonPath = path.join(__dirname, "..", "..", "package.json");
  const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
  const packageJson = JSON.parse(packageJsonContent);
  const version = packageJson.version || "0.0.0";
  return `fleet-e2e-toy v${version}`;
}
