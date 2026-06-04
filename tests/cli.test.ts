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

describe("CLI help command and flags", () => {
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

  const assertHelpOutput = (result: { exitCode: number; output: string }) => {
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain("Usage: fleet-e2e-toy [command] [options]");
    expect(result.output).toContain("help");
    expect(result.output).toContain("-h, --help");
    expect(result.output).toContain("-v, --version");
  };

  it("prints help with help subcommand", () => {
    const result = runCli(["help"]);
    assertHelpOutput(result);
  });

  it("prints help with --help flag", () => {
    const result = runCli(["--help"]);
    assertHelpOutput(result);
  });

  it("prints help with -h flag", () => {
    const result = runCli(["-h"]);
    assertHelpOutput(result);
  });
});

describe("CLI argument validation", () => {
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

  it("rejects empty string argument", () => {
    const result = runCli([""]);
    expect(result.exitCode).toBe(1);
    expect(result.errorOutput).toContain("Argument cannot be empty or blank string");
  });

  it("rejects whitespace-only string argument", () => {
    const result = runCli(["   "]);
    expect(result.exitCode).toBe(1);
    expect(result.errorOutput).toContain("Argument cannot be empty or blank string");
  });

  it("rejects empty string in a list of arguments", () => {
    const result = runCli(["help", ""]);
    expect(result.exitCode).toBe(1);
    expect(result.errorOutput).toContain("Argument cannot be empty or blank string");
  });
});


