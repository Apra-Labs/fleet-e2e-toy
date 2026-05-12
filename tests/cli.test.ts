import { spawnSync } from "child_process";
import { join } from "path";

const tsNode = join(__dirname, "../node_modules/.bin/ts-node");
const indexTs = join(__dirname, "../src/index.ts");

function runCli(args: string[]) {
  return spawnSync(tsNode, [indexTs, ...args], {
    encoding: "utf-8",
    timeout: 10000,
    cwd: join(__dirname, ".."),
  });
}

describe("CLI --version flag", () => {
  it("prints the version and exits with code 0", () => {
    const result = runCli(["--version"]);
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe("1.0.0");
  });

  it("prints a valid semver string", () => {
    const result = runCli(["--version"]);
    expect(result.stdout.trim()).toMatch(/^\d+\.\d+\.\d+/);
  });
});

describe("CLI --help flag", () => {
  it("prints usage info and exits with code 0", () => {
    const result = runCli(["--help"]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("--version");
    expect(result.stdout).toContain("--help");
  });

  it("prints to stdout with no stderr output", () => {
    const result = runCli(["--help"]);
    expect(result.stdout.length).toBeGreaterThan(0);
    expect(result.stderr).toBe("");
  });

  it("includes Usage header", () => {
    const result = runCli(["--help"]);
    expect(result.stdout).toContain("Usage");
  });
});
