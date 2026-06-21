/**
 * Test SIGINT (Ctrl-C) graceful handling.
 *
 * The SIGINT handler is registered at module load time in cli.ts.
 * We test it by directly emitting the SIGINT signal and verifying
 * that 'Interrupted.' is written to stderr and process.exit is called
 * with exit code 130.
 */

// Import cli.ts to register the SIGINT handler
import "../../src/cli/cli";

describe("SIGINT graceful handling", () => {
  let stderrOutput: string;
  let exitCode: number | undefined;
  let origStderrWrite: typeof process.stderr.write;
  let origExit: typeof process.exit;

  beforeEach(() => {
    stderrOutput = "";
    exitCode = undefined;

    origStderrWrite = process.stderr.write.bind(process.stderr);
    origExit = process.exit.bind(process);

    process.stderr.write = ((chunk: string) => {
      stderrOutput += chunk;
      return true;
    }) as typeof process.stderr.write;

    process.exit = ((code?: number) => {
      exitCode = code;
      // Throw to stop execution in the handler (instead of really exiting)
      throw new Error(`process.exit(${code})`);
    }) as typeof process.exit;
  });

  afterEach(() => {
    process.stderr.write = origStderrWrite;
    process.exit = origExit;
  });

  it("prints 'Interrupted.' to stderr on SIGINT", () => {
    try {
      process.emit("SIGINT");
    } catch {
      // expected: process.exit throws in our mock
    }
    expect(stderrOutput).toContain("Interrupted.");
  });

  it("exits with code 130 on SIGINT", () => {
    try {
      process.emit("SIGINT");
    } catch {
      // expected: process.exit throws in our mock
    }
    expect(exitCode).toBe(130);
  });

  it("does not produce a stack trace on SIGINT", () => {
    try {
      process.emit("SIGINT");
    } catch {
      // expected: process.exit throws in our mock
    }
    // No 'Error:' or 'at ' lines — just 'Interrupted.'
    expect(stderrOutput).not.toMatch(/Error:/);
    expect(stderrOutput).not.toMatch(/\bat\b\s+\w/);
  });
});
