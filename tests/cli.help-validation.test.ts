// Tests for the CLI's --help/-h system and client-side input validation.
//
// Both concerns share a hard requirement: neither may ever reach the
// network. Help output is a pure local operation, and validation failures
// must be caught before src/cli/client.ts makes a request. Rather than
// spinning up a real server (as tests/cli.crud.test.ts does for the happy
// paths), these tests mock global.fetch so any accidental HTTP call is both
// observable (via the mock) and would fail loudly instead of silently
// succeeding against a real server.
//
// run() (the CLI's exported entry point) is invoked directly, matching the
// approach in tests/cli.crud.test.ts, so stdout/stderr and the exit code can
// be asserted without shell-quoting overhead.

import { run, Subcommand } from "../src/cli";

const SUBCOMMANDS: Subcommand[] = ["list", "read", "create", "update", "delete"];

let fetchMock: jest.Mock;

beforeEach(() => {
  fetchMock = jest.fn(() => {
    throw new Error("unexpected network call");
  });
  (global as unknown as { fetch: unknown }).fetch = fetchMock;
});

// Captures everything written to a stream during a run() call, joined into
// a single string, without producing real output.
function captureWrites(stream: NodeJS.WriteStream): { text(): string; restore(): void } {
  const chunks: string[] = [];
  const spy = jest.spyOn(stream, "write").mockImplementation((chunk: unknown) => {
    chunks.push(typeof chunk === "string" ? chunk : String(chunk));
    return true;
  });
  return {
    text: () => chunks.join(""),
    restore: () => spy.mockRestore(),
  };
}

async function runCli(args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  const out = captureWrites(process.stdout);
  const err = captureWrites(process.stderr);
  try {
    const code = await run(args);
    return { code, stdout: out.text(), stderr: err.text() };
  } finally {
    out.restore();
    err.restore();
  }
}

const NO_STACK_TRACE = /at .*\(.*:\d+:\d+\)/;

describe("CLI --help/-h", () => {
  it.each(["--help", "-h"])("exits 0 for global %s with no network call", async (flag) => {
    const res = await runCli([flag]);
    expect(res.code).toBe(0);
    expect(res.stdout).toContain("Usage: noteapi-cli <command> [options]");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(SUBCOMMANDS)("exits 0 for `%s --help` with no network call", async (command) => {
    const res = await runCli([command, "--help"]);
    expect(res.code).toBe(0);
    expect(res.stdout).toContain(`Usage: noteapi-cli ${command}`);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(SUBCOMMANDS)("exits 0 for `%s -h` with no network call", async (command) => {
    const res = await runCli([command, "-h"]);
    expect(res.code).toBe(0);
    expect(res.stdout).toContain(`Usage: noteapi-cli ${command}`);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("takes precedence over other flags on the same subcommand", async () => {
    const res = await runCli(["create", "--title", "", "--help"]);
    expect(res.code).toBe(0);
    expect(res.stdout).toContain("Usage: noteapi-cli create");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("CLI validation: blank required args", () => {
  it.each(["", "   ", "\t"])(
    "rejects create --title %j before any HTTP call",
    async (blank) => {
      const res = await runCli(["create", "--title", blank, "--content", "Body"]);
      expect(res.code).not.toBe(0);
      expect(res.stdout).toBe("");
      expect(res.stderr).toContain("--title is required and must not be empty");
      expect(res.stderr).not.toMatch(NO_STACK_TRACE);
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it.each(["", "   ", "\t"])(
    "rejects create --content %j before any HTTP call",
    async (blank) => {
      const res = await runCli(["create", "--title", "Title", "--content", blank]);
      expect(res.code).not.toBe(0);
      expect(res.stdout).toBe("");
      expect(res.stderr).toContain("--content is required and must not be empty");
      expect(res.stderr).not.toMatch(NO_STACK_TRACE);
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it.each(["", "   ", "\t"])(
    "rejects read --id %j before any HTTP call",
    async (blank) => {
      const res = await runCli(["read", "--id", blank]);
      expect(res.code).not.toBe(0);
      expect(res.stdout).toBe("");
      expect(res.stderr).toContain("--id is required and must not be empty");
      expect(res.stderr).not.toMatch(NO_STACK_TRACE);
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it("rejects update --id blank before any HTTP call", async () => {
    const res = await runCli(["update", "--id", "  ", "--title", "New"]);
    expect(res.code).not.toBe(0);
    expect(res.stdout).toBe("");
    expect(res.stderr).toContain("--id is required and must not be empty");
    expect(res.stderr).not.toMatch(NO_STACK_TRACE);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects update --title blank before any HTTP call", async () => {
    const res = await runCli(["update", "--id", "some-id", "--title", "   "]);
    expect(res.code).not.toBe(0);
    expect(res.stdout).toBe("");
    expect(res.stderr).toContain("--title is required and must not be empty");
    expect(res.stderr).not.toMatch(NO_STACK_TRACE);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects update --content blank before any HTTP call", async () => {
    const res = await runCli(["update", "--id", "some-id", "--content", ""]);
    expect(res.code).not.toBe(0);
    expect(res.stdout).toBe("");
    expect(res.stderr).toContain("--content is required and must not be empty");
    expect(res.stderr).not.toMatch(NO_STACK_TRACE);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects delete --id blank before any HTTP call", async () => {
    const res = await runCli(["delete", "--id", ""]);
    expect(res.code).not.toBe(0);
    expect(res.stdout).toBe("");
    expect(res.stderr).toContain("--id is required and must not be empty");
    expect(res.stderr).not.toMatch(NO_STACK_TRACE);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a missing (not just blank) --id before any HTTP call", async () => {
    const res = await runCli(["read"]);
    expect(res.code).not.toBe(0);
    expect(res.stdout).toBe("");
    expect(res.stderr).toContain("--id is required and must not be empty");
    expect(res.stderr).not.toMatch(NO_STACK_TRACE);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
