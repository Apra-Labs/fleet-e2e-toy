// Unit tests for the NoteAPI CLI CRUD subcommands.
//
// These exercise flag parsing, the request shape, and the error paths of the
// `list`, `read`, `create`, `update`, and `delete` commands WITHOUT a running
// server: `global.fetch` is mocked so no network is touched. They are unit
// tests of command logic — the end-to-end integration suite is a separate task
// and lives outside tests/.

import { dispatch } from "../src/cli/index";
import { getFlag } from "../src/cli/flags";
import { listCommand, readCommand } from "../src/cli/notesRead";
import {
  createCommand,
  updateCommand,
  deleteCommand,
} from "../src/cli/notesWrite";
import { CommandContext } from "../src/cli/commands";

type FetchResult = { ok: boolean; status: number; body: string };

/** Install a mocked global.fetch that records calls and returns `result`. */
function mockFetch(result: FetchResult): jest.Mock {
  const fn = jest.fn(async () => ({
    ok: result.ok,
    status: result.status,
    text: async () => result.body,
  }));
  (global as unknown as { fetch: unknown }).fetch = fn as unknown;
  return fn as unknown as jest.Mock;
}

const originalFetch = global.fetch;

let stdout: string;
let stderr: string;
let outSpy: jest.SpyInstance;
let errSpy: jest.SpyInstance;

beforeEach(() => {
  stdout = "";
  stderr = "";
  outSpy = jest
    .spyOn(process.stdout, "write")
    .mockImplementation((chunk: unknown) => {
      stdout += String(chunk);
      return true;
    });
  errSpy = jest
    .spyOn(process.stderr, "write")
    .mockImplementation((chunk: unknown) => {
      stderr += String(chunk);
      return true;
    });
});

afterEach(() => {
  outSpy.mockRestore();
  errSpy.mockRestore();
  global.fetch = originalFetch;
  jest.restoreAllMocks();
});

const sampleNote = {
  id: "abc",
  title: "Hello",
  content: "World",
  tags: ["a"],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("getFlag", () => {
  it("returns the value following the flag", () => {
    expect(getFlag(["--id", "42"], "--id")).toBe("42");
  });

  it("returns undefined when the flag is absent", () => {
    expect(getFlag(["--tag", "x"], "--id")).toBeUndefined();
  });

  it("returns undefined when the flag is the last token (no value)", () => {
    expect(getFlag(["--id"], "--id")).toBeUndefined();
  });
});

describe("list command", () => {
  it("calls GET /api/notes with no query params when none given", async () => {
    const fetchMock = mockFetch({ ok: true, status: 200, body: "[]" });
    const ctx: CommandContext = { args: [] };
    await listCommand.run(ctx);
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toBe("http://localhost:3000/api/notes");
    expect(stdout).toContain("[]");
  });

  it("appends tag and q query params only when provided", async () => {
    const fetchMock = mockFetch({ ok: true, status: 200, body: "[]" });
    await listCommand.run({ args: ["--tag", "work", "--q", "hello"] });
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("tag=work");
    expect(url).toContain("q=hello");
  });

  it("appends only tag when only tag is provided", async () => {
    const fetchMock = mockFetch({ ok: true, status: 200, body: "[]" });
    await listCommand.run({ args: ["--tag", "work"] });
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("tag=work");
    expect(url).not.toContain("q=");
  });

  it("exits non-zero with a clear message and no stack on API error", async () => {
    mockFetch({ ok: false, status: 500, body: "" });
    const code = await dispatch(["list"]);
    expect(code).toBe(1);
    expect(stderr).toContain("Error:");
    expect(stderr).not.toContain("at ");
  });
});

describe("read command", () => {
  it("calls GET /api/notes/:id and prints the note", async () => {
    const fetchMock = mockFetch({
      ok: true,
      status: 200,
      body: JSON.stringify(sampleNote),
    });
    await readCommand.run({ args: ["--id", "abc"] });
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toBe("http://localhost:3000/api/notes/abc");
    expect(stdout).toContain("Hello");
  });

  it("rejects a missing --id before any network call", async () => {
    const fetchMock = mockFetch({ ok: true, status: 200, body: "{}" });
    const code = await dispatch(["read"]);
    expect(code).toBe(1);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(stderr).toContain("--id");
    expect(stderr).not.toContain("at ");
  });

  it("surfaces a 404 as a clear normalized message, exit non-zero", async () => {
    mockFetch({
      ok: false,
      status: 404,
      body: JSON.stringify({ error: "Note not found" }),
    });
    const code = await dispatch(["read", "--id", "missing"]);
    expect(code).toBe(1);
    expect(stderr).toContain("Note not found");
    expect(stderr).not.toContain("{");
    expect(stderr).not.toContain("at ");
  });
});

describe("create command", () => {
  it("POSTs title and content and prints the created note", async () => {
    const fetchMock = mockFetch({
      ok: true,
      status: 201,
      body: JSON.stringify(sampleNote),
    });
    await createCommand.run({
      args: ["--title", "Hello", "--content", "World"],
    });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://localhost:3000/api/notes");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      title: "Hello",
      content: "World",
    });
    expect(stdout).toContain("Hello");
  });

  it("rejects a missing --title before any network call", async () => {
    const fetchMock = mockFetch({ ok: true, status: 201, body: "{}" });
    const code = await dispatch(["create", "--content", "Body"]);
    expect(code).toBe(1);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(stderr).toContain("--title");
    expect(stderr).not.toContain("at ");
  });

  it("surfaces the { errors: [...] } validation shape as a clear message", async () => {
    mockFetch({
      ok: false,
      status: 400,
      body: JSON.stringify({
        errors: [{ field: "title", message: "Title is required" }],
      }),
    });
    const code = await dispatch(["create", "--title", "x", "--content", "y"]);
    expect(code).toBe(1);
    expect(stderr).toContain("title: Title is required");
    expect(stderr).not.toContain("[");
    expect(stderr).not.toContain("at ");
  });
});

describe("update command", () => {
  it("PUTs only the provided fields", async () => {
    const fetchMock = mockFetch({
      ok: true,
      status: 200,
      body: JSON.stringify(sampleNote),
    });
    await updateCommand.run({ args: ["--id", "abc", "--title", "New"] });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://localhost:3000/api/notes/abc");
    expect(init.method).toBe("PUT");
    expect(JSON.parse(init.body as string)).toEqual({ title: "New" });
  });

  it("rejects a missing --id before any network call", async () => {
    const fetchMock = mockFetch({ ok: true, status: 200, body: "{}" });
    const code = await dispatch(["update", "--title", "New"]);
    expect(code).toBe(1);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(stderr).toContain("--id");
  });

  it("rejects when neither --title nor --content is provided", async () => {
    const fetchMock = mockFetch({ ok: true, status: 200, body: "{}" });
    const code = await dispatch(["update", "--id", "abc"]);
    expect(code).toBe(1);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(stderr).toContain("Error:");
    expect(stderr).not.toContain("at ");
  });

  it("rejects a blank --content when it is provided", async () => {
    const fetchMock = mockFetch({ ok: true, status: 200, body: "{}" });
    const code = await dispatch(["update", "--id", "abc", "--content", "   "]);
    expect(code).toBe(1);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(stderr).toContain("--content");
  });
});

describe("delete command", () => {
  it("DELETEs the note and prints a confirmation on 204", async () => {
    const fetchMock = mockFetch({ ok: true, status: 204, body: "" });
    await deleteCommand.run({ args: ["--id", "abc"] });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://localhost:3000/api/notes/abc");
    expect(init.method).toBe("DELETE");
    expect(stdout).toContain("Deleted note abc");
  });

  it("rejects a missing --id before any network call", async () => {
    const fetchMock = mockFetch({ ok: true, status: 204, body: "" });
    const code = await dispatch(["delete"]);
    expect(code).toBe(1);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(stderr).toContain("--id");
  });

  it("surfaces a 404 as a clear message, exit non-zero", async () => {
    mockFetch({
      ok: false,
      status: 404,
      body: JSON.stringify({ error: "Note not found" }),
    });
    const code = await dispatch(["delete", "--id", "missing"]);
    expect(code).toBe(1);
    expect(stderr).toContain("Note not found");
    expect(stderr).not.toContain("at ");
  });
});
