import { main } from "../src/cli";

describe("CLI --version", () => {
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;

  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
    stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  it("prints version and exits 0 for --version", async () => {
    const code = await main(["--version"]);
    expect(code).toBe(0);
    expect(stdoutSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0\n");
  });

  it("prints version and exits 0 for -v", async () => {
    const code = await main(["-v"]);
    expect(code).toBe(0);
    expect(stdoutSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0\n");
  });

  it("errors when no command is provided", async () => {
    const code = await main([]);
    expect(code).toBe(1);
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("Error:"));
  });

  it("errors on unknown command", async () => {
    const code = await main(["bogus"]);
    expect(code).toBe(1);
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("Error:"));
  });
});
