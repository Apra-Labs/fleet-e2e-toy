import { main } from "../src/tool";
import { execSync, spawnSync } from "child_process";
import * as path from "path";

beforeAll(() => {
  jest.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));
});

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
    const res = spawnSync(toolCmd, ["-v"], { encoding: "utf-8" });
    expect(res.status).toBe(0);
    expect(res.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("executes ./tool --version successfully", () => {
    const res = spawnSync(toolCmd, ["--version"], { encoding: "utf-8" });
    expect(res.status).toBe(0);
    expect(res.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("executes ./tool list --version successfully", () => {
    const res = spawnSync(toolCmd, ["list", "--version"], { encoding: "utf-8" });
    expect(res.status).toBe(0);
    expect(res.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("executes ./tool create \"some note\" -v successfully", () => {
    const res = spawnSync(toolCmd, ["create", "some note", "-v"], { encoding: "utf-8" });
    expect(res.status).toBe(0);
    expect(res.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("executes ./tool --help successfully", () => {
    const res = spawnSync(toolCmd, ["--help"], { encoding: "utf-8" });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("Usage: noteapi-cli [options] [command]");
  });

  it("executes ./tool -h successfully", () => {
    const res = spawnSync(toolCmd, ["-h"], { encoding: "utf-8" });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("Usage: noteapi-cli [options] [command]");
  });

  it("executes ./tool list --help successfully", () => {
    const res = spawnSync(toolCmd, ["list", "--help"], { encoding: "utf-8" });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("Usage: noteapi-cli list [options]");
  });

  it("executes ./tool read -h successfully", () => {
    const res = spawnSync(toolCmd, ["read", "-h"], { encoding: "utf-8" });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("Usage: noteapi-cli read <id> [options]");
  });

  it("executes ./tool create --help successfully", () => {
    const res = spawnSync(toolCmd, ["create", "--help"], { encoding: "utf-8" });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("Usage: noteapi-cli create <title> [content] [options]");
  });

  it("executes ./tool update -h successfully", () => {
    const res = spawnSync(toolCmd, ["update", "-h"], { encoding: "utf-8" });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("Usage: noteapi-cli update <id> [options]");
  });

  it("executes ./tool delete -h successfully", () => {
    const res = spawnSync(toolCmd, ["delete", "-h"], { encoding: "utf-8" });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("Usage: noteapi-cli delete <id> [options]");
  });

  it("fails when passed an empty argument", () => {
    const res = spawnSync(toolCmd, ["list", ""], { encoding: "utf-8" });
    expect(res.status).not.toBe(0);
    expect(res.stderr).toContain("Error: Argument cannot be empty or whitespace-only.");
    expect(res.stderr).not.toContain("at ");
    expect(res.stderr).not.toContain("tool.ts");
  });

  it("fails when passed a whitespace-only argument", () => {
    const res = spawnSync(toolCmd, ["create", "   "], { encoding: "utf-8" });
    expect(res.status).not.toBe(0);
    expect(res.stderr).toContain("Error: Argument cannot be empty or whitespace-only.");
    expect(res.stderr).not.toContain("at ");
    expect(res.stderr).not.toContain("tool.ts");
  });

  it("fails validation for missing subcommand", () => {
    const res = spawnSync(toolCmd, [], { encoding: "utf-8" });
    expect(res.status).not.toBe(0);
    expect(res.stderr).toContain("Error: Subcommand is required.");
    expect(res.stderr).not.toContain("at ");
    expect(res.stderr).not.toContain("tool.ts");
  });

  it("fails validation for unknown subcommand", () => {
    const res = spawnSync(toolCmd, ["unknowncmd"], { encoding: "utf-8" });
    expect(res.status).not.toBe(0);
    expect(res.stderr).toContain("Error: Unknown subcommand: unknowncmd");
    expect(res.stderr).not.toContain("at ");
    expect(res.stderr).not.toContain("tool.ts");
  });

  it("fails validation for read command without ID", () => {
    const res = spawnSync(toolCmd, ["read"], { encoding: "utf-8" });
    expect(res.status).not.toBe(0);
    expect(res.stderr).toContain("Error: ID is required.");
    expect(res.stderr).not.toContain("at ");
    expect(res.stderr).not.toContain("tool.ts");
  });

  it("fails validation for create command without title", () => {
    const res = spawnSync(toolCmd, ["create"], { encoding: "utf-8" });
    expect(res.status).not.toBe(0);
    expect(res.stderr).toContain("Error: Title is required.");
    expect(res.stderr).not.toContain("at ");
    expect(res.stderr).not.toContain("tool.ts");
  });

  it("fails validation for update command without ID", () => {
    const res = spawnSync(toolCmd, ["update"], { encoding: "utf-8" });
    expect(res.status).not.toBe(0);
    expect(res.stderr).toContain("Error: ID is required.");
    expect(res.stderr).not.toContain("at ");
    expect(res.stderr).not.toContain("tool.ts");
  });

  it("fails validation for delete command without ID", () => {
    const res = spawnSync(toolCmd, ["delete"], { encoding: "utf-8" });
    expect(res.status).not.toBe(0);
    expect(res.stderr).toContain("Error: ID is required.");
    expect(res.stderr).not.toContain("at ");
    expect(res.stderr).not.toContain("tool.ts");
  });
});

