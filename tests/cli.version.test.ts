// Tests for the CLI's --version/-v flag.
//
// The version flag is a pure local operation (no network call needed).
// Like help, it must be resolved before any subcommand dispatch or validation.
// It works standalone or alongside other flags.
//
// run() (the CLI's exported entry point) is invoked directly, matching the
// approach in tests/cli.crud.test.ts and tests/cli.help-validation.test.ts,
// so stdout/stderr and the exit code can be asserted without shell-quoting overhead.

import { run } from "../src/cli";

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

describe("CLI --version/-v", () => {
  it.each(["--version", "-v"])(
    "exits 0 with exact output 'fleet-e2e-toy v1.0.0' for %s standalone",
    async (flag) => {
      const res = await runCli([flag]);
      expect(res.code).toBe(0);
      expect(res.stdout).toBe("fleet-e2e-toy v1.0.0\n");
      expect(res.stderr).toBe("");
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it("exits 0 for --version alongside another flag (no network call)", async () => {
    const res = await runCli(["list", "--version"]);
    expect(res.code).toBe(0);
    expect(res.stdout).toBe("fleet-e2e-toy v1.0.0\n");
    expect(res.stderr).toBe("");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("exits 0 for -v alongside another flag (no network call)", async () => {
    const res = await runCli(["create", "-v", "--title", "Test"]);
    expect(res.code).toBe(0);
    expect(res.stdout).toBe("fleet-e2e-toy v1.0.0\n");
    expect(res.stderr).toBe("");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("exits 0 for --version as first argument with multiple flags following", async () => {
    const res = await runCli(["--version", "read", "--id", "123"]);
    expect(res.code).toBe(0);
    expect(res.stdout).toBe("fleet-e2e-toy v1.0.0\n");
    expect(res.stderr).toBe("");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("exits 0 for -v as first argument with multiple flags following", async () => {
    const res = await runCli(["-v", "update", "--id", "456"]);
    expect(res.code).toBe(0);
    expect(res.stdout).toBe("fleet-e2e-toy v1.0.0\n");
    expect(res.stderr).toBe("");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("exits 0 for --version and --help together (version takes precedence)", async () => {
    const res = await runCli(["--version", "--help"]);
    expect(res.code).toBe(0);
    expect(res.stdout).toBe("fleet-e2e-toy v1.0.0\n");
    expect(res.stderr).toBe("");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
