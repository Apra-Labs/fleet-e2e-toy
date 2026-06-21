import * as path from "path";
import * as fs from "fs";

export function getVersion(): string {
  try {
    const pkgPath = path.resolve(__dirname, "../../package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as { name?: string; version?: string };
    return pkg.version ?? "unknown";
  } catch {
    return "unknown";
  }
}

export function printVersion(): void {
  const version = getVersion();
  process.stdout.write(`fleet-e2e-toy v${version}\n`);
}
