import { main } from "../src/cli";

describe("CLI main entry point", () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("should return 0 on successful execution", () => {
    const result = main([]);
    expect(result).toBe(0);
    expect(logSpy).not.toHaveBeenCalled();
  });

  it("should print version when -v is passed", () => {
    const result = main(["-v"]);
    expect(result).toBe(0);
    expect(logSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0");
  });

  it("should print version when --version is passed", () => {
    const result = main(["--version"]);
    expect(result).toBe(0);
    expect(logSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0");
  });

  it("should print version when -v is present anywhere in argv", () => {
    const result = main(["some", "other", "-v", "args"]);
    expect(result).toBe(0);
    expect(logSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0");
  });

  it("should print help when help is passed", () => {
    const result = main(["help"]);
    expect(result).toBe(0);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("fleet-e2e-toy CLI"));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Usage:"));
  });

  it("should print help when --help is passed", () => {
    const result = main(["--help"]);
    expect(result).toBe(0);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("fleet-e2e-toy CLI"));
  });

  it("should print help when -h is passed", () => {
    const result = main(["-h"]);
    expect(result).toBe(0);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("fleet-e2e-toy CLI"));
  });

  describe("empty or blank argument validation", () => {
    let errorSpy: jest.SpyInstance;

    beforeEach(() => {
      errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      errorSpy.mockRestore();
    });

    it("should return 1 and print error when empty string is passed as an argument", () => {
      const result = main([""]);
      expect(result).toBe(1);
      expect(errorSpy).toHaveBeenCalledWith("Error: Command-line arguments cannot be empty or blank.");
    });

    it("should return 1 and print error when whitespace-only string is passed as an argument", () => {
      const result = main(["   "]);
      expect(result).toBe(1);
      expect(errorSpy).toHaveBeenCalledWith("Error: Command-line arguments cannot be empty or blank.");
    });

    it("should return 1 and print error when any argument is empty or blank", () => {
      const result = main(["valid", "", "args"]);
      expect(result).toBe(1);
      expect(errorSpy).toHaveBeenCalledWith("Error: Command-line arguments cannot be empty or blank.");
    });

    it("should bypass validation and return 0 when -v or --version is present", () => {
      const result = main(["", "-v"]);
      expect(result).toBe(0);
      expect(logSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0");
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it("should bypass validation and return 0 when help is present", () => {
      const result = main(["", "help"]);
      expect(result).toBe(0);
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });
});

