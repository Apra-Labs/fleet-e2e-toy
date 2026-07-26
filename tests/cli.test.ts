import { spawnSync } from "child_process";
import path from "path";

const ENTRYPOINT = path.join(__dirname, "..", "src", "index.ts");
const TS_NODE = path.join(__dirname, "..", "node_modules", ".bin", "ts-node");

function runCli(args: string[]) {
  return spawnSync(TS_NODE, [ENTRYPOINT, ...args], { encoding: "utf-8" });
}

describe("CLI --version/-v flag", () => {
  it("prints the version and exits 0 for --version", () => {
    const result = runCli(["--version"]);
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(result.status).toBe(0);
  });

  it("prints the version and exits 0 for -v", () => {
    const result = runCli(["-v"]);
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(result.status).toBe(0);
  });

  it("still recognizes --version alongside other flags", () => {
    const result = runCli(["--foo", "--version"]);
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(result.status).toBe(0);
  });
});
