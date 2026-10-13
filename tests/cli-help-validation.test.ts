import { run } from "../src/cli/index";

// Integration test asserting: global and per-subcommand --help/-h print
// usage and exit 0; empty/whitespace-only required args are rejected with a
// non-zero exit code and a clear message; error output contains no stack
// traces.
describe("CLI help output and input validation", () => {
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

  function noStackTraces(spy: jest.SpyInstance): void {
    for (const call of spy.mock.calls) {
      expect(String(call[0])).not.toMatch(/at .+\(.+:\d+:\d+\)/);
    }
  }

  describe("--help / -h", () => {
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

    it("prints subcommand usage and exits 0 for 'read --help'", async () => {
      const code = await run(["read", "--help"]);

      expect(code).toBe(0);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: noteapi-cli read"));
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it("prints subcommand usage and exits 0 for 'create -h'", async () => {
      const code = await run(["create", "-h"]);

      expect(code).toBe(0);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: noteapi-cli create"));
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it("does not leak stack traces via help output", async () => {
      const code = await run(["--help"]);

      expect(code).toBe(0);
      noStackTraces(logSpy);
    });
  });

  describe("empty/whitespace-only required args", () => {
    it("rejects an empty --id for read with a non-zero exit code and a clear message", async () => {
      const code = await run(["read", "--id", ""]);

      expect(code).toBe(1);
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: read --id"));
    });

    it("rejects a whitespace-only --id for read with a non-zero exit code and a clear message", async () => {
      const code = await run(["read", "--id", "   "]);

      expect(code).toBe(1);
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: read --id"));
    });

    it("rejects an empty --title for create with a non-zero exit code and a clear message", async () => {
      const code = await run(["create", "--title", "", "--content", "C"]);

      expect(code).toBe(1);
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: create"));
    });

    it("rejects a whitespace-only --content for create with a non-zero exit code and a clear message", async () => {
      const code = await run(["create", "--title", "T", "--content", "   "]);

      expect(code).toBe(1);
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: create"));
    });

    it("rejects a whitespace-only --id for delete with a non-zero exit code and a clear message", async () => {
      const code = await run(["delete", "--id", "   "]);

      expect(code).toBe(1);
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: delete --id"));
    });

    it("does not leak stack traces on validation errors", async () => {
      const code = await run(["read", "--id", "   "]);

      expect(code).toBe(1);
      noStackTraces(errorSpy);
    });
  });
});
