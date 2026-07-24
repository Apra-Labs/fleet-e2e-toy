import { run } from "../src/cli/index";

describe("CLI help", () => {
  let errorSpy: jest.SpyInstance;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    logSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    errorSpy.mockRestore();
    logSpy.mockRestore();
  });

  it("prints global usage and exits 0 for --help", async () => {
    const code = await run(["--help"]);
    expect(code).toBe(0);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: noteapi-cli"));
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("prints global usage and exits 0 for -h", async () => {
    const code = await run(["-h"]);
    expect(code).toBe(0);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: noteapi-cli"));
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it.each(["list", "read", "create", "update", "delete"])(
    "prints subcommand usage and exits 0 for '%s --help'",
    async (subcommand) => {
      const code = await run([subcommand, "--help"]);
      expect(code).toBe(0);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(`Usage: noteapi-cli ${subcommand}`));
      expect(errorSpy).not.toHaveBeenCalled();
    }
  );

  it("prints subcommand usage and exits 0 for '-h' after other args", async () => {
    const code = await run(["read", "--id", "abc", "-h"]);
    expect(code).toBe(0);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: noteapi-cli read"));
  });

  it("does not leak stack traces via help output", async () => {
    const code = await run(["--help"]);
    expect(code).toBe(0);
    for (const call of logSpy.mock.calls) {
      expect(String(call[0])).not.toMatch(/at .+\(.+:\d+:\d+\)/);
    }
  });
});
