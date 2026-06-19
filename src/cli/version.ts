import * as path from "path";
import * as fs from "fs";

export function getVersion(): string {
  const pkgPath = path.resolve(__dirname, "../../package.json");
  const raw = fs.readFileSync(pkgPath, "utf-8");
  const pkg = JSON.parse(raw) as { version: string };
  return pkg.version;
}
