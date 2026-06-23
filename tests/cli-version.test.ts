import { spawnSync } from "child_process";
import path from "path";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require("../package.json") as { version: string };

const CLI_PATH = path.resolve(__dirname, "../src/cli/index.ts");

// On Windows the shebang-less .cmd wrapper must be used; on POSIX the bare bin works.
const isWindows = process.platform === "win32";
const TS_NODE = path.resolve(
  __dirname,
  isWindows ? "../node_modules/.bin/ts-node.cmd" : "../node_modules/.bin/ts-node"
);

function runCLI(args: string[]): { stdout: string; stderr: string; status: number } {
  const result = spawnSync(TS_NODE, [CLI_PATH, ...args], {
    encoding: "utf8",
    timeout: 15000,
    // Required on Windows so the .cmd wrapper is resolved correctly.
    shell: isWindows,
  });
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    status: result.status ?? 1,
  };
}

describe("CLI --version flag", () => {
  it("--version exits 0 and stdout matches /^fleet-e2e-toy v\\d+\\.\\d+\\.\\d+$/", () => {
    const { stdout, status } = runCLI(["--version"]);
    expect(status).toBe(0);
    expect(stdout.trim()).toMatch(/^fleet-e2e-toy v\d+\.\d+\.\d+$/);
  });

  it("-v produces identical output and exits 0", () => {
    const { stdout: stdoutVersion, status: statusVersion } = runCLI(["--version"]);
    const { stdout: stdoutV, status: statusV } = runCLI(["-v"]);
    expect(statusVersion).toBe(0);
    expect(statusV).toBe(0);
    expect(stdoutV.trim()).toBe(stdoutVersion.trim());
  });

  it("printed version equals the version field in package.json", () => {
    const { stdout, status } = runCLI(["--version"]);
    expect(status).toBe(0);
    expect(stdout.trim()).toBe(`fleet-e2e-toy v${pkg.version}`);
  });

  it("--version combined with a trailing subcommand still prints version and exits 0", () => {
    const { stdout, status } = runCLI(["--version", "list"]);
    expect(status).toBe(0);
    expect(stdout.trim()).toMatch(/^fleet-e2e-toy v\d+\.\d+\.\d+$/);
  });
});
