/**
 * Tests for --help and unknown-subcommand behaviour in the CLI root program.
 * We run the compiled program as a child process to avoid side-effects from
 * process.exit() in the test runner.
 */
import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const CLI_PATH = path.resolve(__dirname, "../../dist/cli/index.js");

async function runCli(
  args: string[]
): Promise<{ stdout: string; stderr: string; code: number | null }> {
  try {
    const { stdout, stderr } = await execFileAsync("node", [CLI_PATH, ...args]);
    return { stdout, stderr, code: 0 };
  } catch (err) {
    const e = err as NodeJS.ErrnoException & {
      stdout?: string;
      stderr?: string;
      code?: number | null;
    };
    return {
      stdout: e.stdout ?? "",
      stderr: e.stderr ?? "",
      code: typeof e.code === "number" ? e.code : 1,
    };
  }
}

describe("help", () => {
  it("notecli --help exits 0 and prints usage", async () => {
    const { stdout, code } = await runCli(["--help"]);
    expect(code).toBe(0);
    expect(stdout).toMatch(/notecli/);
    expect(stdout).toMatch(/list/);
    expect(stdout).toMatch(/read/);
    expect(stdout).toMatch(/create/);
    expect(stdout).toMatch(/update/);
    expect(stdout).toMatch(/delete/);
  });

  it("notecli -h exits 0 and prints usage", async () => {
    const { stdout, code } = await runCli(["-h"]);
    expect(code).toBe(0);
    expect(stdout).toMatch(/notecli/);
  });

  it("notecli list --help exits 0 and prints subcommand usage", async () => {
    const { stdout, code } = await runCli(["list", "--help"]);
    expect(code).toBe(0);
    expect(stdout).toMatch(/--tag/);
    expect(stdout).toMatch(/--q/);
  });

  it("notecli read --help exits 0 and shows --id option", async () => {
    const { stdout, code } = await runCli(["read", "--help"]);
    expect(code).toBe(0);
    expect(stdout).toMatch(/--id/);
  });

  it("notecli create --help exits 0 and shows --title and --content", async () => {
    const { stdout, code } = await runCli(["create", "--help"]);
    expect(code).toBe(0);
    expect(stdout).toMatch(/--title/);
    expect(stdout).toMatch(/--content/);
  });

  it("notecli update --help exits 0", async () => {
    const { stdout, code } = await runCli(["update", "--help"]);
    expect(code).toBe(0);
    expect(stdout).toMatch(/--id/);
  });

  it("notecli delete --help exits 0", async () => {
    const { stdout, code } = await runCli(["delete", "--help"]);
    expect(code).toBe(0);
    expect(stdout).toMatch(/--id/);
  });
});

describe("unknown subcommand", () => {
  it("exits non-zero for unknown subcommand", async () => {
    const { code } = await runCli(["foobar"]);
    expect(code).not.toBe(0);
  });

  it("prints usage and error message to stderr for unknown subcommand", async () => {
    const { stderr } = await runCli(["foobar"]);
    expect(stderr).toMatch(/foobar/);
    expect(stderr).toMatch(/notecli/);
  });
});
