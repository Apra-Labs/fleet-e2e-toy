import { main } from "../src/cli/index";

/**
 * End-to-end integration coverage for the CLI's help system and input
 * validation, tying together the acceptance criteria of gh-toy-7rp:
 *  - '--help', '-h', and extra-whitespace invocations print usage and exit 0.
 *  - Empty/whitespace-only values for required flags produce a clear stderr
 *    error and a non-zero exit, with no stack trace.
 *  - An unknown subcommand exits non-zero with a usage hint.
 */
describe("CLI help output and input validation (end-to-end)", () => {
  let fetchSpy: jest.SpiedFunction<typeof fetch>;
  let stdoutSpy: jest.SpiedFunction<typeof process.stdout.write>;
  let stderrSpy: jest.SpiedFunction<typeof process.stderr.write>;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, "fetch");
    stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
    stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function stdout(): string {
    return stdoutSpy.mock.calls.map((c) => c[0]).join("");
  }

  function stderr(): string {
    return stderrSpy.mock.calls.map((c) => c[0]).join("");
  }

  describe("help flags", () => {
    it("'tool --help' prints usage and exits 0", async () => {
      const code = await main(["--help"]);

      expect(code).toBe(0);
      expect(stdout()).toContain("Usage:");
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("'tool -h' prints usage and exits 0", async () => {
      const code = await main(["-h"]);

      expect(code).toBe(0);
      expect(stdout()).toContain("Usage:");
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("'tool  --help' (extra whitespace between tokens) prints usage and exits 0", async () => {
      // Shells collapse repeated whitespace between arguments before the
      // process ever sees argv, so invoking with an extra space between the
      // tool name and --help is equivalent to a single argv entry of
      // "--help" -- verify that still resolves correctly.
      const rawInvocation = "tool  --help";
      const argv = rawInvocation.split(/\s+/).slice(1);
      expect(argv).toEqual(["--help"]);

      const code = await main(argv);

      expect(code).toBe(0);
      expect(stdout()).toContain("Usage:");
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("help output never contains a stack trace", async () => {
      await main(["--help"]);

      expect(stdout()).not.toContain("at ");
    });
  });

  describe("empty/whitespace-only required flag values", () => {
    it.each([
      { args: ["read", "--id", ""], label: "empty --id on read" },
      { args: ["read", "--id", "   "], label: "whitespace-only --id on read" },
      { args: ["create", "--title", "", "--content", "C"], label: "empty --title on create" },
      { args: ["create", "--title", "   ", "--content", "C"], label: "whitespace-only --title on create" },
      { args: ["create", "--title", "T", "--content", ""], label: "empty --content on create" },
      { args: ["update", "--id", "", "--title", "New"], label: "empty --id on update" },
      { args: ["delete", "--id", "   "], label: "whitespace-only --id on delete" },
    ])("$label produces a clear stderr error, non-zero exit, and no stack trace", async ({ args }) => {
      const code = await main(args);

      expect(code).not.toBe(0);
      expect(fetchSpy).not.toHaveBeenCalled();

      const out = stderr();
      expect(() => JSON.parse(out)).not.toThrow();
      const parsed = JSON.parse(out);
      expect(typeof parsed.error).toBe("string");
      expect(parsed.error.length).toBeGreaterThan(0);
      expect(out).not.toContain("at ");
    });
  });

  describe("unknown subcommand", () => {
    it("exits non-zero with a usage hint and no stack trace", async () => {
      const code = await main(["bogus"]);

      expect(code).not.toBe(0);
      expect(fetchSpy).not.toHaveBeenCalled();

      const out = stderr();
      expect(out).toContain("Unknown command");
      expect(out).toContain("Usage:");
      expect(out).not.toContain("at ");
    });
  });
});
