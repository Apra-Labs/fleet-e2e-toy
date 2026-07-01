/**
 * Integration tests for the CLI --version/-v flag.
 *
 * Strategy: invoke run() from src/cli/index capturing stdout/stderr and the
 * returned exit code. Tests verify output format and exit code behavior.
 */
import { run } from "../src/cli/index";

// Buffers for capturing process output
let stdoutCapture: string;
let stderrCapture: string;
let originalStdoutWrite: typeof process.stdout.write;
let originalStderrWrite: typeof process.stderr.write;

beforeEach(() => {
  stdoutCapture = "";
  stderrCapture = "";

  // Capture stdout
  originalStdoutWrite = process.stdout.write.bind(process.stdout);
  (process.stdout.write as unknown) = (chunk: string | Uint8Array): boolean => {
    stdoutCapture += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString();
    return true;
  };

  // Capture stderr
  originalStderrWrite = process.stderr.write.bind(process.stderr);
  (process.stderr.write as unknown) = (chunk: string | Uint8Array): boolean => {
    stderrCapture += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString();
    return true;
  };
});

afterEach(() => {
  process.stdout.write = originalStdoutWrite;
  process.stderr.write = originalStderrWrite;
});

// Helper to run CLI and return { exitCode, stdout, stderr }
async function cli(argv: string[]): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const exitCode = await run(argv);
  return { exitCode, stdout: stdoutCapture, stderr: stderrCapture };
}

describe("--version flag", () => {
  it("outputs version string and exits 0", async () => {
    const result = await cli(["--version"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toMatch(/fleet-e2e-toy v\d+\.\d+\.\d+/);
    expect(result.stdout).toBe("fleet-e2e-toy v1.0.0\n");
    expect(result.stderr).toBe("");
  });

  it("-v short flag outputs version string and exits 0", async () => {
    const result = await cli(["-v"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toMatch(/fleet-e2e-toy v\d+\.\d+\.\d+/);
    expect(result.stdout).toBe("fleet-e2e-toy v1.0.0\n");
    expect(result.stderr).toBe("");
  });

  it("version flag exits 0 when combined with another flag", async () => {
    const result = await cli(["--version", "--json"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe("fleet-e2e-toy v1.0.0\n");
    expect(result.stderr).toBe("");
  });

  it("-v short flag exits 0 when combined with another flag", async () => {
    const result = await cli(["-v", "--json"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe("fleet-e2e-toy v1.0.0\n");
    expect(result.stderr).toBe("");
  });
});
