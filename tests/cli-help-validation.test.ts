import { spawnSync } from "child_process";
import * as http from "http";
import path from "path";
import app from "../src/app";
import { noteStore } from "../src/models/note";
import { createCommand } from "../src/cli/commands/create";
import { readCommand } from "../src/cli/commands/read";

// ── Spawn helper (for help tests) ──────────────────────────────────────────

const CLI_PATH = path.resolve(__dirname, "../src/cli/index.ts");

const isWindows = process.platform === "win32";
const TS_NODE = path.resolve(
  __dirname,
  isWindows ? "../node_modules/.bin/ts-node.cmd" : "../node_modules/.bin/ts-node"
);

function runCLI(args: string[]): { stdout: string; stderr: string; status: number } {
  const result = spawnSync(TS_NODE, [CLI_PATH, ...args], {
    encoding: "utf8",
    timeout: 15000,
    shell: isWindows,
  });
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    status: result.status ?? 1,
  };
}

// ── In-process capture helper (for validation tests) ───────────────────────

let server: http.Server;

beforeAll((done) => {
  server = app.listen(0, () => {
    const addr = server.address();
    const port = typeof addr === "object" && addr ? addr.port : 3000;
    process.env.API_BASE_URL = `http://localhost:${port}`;
    done();
  });
});

afterAll((done) => {
  delete process.env.API_BASE_URL;
  server.close(done);
});

beforeEach(() => {
  noteStore.clear();
});

function captureOutput(
  fn: () => Promise<number>
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";

    const origStdout = process.stdout.write.bind(process.stdout);
    const origStderr = process.stderr.write.bind(process.stderr);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (process.stdout.write as any) = (chunk: string) => {
      stdout += chunk;
      return true;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (process.stderr.write as any) = (chunk: string) => {
      stderr += chunk;
      return true;
    };

    fn()
      .then((exitCode) => {
        process.stdout.write = origStdout;
        process.stderr.write = origStderr;
        resolve({ stdout, stderr, exitCode });
      })
      .catch((err: unknown) => {
        process.stdout.write = origStdout;
        process.stderr.write = origStderr;
        resolve({ stdout, stderr, exitCode: 1 });
        void err;
      });
  });
}

// ── Help tests ──────────────────────────────────────────────────────────────

describe("CLI help output", () => {
  it("--help exits 0 and stdout lists all five subcommands and the --version flag", () => {
    const { stdout, status } = runCLI(["--help"]);
    expect(status).toBe(0);
    expect(stdout).toContain("list");
    expect(stdout).toContain("read");
    expect(stdout).toContain("create");
    expect(stdout).toContain("update");
    expect(stdout).toContain("delete");
    expect(stdout).toContain("--version");
  });

  it("-h exits 0 and stdout lists all five subcommands and the --version flag", () => {
    const { stdout, status } = runCLI(["-h"]);
    expect(status).toBe(0);
    expect(stdout).toContain("list");
    expect(stdout).toContain("read");
    expect(stdout).toContain("create");
    expect(stdout).toContain("update");
    expect(stdout).toContain("delete");
    expect(stdout).toContain("--version");
  });

  it("'create --help' exits 0 and mentions --title and --content", () => {
    const { stdout, status } = runCLI(["create", "--help"]);
    expect(status).toBe(0);
    expect(stdout).toContain("--title");
    expect(stdout).toContain("--content");
  });

  it("'create -h' exits 0 and mentions --title and --content", () => {
    const { stdout, status } = runCLI(["create", "-h"]);
    expect(status).toBe(0);
    expect(stdout).toContain("--title");
    expect(stdout).toContain("--content");
  });
});

// ── Validation tests ────────────────────────────────────────────────────────

describe("CLI input validation", () => {
  it("create with blank --title exits non-zero, stderr contains 'must not be empty', and no stack trace", async () => {
    const { stderr, exitCode } = await captureOutput(() =>
      createCommand(["--title", "   ", "--content", "x"])
    );
    expect(exitCode).not.toBe(0);
    expect(stderr).toContain("must not be empty");
    // No stack trace frames
    expect(stderr).not.toMatch(/\s+at\s+/);
    expect(stderr).not.toMatch(/Error:\s*\n/);
  });

  it("read with empty --id exits non-zero, stderr has a clear message, and no stack trace", async () => {
    // Pass '--id' followed by empty string to trigger blank validation
    const { stderr, exitCode } = await captureOutput(() =>
      readCommand(["--id", ""])
    );
    expect(exitCode).not.toBe(0);
    // Should have some message (either the blank-check message or missing flag message)
    expect(stderr.length).toBeGreaterThan(0);
    // No stack trace frames
    expect(stderr).not.toMatch(/\s+at\s+/);
    expect(stderr).not.toMatch(/Error:\s*\n/);
  });

  it("create with valid non-blank values exits 0", async () => {
    const { exitCode } = await captureOutput(() =>
      createCommand(["--title", "Valid Title", "--content", "Valid content"])
    );
    expect(exitCode).toBe(0);
  });
});
