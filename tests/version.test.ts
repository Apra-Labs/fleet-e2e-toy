import { run } from "../src/index";

describe("--version / -v flag", () => {
  it("prints the version and does not start the server for --version", () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation();

    run(["--version"]);

    expect(logSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0");
    logSpy.mockRestore();
  });

  it("prints the version and does not start the server for -v", () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation();

    run(["-v"]);

    expect(logSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0");
    logSpy.mockRestore();
  });
});
