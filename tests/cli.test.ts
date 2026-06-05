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
});
