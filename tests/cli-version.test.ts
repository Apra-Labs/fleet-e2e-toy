/**
 * Integration tests for the --version / -v CLI flag.
 *
 * Tests call main(argv) in-process (no spawned server) and capture stdout
 * via jest.spyOn(process.stdout, 'write').
 */
import { main } from "../src/cli/index";

describe("--version flag", () => {
  let stdoutSpy: jest.SpyInstance;

  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation();
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
  });

  it("main(['--version']) returns 0 and prints version to stdout", async () => {
    const code = await main(["--version"]);
    expect(code).toBe(0);
    expect(stdoutSpy).toHaveBeenCalled();
    const output = stdoutSpy.mock.calls.map((c) => c[0]).join("");
    expect(output).toContain("noteapi v1.0.0");
  });

  it("main(['-v']) returns 0 and prints version to stdout", async () => {
    const code = await main(["-v"]);
    expect(code).toBe(0);
    expect(stdoutSpy).toHaveBeenCalled();
    const output = stdoutSpy.mock.calls.map((c) => c[0]).join("");
    expect(output).toContain("noteapi v1.0.0");
  });

  it("main(['list', '--version']) returns 0 and prints version", async () => {
    const code = await main(["list", "--version"]);
    expect(code).toBe(0);
    expect(stdoutSpy).toHaveBeenCalled();
    const output = stdoutSpy.mock.calls.map((c) => c[0]).join("");
    expect(output).toContain("noteapi v1.0.0");
  });
});
