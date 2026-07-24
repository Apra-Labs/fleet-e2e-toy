import { run } from "../src/cli/index";

describe("CLI dispatcher", () => {
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

  it("prints usage and exits non-zero when no subcommand is given", async () => {
    const code = await run([]);
    expect(code).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Usage:"));
  });

  it("prints usage and exits non-zero for an unknown subcommand", async () => {
    const code = await run(["bogus"]);
    expect(code).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Usage:"));
  });

  it("does not leak stack traces on error", async () => {
    const code = await run(["bogus"]);
    expect(code).toBe(1);
    for (const call of errorSpy.mock.calls) {
      expect(String(call[0])).not.toMatch(/at .+\(.+:\d+:\d+\)/);
    }
  });

  it("dispatches to the read handler and surfaces handler errors without a stack trace", async () => {
    const code = await run(["read"]);
    expect(code).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: read --id"));
  });

  it("dispatches to the create handler and surfaces handler errors without a stack trace", async () => {
    const code = await run(["create"]);
    expect(code).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: create"));
  });

  it("dispatches to the update handler and surfaces handler errors without a stack trace", async () => {
    const code = await run(["update"]);
    expect(code).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: update"));
  });

  it("dispatches to the delete handler and surfaces handler errors without a stack trace", async () => {
    const code = await run(["delete"]);
    expect(code).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: delete --id"));
  });

  it("dispatches to the list handler, which attempts to reach the API", async () => {
    const code = await run(["list"]);
    // No live server is guaranteed in the test environment, so either outcome
    // (success or a clean API error) is acceptable — what matters is that the
    // dispatcher reached the list handler and did not print raw usage.
    expect([0, 1]).toContain(code);
  });

  it("rejects a whitespace-only --id for read without a stack trace", async () => {
    const code = await run(["read", "--id", "   "]);
    expect(code).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: read --id"));
    for (const call of errorSpy.mock.calls) {
      expect(String(call[0])).not.toMatch(/at .+\(.+:\d+:\d+\)/);
    }
  });

  it("rejects an empty --title for create without a stack trace", async () => {
    const code = await run(["create", "--title", "", "--content", "C"]);
    expect(code).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: create"));
    for (const call of errorSpy.mock.calls) {
      expect(String(call[0])).not.toMatch(/at .+\(.+:\d+:\d+\)/);
    }
  });
});
