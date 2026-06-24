/**
 * Tests for CLI subcommands: list, read, create, update, delete.
 * The httpClient module is mocked to verify correct method/path/body.
 */

jest.mock("../../src/cli/client", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  httpClient: jest.fn<Promise<unknown>, [any]>(),
  CliError: class CliError extends Error {
    constructor(
      public readonly status: number | null,
      message: string
    ) {
      super(message);
      this.name = "CliError";
    }
  },
}));

import { httpClient, CliError } from "../../src/cli/client";
import { makeListCommand } from "../../src/cli/commands/list";
import { makeReadCommand } from "../../src/cli/commands/read";
import { makeCreateCommand } from "../../src/cli/commands/create";
import { makeUpdateCommand } from "../../src/cli/commands/update";
import { makeDeleteCommand } from "../../src/cli/commands/delete";

const mockHttpClient = httpClient as jest.MockedFunction<typeof httpClient>;

// Capture stdout/stderr during tests
let stdoutOutput: string;
let stderrOutput: string;
let originalStdoutWrite: typeof process.stdout.write;
let originalStderrWrite: typeof process.stderr.write;
let mockExit: jest.SpyInstance;

beforeEach(() => {
  mockHttpClient.mockClear();
  stdoutOutput = "";
  stderrOutput = "";

  originalStdoutWrite = process.stdout.write.bind(process.stdout);
  originalStderrWrite = process.stderr.write.bind(process.stderr);

  jest.spyOn(process.stdout, "write").mockImplementation((chunk: unknown) => {
    stdoutOutput += String(chunk);
    return true;
  });
  jest.spyOn(process.stderr, "write").mockImplementation((chunk: unknown) => {
    stderrOutput += String(chunk);
    return true;
  });

  mockExit = jest.spyOn(process, "exit").mockImplementation((_code?: number | string | null | undefined) => {
    throw new Error(`process.exit(${String(_code)})`);
  });
});

afterEach(() => {
  (process.stdout.write as jest.Mock).mockRestore();
  (process.stderr.write as jest.Mock).mockRestore();
  mockExit.mockRestore();
  void originalStdoutWrite;
  void originalStderrWrite;
});

// Helper to run a command action by parsing args
async function runCommand(makeCmd: () => import("commander").Command, args: string[]): Promise<void> {
  const cmd = makeCmd();
  await cmd.parseAsync(["node", "cmd", ...args]);
}

// ─── list ────────────────────────────────────────────────────────────────────

describe("list subcommand", () => {
  it("calls GET /api/notes with no params", async () => {
    mockHttpClient.mockResolvedValueOnce([]);
    await runCommand(makeListCommand, []);
    expect(mockHttpClient).toHaveBeenCalledWith({ method: "GET", path: "/api/notes" });
  });

  it("appends --tag as query param", async () => {
    mockHttpClient.mockResolvedValueOnce([]);
    await runCommand(makeListCommand, ["--tag", "work"]);
    expect(mockHttpClient).toHaveBeenCalledWith({
      method: "GET",
      path: "/api/notes?tag=work",
    });
  });

  it("appends --q as query param", async () => {
    mockHttpClient.mockResolvedValueOnce([]);
    await runCommand(makeListCommand, ["--q", "hello"]);
    expect(mockHttpClient).toHaveBeenCalledWith({
      method: "GET",
      path: "/api/notes?q=hello",
    });
  });

  it("prints JSON output to stdout", async () => {
    const data = [{ id: "1", title: "Note" }];
    mockHttpClient.mockResolvedValueOnce(data);
    await runCommand(makeListCommand, []);
    expect(stdoutOutput).toContain('"id": "1"');
  });

  it("writes error to stderr and exits non-zero on CliError", async () => {
    mockHttpClient.mockRejectedValueOnce(new CliError(500, "server error"));
    await expect(runCommand(makeListCommand, [])).rejects.toThrow("process.exit(1)");
    expect(stderrOutput).toContain("server error");
  });
});

// ─── read ────────────────────────────────────────────────────────────────────

describe("read subcommand", () => {
  it("calls GET /api/notes/:id", async () => {
    mockHttpClient.mockResolvedValueOnce({ id: "42", title: "T" });
    await runCommand(makeReadCommand, ["--id", "42"]);
    expect(mockHttpClient).toHaveBeenCalledWith({ method: "GET", path: "/api/notes/42" });
  });

  it("prints note JSON to stdout", async () => {
    mockHttpClient.mockResolvedValueOnce({ id: "1", title: "My note" });
    await runCommand(makeReadCommand, ["--id", "1"]);
    expect(stdoutOutput).toContain('"title": "My note"');
  });

  it("exits non-zero on API error", async () => {
    mockHttpClient.mockRejectedValueOnce(new CliError(404, "not found"));
    await expect(runCommand(makeReadCommand, ["--id", "999"])).rejects.toThrow("process.exit(1)");
    expect(stderrOutput).toContain("not found");
  });
});

// ─── create ──────────────────────────────────────────────────────────────────

describe("create subcommand", () => {
  it("calls POST /api/notes with title and content", async () => {
    mockHttpClient.mockResolvedValueOnce({ id: "1", title: "T", content: "C" });
    await runCommand(makeCreateCommand, ["--title", "T", "--content", "C"]);
    expect(mockHttpClient).toHaveBeenCalledWith({
      method: "POST",
      path: "/api/notes",
      body: { title: "T", content: "C" },
    });
  });

  it("prints created note to stdout", async () => {
    const note = { id: "5", title: "New", content: "Body" };
    mockHttpClient.mockResolvedValueOnce(note);
    await runCommand(makeCreateCommand, ["--title", "New", "--content", "Body"]);
    expect(stdoutOutput).toContain('"id": "5"');
  });

  it("rejects empty --title with non-zero exit", async () => {
    await expect(
      runCommand(makeCreateCommand, ["--title", "", "--content", "C"])
    ).rejects.toThrow("process.exit(1)");
    expect(stderrOutput).toContain("--title");
  });

  it("rejects whitespace-only --content with non-zero exit", async () => {
    await expect(
      runCommand(makeCreateCommand, ["--title", "T", "--content", "   "])
    ).rejects.toThrow("process.exit(1)");
    expect(stderrOutput).toContain("--content");
  });
});

// ─── update ──────────────────────────────────────────────────────────────────

describe("update subcommand", () => {
  it("calls PUT /api/notes/:id with title", async () => {
    mockHttpClient.mockResolvedValueOnce({ id: "1", title: "New" });
    await runCommand(makeUpdateCommand, ["--id", "1", "--title", "New"]);
    expect(mockHttpClient).toHaveBeenCalledWith({
      method: "PUT",
      path: "/api/notes/1",
      body: { title: "New" },
    });
  });

  it("calls PUT /api/notes/:id with content", async () => {
    mockHttpClient.mockResolvedValueOnce({ id: "1", content: "Body" });
    await runCommand(makeUpdateCommand, ["--id", "1", "--content", "Body"]);
    expect(mockHttpClient).toHaveBeenCalledWith({
      method: "PUT",
      path: "/api/notes/1",
      body: { content: "Body" },
    });
  });

  it("exits non-zero when neither --title nor --content provided", async () => {
    await expect(
      runCommand(makeUpdateCommand, ["--id", "1"])
    ).rejects.toThrow("process.exit(1)");
    expect(stderrOutput).toContain("--title");
  });

  it("rejects blank --title with non-zero exit", async () => {
    await expect(
      runCommand(makeUpdateCommand, ["--id", "1", "--title", "   "])
    ).rejects.toThrow("process.exit(1)");
    expect(stderrOutput).toContain("--title");
  });
});

// ─── delete ──────────────────────────────────────────────────────────────────

describe("delete subcommand", () => {
  it("calls DELETE /api/notes/:id", async () => {
    mockHttpClient.mockResolvedValueOnce(null);
    await runCommand(makeDeleteCommand, ["--id", "3"]);
    expect(mockHttpClient).toHaveBeenCalledWith({ method: "DELETE", path: "/api/notes/3" });
  });

  it("prints success message to stdout", async () => {
    mockHttpClient.mockResolvedValueOnce(null);
    await runCommand(makeDeleteCommand, ["--id", "3"]);
    expect(stdoutOutput).toContain("deleted");
  });

  it("exits non-zero on API error", async () => {
    mockHttpClient.mockRejectedValueOnce(new CliError(404, "not found"));
    await expect(runCommand(makeDeleteCommand, ["--id", "99"])).rejects.toThrow("process.exit(1)");
    expect(stderrOutput).toContain("not found");
  });
});
