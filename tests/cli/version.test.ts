import { spawnSync } from "child_process";
import path from "path";

const CLI_ENTRY = path.join(__dirname, "..", "..", "src", "cli", "index.ts");
const TS_NODE_BIN = path.join(__dirname, "..", "..", "node_modules", ".bin", "ts-node");

function runCli(args: string[]): { stdout: string; stderr: string; status: number | null } {
  const result = spawnSync(TS_NODE_BIN, [CLI_ENTRY, ...args], {
    encoding: "utf-8",
  });

  return {
    stdout: result.stdout,
    stderr: result.stderr,
    status: result.status,
  };
}

describe("CLI --version flag", () => {
  it("--version exits 0 and prints the version string", () => {
    const { stdout, status } = runCli(["--version"]);
    expect(status).toBe(0);
    expect(stdout).toContain("fleet-e2e-toy v1.0.0");
  });

  it("-v behaves identically to --version", () => {
    const { stdout, status } = runCli(["-v"]);
    expect(status).toBe(0);
    expect(stdout).toContain("fleet-e2e-toy v1.0.0");
  });

  it("produces output with no stack trace", () => {
    const { stdout, stderr } = runCli(["--version"]);
    expect(stdout).not.toContain(" at ");
    expect(stderr).not.toContain(" at ");
  });
});
