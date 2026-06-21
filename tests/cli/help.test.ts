import { main } from "../../src/cli/cli";

describe("CLI help system", () => {
  it("--help prints global help and exits 0", async () => {
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

    const exitCode = await main(["--help"]);

    process.stdout.write = origStdoutWrite;
    process.stderr.write = origStderrWrite;

    expect(exitCode).toBe(0);
    const output = stdoutChunks.join("");
    expect(output).toContain("list");
    expect(output).toContain("read");
    expect(output).toContain("create");
    expect(output).toContain("update");
    expect(output).toContain("delete");
  });

  it("-h prints global help and exits 0", async () => {
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

    const exitCode = await main(["-h"]);

    process.stdout.write = origStdoutWrite;
    process.stderr.write = origStderrWrite;

    expect(exitCode).toBe(0);
    const output = stdoutChunks.join("");
    expect(output).toContain("list");
    expect(output).toContain("read");
    expect(output).toContain("create");
    expect(output).toContain("update");
    expect(output).toContain("delete");
  });

  it("create --help prints create command help and exits 0", async () => {
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

    const exitCode = await main(["create", "--help"]);

    process.stdout.write = origStdoutWrite;
    process.stderr.write = origStderrWrite;

    expect(exitCode).toBe(0);
    const output = stdoutChunks.join("");
    expect(output).toContain("--title");
    expect(output).toContain("--content");
  });

  it("create -h prints create command help and exits 0", async () => {
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

    const exitCode = await main(["create", "-h"]);

    process.stdout.write = origStdoutWrite;
    process.stderr.write = origStderrWrite;

    expect(exitCode).toBe(0);
    const output = stdoutChunks.join("");
    expect(output).toContain("--title");
    expect(output).toContain("--content");
  });
});
