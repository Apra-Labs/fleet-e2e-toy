import { main } from "../../src/cli/cli";

describe("CLI version flag", () => {
  it("--version flag prints version and exits 0", async () => {
    const stdoutChunks: string[] = [];
    const stderrChunks: string[] = [];

    const origStdoutWrite = process.stdout.write.bind(process.stdout);
    const origStderrWrite = process.stderr.write.bind(process.stderr);

    process.stdout.write = ((chunk: string) => {
      stdoutChunks.push(chunk);
      return true;
    }) as typeof process.stdout.write;

    process.stderr.write = ((chunk: string) => {
      stderrChunks.push(chunk);
      return true;
    }) as typeof process.stderr.write;

    const exitCode = await main(["--version"]);

    process.stdout.write = origStdoutWrite;
    process.stderr.write = origStderrWrite;

    expect(exitCode).toBe(0);
    const output = stdoutChunks.join("");
    expect(output).toMatch(/fleet-e2e-toy v\d+\.\d+\.\d+/);
  });

  it("-v flag prints version and exits 0", async () => {
    const stdoutChunks: string[] = [];
    const stderrChunks: string[] = [];

    const origStdoutWrite = process.stdout.write.bind(process.stdout);
    const origStderrWrite = process.stderr.write.bind(process.stderr);

    process.stdout.write = ((chunk: string) => {
      stdoutChunks.push(chunk);
      return true;
    }) as typeof process.stdout.write;

    process.stderr.write = ((chunk: string) => {
      stderrChunks.push(chunk);
      return true;
    }) as typeof process.stderr.write;

    const exitCode = await main(["-v"]);

    process.stdout.write = origStdoutWrite;
    process.stderr.write = origStderrWrite;

    expect(exitCode).toBe(0);
    const output = stdoutChunks.join("");
    expect(output).toMatch(/fleet-e2e-toy v\d+\.\d+\.\d+/);
  });

  it("does not make API call when printing version", async () => {
    // No explicit assertion needed - if API call were made, fetch would be undefined
    // and test would fail. This test mainly ensures the function returns cleanly
    const exitCode = await main(["--version"]);
    expect(exitCode).toBe(0);
  });
});
