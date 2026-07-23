import { main } from "../src/cli/index";

describe("CLI --version flag", () => {
  let stdoutSpy: jest.SpiedFunction<typeof process.stdout.write>;
  let fetchSpy: jest.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
    fetchSpy = jest.spyOn(global, "fetch");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("'--version' prints 'fleet-e2e-toy v1.0.0' and exits 0", async () => {
    const code = await main(["--version"]);

    expect(code).toBe(0);
    expect(stdoutSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0\n");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("'-v' behaves identically to '--version'", async () => {
    const code = await main(["-v"]);

    expect(code).toBe(0);
    expect(stdoutSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0\n");
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
