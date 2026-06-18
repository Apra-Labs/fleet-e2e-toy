import { run } from "../src/cli/run";

describe("run (placeholder)", () => {
  let stdoutChunks: string[];
  let stderrChunks: string[];
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;

  beforeEach(() => {
    stdoutChunks = [];
    stderrChunks = [];
    stdoutSpy = jest
      .spyOn(process.stdout, "write")
      .mockImplementation((chunk: unknown) => {
        stdoutChunks.push(String(chunk));
        return true;
      });
    stderrSpy = jest
      .spyOn(process.stderr, "write")
      .mockImplementation((chunk: unknown) => {
        stderrChunks.push(String(chunk));
        return true;
      });
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  it("returns exit code 0 for a basic command", async () => {
    const code = await run(["somecommand"]);
    expect(code).toBe(0);
  });

  it("prints human-readable text in default (non-json) mode", async () => {
    await run(["somecommand"]);
    const output = stdoutChunks.join("");
    expect(output).toContain("somecommand");
    expect(stderrChunks).toHaveLength(0);
  });

  it("prints valid JSON in --json mode", async () => {
    await run(["--json", "somecommand"]);
    const output = stdoutChunks.join("").trim();
    const parsed = JSON.parse(output);
    expect(parsed).toBeDefined();
    expect(typeof parsed).toBe("object");
  });

  it("includes command name in JSON output", async () => {
    await run(["--json", "mycommand"]);
    const output = stdoutChunks.join("").trim();
    const parsed = JSON.parse(output) as Record<string, unknown>;
    expect(parsed.command).toBe("mycommand");
  });

  it("handles no command gracefully in text mode", async () => {
    const code = await run([]);
    expect(code).toBe(0);
    const output = stdoutChunks.join("");
    expect(output).toContain("(none)");
  });

  it("handles no command in JSON mode", async () => {
    const code = await run(["--json"]);
    expect(code).toBe(0);
    const output = stdoutChunks.join("").trim();
    const parsed = JSON.parse(output) as Record<string, unknown>;
    expect(parsed.command).toBeNull();
  });
});
