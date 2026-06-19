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

function runCli(
  args: string[]
): { stdout: string; stderr: string; status: number | null } {
  const result = spawnSync(tsNode, [cliEntry, ...args], {
    cwd,
    encoding: "utf-8",
    shell: true,
    timeout: 15000,
  });
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    status: result.status,
  };
}

function hasStackTrace(output: string): boolean {
  // Stack trace lines contain "at " followed by a function/file location like
  // "at Object.<anonymous> (file.ts:10:5)" or "at processTicksAndRejections"
  // We look for lines matching "    at " (with leading whitespace typical of stack frames)
  return /^\s+at /m.test(output);
}

describe("CLI --help output", () => {
  it("noteapi --help exits 0", () => {
    const { status } = runCli(["--help"]);
    expect(status).toBe(0);
  });

  it("noteapi --help stdout contains usage", () => {
    const { stdout } = runCli(["--help"]);
    expect(stdout).toContain("Usage:");
  });

  it("noteapi --help stdout mentions all subcommand names", () => {
    const { stdout } = runCli(["--help"]);
    expect(stdout).toContain("list");
    expect(stdout).toContain("read");
    expect(stdout).toContain("create");
    expect(stdout).toContain("update");
    expect(stdout).toContain("delete");
  });

  it("noteapi -h exits 0", () => {
    const { status } = runCli(["-h"]);
    expect(status).toBe(0);
  });

  it("noteapi -h stdout contains usage", () => {
    const { stdout } = runCli(["-h"]);
    expect(stdout).toContain("Usage:");
  });

  it("noteapi create --help exits 0", () => {
    const { status } = runCli(["create", "--help"]);
    expect(status).toBe(0);
  });

  it("noteapi create --help mentions --title", () => {
    const { stdout } = runCli(["create", "--help"]);
    expect(stdout).toContain("--title");
  });

  it("noteapi create --help mentions --content", () => {
    const { stdout } = runCli(["create", "--help"]);
    expect(stdout).toContain("--content");
  });

  it("noteapi create -h exits 0", () => {
    const { status } = runCli(["create", "-h"]);
    expect(status).toBe(0);
  });
});

describe("CLI invalid input produces no stack traces in stderr", () => {
  it("create with blank --title has no stack trace in stderr", () => {
    const { stderr } = runCli(["create", "--title=", "--content=x"]);
    expect(hasStackTrace(stderr)).toBe(false);
  });

  it("create with whitespace-only --title has no stack trace in stderr", () => {
    const { stderr } = runCli(["create", "--title=   ", "--content=x"]);
    expect(hasStackTrace(stderr)).toBe(false);
  });

  it("create with blank --content has no stack trace in stderr", () => {
    const { stderr } = runCli(["create", "--title=MyTitle", "--content="]);
    expect(hasStackTrace(stderr)).toBe(false);
  });

  it("read with blank --id has no stack trace in stderr", () => {
    const { stderr } = runCli(["read", "--id="]);
    expect(hasStackTrace(stderr)).toBe(false);
  });

  it("read with whitespace-only --id has no stack trace in stderr", () => {
    const { stderr } = runCli(["read", "--id=   "]);
    expect(hasStackTrace(stderr)).toBe(false);
  });

  it("update with blank --id has no stack trace in stderr", () => {
    const { stderr } = runCli(["update", "--id=", "--title=x"]);
    expect(hasStackTrace(stderr)).toBe(false);
  });

  it("delete with blank --id has no stack trace in stderr", () => {
    const { stderr } = runCli(["delete", "--id="]);
    expect(hasStackTrace(stderr)).toBe(false);
  });
});
