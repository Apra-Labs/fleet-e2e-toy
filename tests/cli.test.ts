import { spawnSync } from "child_process";
import path from "path";

const tsNode = path.join(__dirname, "..", "node_modules", ".bin", "ts-node");
const cliPath = path.join(__dirname, "..", "src", "cli.ts");

function runCli(flag: string) {
  return spawnSync(tsNode, [cliPath, flag], { encoding: "utf-8" });
}

describe("CLI --version", () => {
  it("prints version and exits 0 for --version", () => {
    const result = runCli("--version");
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(result.status).toBe(0);
  });

  it("prints version and exits 0 for -v", () => {
    const result = runCli("-v");
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(result.status).toBe(0);
  });
});
