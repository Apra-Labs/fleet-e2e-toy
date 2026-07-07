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

describe("CLI help system", () => {
  it("--help exits 0 and stdout lists all subcommands", () => {
    const { stdout, status } = runCli(["--help"]);

    expect(status).toBe(0);
    expect(stdout).toContain("Usage:");
    expect(stdout).toContain("list");
    expect(stdout).toContain("read");
    expect(stdout).toContain("create");
    expect(stdout).toContain("update");
    expect(stdout).toContain("delete");
  });

  it("-h behaves identically to --help", () => {
    const { stdout, status } = runCli(["-h"]);

    expect(status).toBe(0);
    expect(stdout).toContain("Usage:");
    expect(stdout).toContain("list");
    expect(stdout).toContain("read");
    expect(stdout).toContain("create");
    expect(stdout).toContain("update");
    expect(stdout).toContain("delete");
  });

  it("create --help exits 0 and stdout contains create's flags", () => {
    const { stdout, status } = runCli(["create", "--help"]);

    expect(status).toBe(0);
    expect(stdout).toContain("--title");
    expect(stdout).toContain("--content");
    expect(stdout).toContain("--tags");
  });

  it("read --help exits 0 and stdout contains read's flags", () => {
    const { stdout, status } = runCli(["read", "--help"]);

    expect(status).toBe(0);
    expect(stdout).toContain("--id");
  });

  it("update --help exits 0 and stdout contains update's flags", () => {
    const { stdout, status } = runCli(["update", "--help"]);

    expect(status).toBe(0);
    expect(stdout).toContain("--id");
    expect(stdout).toContain("--title");
    expect(stdout).toContain("--content");
    expect(stdout).toContain("--tags");
  });

  it("delete --help exits 0 and stdout contains delete's flags", () => {
    const { stdout, status } = runCli(["delete", "--help"]);

    expect(status).toBe(0);
    expect(stdout).toContain("--id");
  });

  it("list --help exits 0 and stdout contains list's flags", () => {
    const { stdout, status } = runCli(["list", "--help"]);

    expect(status).toBe(0);
    expect(stdout).toContain("--tag");
    expect(stdout).toContain("--q");
  });
});

describe("CLI input validation", () => {
  it("create with --title '' exits non-zero with a clean Error message (no stack trace)", () => {
    const { stderr, stdout, status } = runCli([
      "create",
      "--title",
      "",
      "--content",
      "Some content",
    ]);

    expect(status).not.toBe(0);
    expect(stderr).toContain("Error:");
    expect(stderr).not.toContain(" at ");
    expect(stdout).toBe("");
  });

  it("create with --title '   ' (whitespace) exits non-zero with a clean Error message (no stack trace)", () => {
    const { stderr, stdout, status } = runCli([
      "create",
      "--title",
      "   ",
      "--content",
      "Some content",
    ]);

    expect(status).not.toBe(0);
    expect(stderr).toContain("Error:");
    expect(stderr).not.toContain(" at ");
    expect(stdout).toBe("");
  });

  it("read with no --id exits non-zero with a clean error", () => {
    const { stderr, stdout, status } = runCli(["read"]);

    expect(status).not.toBe(0);
    expect(stderr).toContain("Error:");
    expect(stderr).not.toContain(" at ");
    expect(stdout).toBe("");
  });
});
