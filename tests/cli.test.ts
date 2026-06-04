import { runCli } from "../src/cli";

describe("CLI version flag", () => {
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("prints version with --version", () => {
    const result = runCli(["--version"]);
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain("fleet-e2e-toy v1.0.0");
  });

  it("prints version with -v", () => {
    const result = runCli(["-v"]);
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain("fleet-e2e-toy v1.0.0");
  });

  it("prints version even if other arguments are present", () => {
    const result = runCli(["some-arg", "--version", "another-arg"]);
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain("fleet-e2e-toy v1.0.0");
  });
});
