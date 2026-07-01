import fs from "fs";
import path from "path";

export function getVersion(): string {
  const pkgPath = path.join(__dirname, "..", "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as { version: string };
  return pkg.version;
}

export function getVersionString(): string {
  return `fleet-e2e-toy v${getVersion()}`;
}

export function hasVersionFlag(args: string[]): boolean {
  return args.includes("--version") || args.includes("-v");
}
