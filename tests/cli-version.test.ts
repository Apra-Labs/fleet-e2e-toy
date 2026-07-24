import { run } from "../src/cli/index";

describe("CLI --version flag", () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("--version flag prints version string and exits 0", async () => {
    const code = await run(["--version"]);
    expect(code).toBe(0);
    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/^noteapi v\S+$/));
  });

  it("-v flag prints version string and exits 0", async () => {
    const code = await run(["-v"]);
    expect(code).toBe(0);
    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/^noteapi v\S+$/));
  });
});
