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
});
