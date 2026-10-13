import { run } from "../src/cli";

describe("CLI Version Flags", () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("should print version and return 0 for --version flag", async () => {
    const code = await run(["--version"]);
    expect(code).toBe(0);
    expect(logSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0");
  });

  it("should print version and return 0 for -v flag", async () => {
    const code = await run(["-v"]);
    expect(code).toBe(0);
    expect(logSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0");
  });

  it("should handle version flag when mixed with other arguments", async () => {
    const code = await run(["--verbose", "-v", "extra-arg"]);
    expect(code).toBe(0);
    expect(logSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0");
  });

  it("should handle version flag mixed with other flags in different order", async () => {
    const code = await run(["--version", "--dry-run"]);
    expect(code).toBe(0);
    expect(logSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0");
  });
});
