import { spawnSync } from "child_process";
import path from "path";

const ENTRY = path.join(__dirname, "..", "src", "index.ts");

function runCli(flag: string) {
  return spawnSync(process.execPath, ["-r", "ts-node/register", ENTRY, flag], {
    encoding: "utf-8",
  });
}

describe("CLI --version / -v flag", () => {
  it("prints version and exits 0 for --version", () => {
    const result = runCli("--version");
    expect(result.stdout).toContain("fleet-e2e-toy v1.0.0");
    expect(result.status).toBe(0);
  });

  it("prints version and exits 0 for -v", () => {
    const result = runCli("-v");
    expect(result.stdout).toContain("fleet-e2e-toy v1.0.0");
    expect(result.status).toBe(0);
  });
});
