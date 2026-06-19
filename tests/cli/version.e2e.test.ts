import { spawnSync } from "child_process";
import * as path from "path";

const isWindows = process.platform === "win32";
const tsNodeBin = isWindows ? "ts-node.cmd" : "ts-node";
const tsNode = path.resolve(
  __dirname,
  "../../node_modules/.bin",
  tsNodeBin
);
const cliEntry = path.resolve(__dirname, "../../src/cli/index.ts");
const cwd = path.resolve(__dirname, "../..");

function runCli(args: string[]): { stdout: string; stderr: string; status: number | null } {
  const result = spawnSync(tsNode, [cliEntry, ...args], {
    cwd,
    encoding: "utf-8",
    shell: true,
  });
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    status: result.status,
  };
}

describe("CLI --version flag", () => {
  it("prints version and exits 0 with --version", () => {
    const { stdout, status } = runCli(["--version"]);
    expect(stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(status).toBe(0);
  });

  it("prints version and exits 0 with -v", () => {
    const { stdout, status } = runCli(["-v"]);
    expect(stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(status).toBe(0);
  });

  it("prints version and exits 0 when --version is combined with another flag", () => {
    const { stdout, status } = runCli(["--version", "--json"]);
    expect(stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(status).toBe(0);
  });
});
