import { main } from "../src/tool";
import { execSync } from "child_process";
import * as path from "path";

describe("CLI version flag unit tests", () => {
  let logSpy: jest.SpyInstance;
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit");
    });
  });

  afterEach(() => {
    logSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it("should print version and exit 0 for --version", () => {
    expect(() => main(["--version"])).toThrow("process.exit");
    expect(logSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0");
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it("should print version and exit 0 for -v", () => {
    expect(() => main(["-v"])).toThrow("process.exit");
    expect(logSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0");
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it("should print version and exit 0 if --version is alongside other arguments", () => {
    expect(() => main(["list", "--version"])).toThrow("process.exit");
    expect(logSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0");
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it("should print version and exit 0 if -v is alongside other arguments", () => {
    expect(() => main(["list", "-v", "--tag", "work"])).toThrow("process.exit");
    expect(logSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0");
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it("should do nothing (no log, no exit) if no version flag is specified", () => {
    main(["list"]);
    expect(logSpy).not.toHaveBeenCalled();
    expect(exitSpy).not.toHaveBeenCalled();
  });
});

describe("CLI help flag unit tests", () => {
  let logSpy: jest.SpyInstance;
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit");
    });
  });

  afterEach(() => {
    logSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it("should print global help and exit 0 for --help", () => {
    expect(() => main(["--help"])).toThrow("process.exit");
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: noteapi-cli [options] [command]"));
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it("should print global help and exit 0 for -h", () => {
    expect(() => main(["-h"])).toThrow("process.exit");
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: noteapi-cli [options] [command]"));
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it("should print list subcommand help and exit 0 for list --help", () => {
    expect(() => main(["list", "--help"])).toThrow("process.exit");
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: noteapi-cli list [options]"));
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it("should print read subcommand help and exit 0 for read -h", () => {
    expect(() => main(["read", "-h"])).toThrow("process.exit");
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: noteapi-cli read <id> [options]"));
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it("should print create subcommand help and exit 0 for create --help", () => {
    expect(() => main(["create", "--help"])).toThrow("process.exit");
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: noteapi-cli create <title> [content] [options]"));
    expect(exitSpy).toHaveBeenCalledWith(0);
  });
});

describe("CLI argument validation unit tests", () => {
  let errorSpy: jest.SpyInstance;
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit");
    });
  });

  afterEach(() => {
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it("should fail validation and exit 1 for empty string argument", () => {
    expect(() => main(["list", ""])).toThrow("process.exit");
    expect(errorSpy).toHaveBeenCalledWith("Error: Argument cannot be empty or whitespace-only.");
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("should fail validation and exit 1 for whitespace-only argument", () => {
    expect(() => main(["create", "   "])).toThrow("process.exit");
    expect(errorSpy).toHaveBeenCalledWith("Error: Argument cannot be empty or whitespace-only.");
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});

describe("CLI integration tests", () => {
  const toolCmd = path.join(__dirname, "../tool");

  it("executes ./tool -v successfully", () => {
    const stdout = execSync(`"${toolCmd}" -v`).toString().trim();
    expect(stdout).toBe("fleet-e2e-toy v1.0.0");
  });

  it("executes ./tool --version successfully", () => {
    const stdout = execSync(`"${toolCmd}" --version`).toString().trim();
    expect(stdout).toBe("fleet-e2e-toy v1.0.0");
  });

  it("executes ./tool list --version successfully", () => {
    const stdout = execSync(`"${toolCmd}" list --version`).toString().trim();
    expect(stdout).toBe("fleet-e2e-toy v1.0.0");
  });

  it("executes ./tool -h successfully", () => {
    const stdout = execSync(`"${toolCmd}" -h`).toString().trim();
    expect(stdout).toContain("Usage: noteapi-cli [options] [command]");
  });

  it("executes ./tool list --help successfully", () => {
    const stdout = execSync(`"${toolCmd}" list --help`).toString().trim();
    expect(stdout).toContain("Usage: noteapi-cli list [options]");
  });

  it("fails when passed an empty argument", () => {
    let error: unknown;
    try {
      execSync(`"${toolCmd}" list ""`);
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    const execError = error as { status: number; stderr: Buffer };
    expect(execError.status).not.toBe(0);
    expect(execError.stderr.toString()).toContain("Error: Argument cannot be empty or whitespace-only.");
    expect(execError.stderr.toString()).not.toContain("at ");
    expect(execError.stderr.toString()).not.toContain("tool.ts");
  });

  it("fails when passed a whitespace-only argument", () => {
    let error: unknown;
    try {
      execSync(`"${toolCmd}" create "   "`);
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    const execError = error as { status: number; stderr: Buffer };
    expect(execError.status).not.toBe(0);
    expect(execError.stderr.toString()).toContain("Error: Argument cannot be empty or whitespace-only.");
    expect(execError.stderr.toString()).not.toContain("at ");
    expect(execError.stderr.toString()).not.toContain("tool.ts");
  });
});
