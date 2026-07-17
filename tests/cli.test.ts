import { normalizeApiError, getBaseUrl } from "../src/cli/http";
import { dispatch } from "../src/cli/index";
import {
  registerCommand,
  getCommand,
  listCommands,
  CommandContext,
} from "../src/cli/commands";

describe("normalizeApiError", () => {
  it("uses the message from the { error } shape (404/generic 400)", () => {
    expect(normalizeApiError(404, { error: "Note not found" })).toBe(
      "Note not found"
    );
  });

  it("joins field errors from the { errors: [...] } shape", () => {
    const body = {
      errors: [
        { field: "title", message: "Title is required" },
        { field: "content", message: "Content must be a string" },
      ],
    };
    expect(normalizeApiError(400, body)).toBe(
      "title: Title is required; content: Content must be a string"
    );
  });

  it("falls back to a status-based message for an unrecognized body", () => {
    expect(normalizeApiError(500, "<html>oops</html>")).toBe(
      "Request failed with status 500"
    );
  });

  it("falls back for an empty/undefined body", () => {
    expect(normalizeApiError(502, undefined)).toBe(
      "Request failed with status 502"
    );
  });

  it("ignores malformed entries in the errors array", () => {
    const body = { errors: [{ field: "title" }, "nope"] };
    expect(normalizeApiError(400, body)).toBe("Request failed with status 400");
  });
});

describe("getBaseUrl", () => {
  const original = process.env.NOTEAPI_URL;
  afterEach(() => {
    if (original === undefined) delete process.env.NOTEAPI_URL;
    else process.env.NOTEAPI_URL = original;
  });

  it("defaults to http://localhost:3000", () => {
    delete process.env.NOTEAPI_URL;
    expect(getBaseUrl()).toBe("http://localhost:3000");
  });

  it("reads NOTEAPI_URL and strips trailing slashes", () => {
    process.env.NOTEAPI_URL = "http://example.com:9000/";
    expect(getBaseUrl()).toBe("http://example.com:9000");
  });
});

describe("command registry", () => {
  it("registers and looks up a command by name", () => {
    const cmd = {
      name: "test-cmd",
      description: "a test command",
      usage: "test-cmd",
      run: () => 0,
    };
    registerCommand(cmd);
    expect(getCommand("test-cmd")).toBe(cmd);
    expect(listCommands()).toContain(cmd);
  });

  it("returns undefined for an unregistered command", () => {
    expect(getCommand("does-not-exist")).toBeUndefined();
  });
});

describe("dispatch", () => {
  let stderr: string;
  let stdout: string;
  let errSpy: jest.SpyInstance;
  let outSpy: jest.SpyInstance;

  beforeEach(() => {
    stderr = "";
    stdout = "";
    errSpy = jest
      .spyOn(process.stderr, "write")
      .mockImplementation((chunk: unknown) => {
        stderr += String(chunk);
        return true;
      });
    outSpy = jest
      .spyOn(process.stdout, "write")
      .mockImplementation((chunk: unknown) => {
        stdout += String(chunk);
        return true;
      });
  });

  afterEach(() => {
    errSpy.mockRestore();
    outSpy.mockRestore();
  });

  it("returns non-zero and a clear message for an unknown command", async () => {
    const code = await dispatch(["bogus"]);
    expect(code).toBe(1);
    expect(stderr).toContain("unknown command 'bogus'");
    expect(stderr).not.toContain("at "); // no stack trace
  });

  it("prints global usage and exits 0 when no command is provided", async () => {
    const code = await dispatch([]);
    expect(code).toBe(0);
    expect(stdout).toContain("Usage:");
    expect(stdout).toContain("Commands:");
    expect(stderr).toBe("");
  });

  it("dispatches to a registered command and passes remaining args", async () => {
    let received: string[] = [];
    registerCommand({
      name: "echo-args",
      description: "records args",
      usage: "echo-args [...args]",
      run: (ctx: CommandContext) => {
        received = ctx.args;
      },
    });
    const code = await dispatch(["echo-args", "a", "b"]);
    expect(code).toBe(0);
    expect(received).toEqual(["a", "b"]);
  });

  it("converts a thrown error into a clean message and exit 1", async () => {
    registerCommand({
      name: "boom",
      description: "throws",
      usage: "boom",
      run: () => {
        throw new Error("kaboom");
      },
    });
    const code = await dispatch(["boom"]);
    expect(code).toBe(1);
    expect(stderr).toContain("kaboom");
    expect(stderr).not.toContain("at "); // no stack trace
  });

  it("prints global usage listing registered commands for --help", async () => {
    registerCommand({
      name: "help-listed",
      description: "shows up in global help",
      usage: "help-listed",
      run: () => 0,
    });
    const code = await dispatch(["--help"]);
    expect(code).toBe(0);
    expect(stdout).toContain("help-listed");
    expect(stdout).toContain("shows up in global help");
    expect(stderr).toBe("");
  });

  it("treats -h as the leading arg like --help", async () => {
    const code = await dispatch(["-h"]);
    expect(code).toBe(0);
    expect(stdout).toContain("Usage:");
    expect(stderr).toBe("");
  });

  it("prints the subcommand usage for '<command> --help' without running it", async () => {
    let ran = false;
    registerCommand({
      name: "with-help",
      description: "a command with help",
      usage: "with-help <id> [--force]",
      run: () => {
        ran = true;
      },
    });
    const code = await dispatch(["with-help", "--help"]);
    expect(code).toBe(0);
    expect(ran).toBe(false); // help short-circuits before run (no network)
    expect(stdout).toContain("with-help <id> [--force]");
    expect(stdout).toContain("a command with help");
  });

  it("reports an unknown command even when followed by --help", async () => {
    const code = await dispatch(["nope", "--help"]);
    expect(code).toBe(1);
    expect(stderr).toContain("unknown command 'nope'");
    expect(stderr).not.toContain("at ");
  });
});
