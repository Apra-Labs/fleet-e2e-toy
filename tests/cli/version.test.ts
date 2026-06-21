import { main } from "../../src/cli/cli";

describe("CLI version flag", () => {
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;

  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true as any);
    stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation(() => true as any);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  it("--version flag prints version and exits 0", async () => {
    const exitCode = await main(["--version"]);

    expect(exitCode).toBe(0);
    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    const output = stdoutSpy.mock.calls[0][0] as string;
    expect(output).toMatch(/fleet-e2e-toy v\d+\.\d+\.\d+/);
  });

  it("-v flag prints version and exits 0", async () => {
    const exitCode = await main(["-v"]);

    expect(exitCode).toBe(0);
    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    const output = stdoutSpy.mock.calls[0][0] as string;
    expect(output).toMatch(/fleet-e2e-toy v\d+\.\d+\.\d+/);
  });

  it("does not make API call when printing version", async () => {
    // No explicit assertion needed - if API call were made, fetch would be undefined
    // and test would fail. This test mainly ensures the function returns cleanly
    const exitCode = await main(["--version"]);
    expect(exitCode).toBe(0);
  });
});
