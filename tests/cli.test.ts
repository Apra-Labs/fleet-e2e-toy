/**
 * Unit tests for the NoteAPI CLI (src/cli.ts).
 *
 * All tests mock global fetch — no running server is required.
 */

import {
  parseArgs,
  resolveBaseUrl,
  apiRequest,
  dispatch,
  main,
  CliError,
} from "../src/cli";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Build a minimal fetch Response. */
function makeResponse(body: unknown, status = 200): Response {
  const text = body === undefined ? "" : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    text: async () => text,
  } as unknown as Response;
}

// ─── parseArgs ───────────────────────────────────────────────────────────────

describe("parseArgs", () => {
  it("parses no args — defaults", () => {
    const parsed = parseArgs([]);
    expect(parsed.help).toBe(false);
    expect(parsed.version).toBe(false);
    expect(parsed.url).toBeUndefined();
    expect(parsed.subcommand).toBeUndefined();
    expect(parsed.rest).toEqual([]);
  });

  it("parses --help", () => {
    expect(parseArgs(["--help"]).help).toBe(true);
  });

  it("parses -h", () => {
    expect(parseArgs(["-h"]).help).toBe(true);
  });

  it("parses --version", () => {
    expect(parseArgs(["--version"]).version).toBe(true);
  });

  it("parses -v", () => {
    expect(parseArgs(["-v"]).version).toBe(true);
  });

  it("parses --url with space-separated value", () => {
    const parsed = parseArgs(["--url", "http://example.com"]);
    expect(parsed.url).toBe("http://example.com");
  });

  it("parses --url=value form", () => {
    const parsed = parseArgs(["--url=http://example.com"]);
    expect(parsed.url).toBe("http://example.com");
  });

  it("throws when --url has no value", () => {
    expect(() => parseArgs(["--url"])).toThrow(CliError);
    expect(() => parseArgs(["--url", "--other"])).toThrow(CliError);
  });

  it("parses a subcommand and captures rest args", () => {
    const parsed = parseArgs(["list", "--tag", "work"]);
    expect(parsed.subcommand).toBe("list");
    expect(parsed.rest).toEqual(["--tag", "work"]);
  });

  it("parses global flag before subcommand", () => {
    const parsed = parseArgs(["--url", "http://example.com", "read", "--id", "123"]);
    expect(parsed.url).toBe("http://example.com");
    expect(parsed.subcommand).toBe("read");
    expect(parsed.rest).toEqual(["--id", "123"]);
  });

  it("throws on unknown global flag", () => {
    expect(() => parseArgs(["--unknown"])).toThrow(CliError);
  });
});

// ─── resolveBaseUrl ──────────────────────────────────────────────────────────

describe("resolveBaseUrl", () => {
  const originalEnv = process.env.NOTEAPI_URL;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NOTEAPI_URL;
    } else {
      process.env.NOTEAPI_URL = originalEnv;
    }
  });

  it("uses provided --url flag over env and default", () => {
    process.env.NOTEAPI_URL = "http://env.example.com";
    expect(resolveBaseUrl("http://flag.example.com")).toBe("http://flag.example.com");
  });

  it("uses NOTEAPI_URL env var when no flag given", () => {
    process.env.NOTEAPI_URL = "http://env.example.com";
    expect(resolveBaseUrl(undefined)).toBe("http://env.example.com");
  });

  it("uses default URL when neither flag nor env is set", () => {
    delete process.env.NOTEAPI_URL;
    expect(resolveBaseUrl(undefined)).toBe("http://localhost:3000");
  });

  it("strips trailing slashes", () => {
    expect(resolveBaseUrl("http://example.com///")).toBe("http://example.com");
  });
});

// ─── apiRequest ──────────────────────────────────────────────────────────────

describe("apiRequest", () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("performs a GET request and returns parsed JSON", async () => {
    const note = { id: "1", title: "Hello", content: "World", tags: [] };
    fetchSpy.mockResolvedValueOnce(makeResponse(note));

    const result = await apiRequest("http://localhost:3000", "/api/notes/1");
    expect(result).toEqual(note);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchSpy.mock.calls[0] as [URL, RequestInit];
    expect(url.pathname).toBe("/api/notes/1");
    expect((opts as RequestInit).method).toBe("GET");
  });

  it("performs a POST request with JSON body", async () => {
    const created = { id: "2", title: "New", content: "Body", tags: [] };
    fetchSpy.mockResolvedValueOnce(makeResponse(created, 201));
    // Override ok check — simulate 201
    const resp = makeResponse(created, 201);
    (resp as unknown as Record<string, unknown>).ok = true;
    fetchSpy.mockResolvedValueOnce(resp);

    const result = await apiRequest("http://localhost:3000", "/api/notes", {
      method: "POST",
      body: { title: "New", content: "Body" },
    });
    expect(fetchSpy).toHaveBeenCalled();
    const [, opts] = fetchSpy.mock.calls[0] as [URL, RequestInit];
    expect((opts as RequestInit).method).toBe("POST");
    expect((opts as RequestInit).body).toBe(JSON.stringify({ title: "New", content: "Body" }));
    expect(result).toBeTruthy();
  });

  it("appends query parameters", async () => {
    fetchSpy.mockResolvedValueOnce(makeResponse([]));
    await apiRequest("http://localhost:3000", "/api/notes", {
      query: { tag: "work", q: undefined },
    });
    const [url] = fetchSpy.mock.calls[0] as [URL, RequestInit];
    expect(url.searchParams.get("tag")).toBe("work");
    expect(url.searchParams.has("q")).toBe(false);
  });

  it("throws CliError on network failure", async () => {
    fetchSpy.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    await expect(apiRequest("http://localhost:3000", "/api/notes")).rejects.toThrow(CliError);
    await expect(apiRequest("http://localhost:3000", "/api/notes")).rejects.toThrow(
      /Could not reach NoteAPI/
    );
  });

  it("throws CliError on non-2xx with error message from body", async () => {
    fetchSpy.mockResolvedValueOnce(makeResponse({ error: "Not found" }, 404));
    await expect(apiRequest("http://localhost:3000", "/api/notes/bad")).rejects.toThrow(
      /Not found/
    );
  });

  it("throws CliError on non-2xx with HTTP status when no body", async () => {
    fetchSpy.mockResolvedValueOnce(makeResponse(undefined, 500));
    // Empty body response
    const resp = {
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: async () => "",
    } as unknown as Response;
    fetchSpy.mockResolvedValueOnce(resp);
    await expect(apiRequest("http://localhost:3000", "/api/notes/bad")).rejects.toThrow(
      /HTTP 500/
    );
  });
});

// ─── dispatch: subcommand help ────────────────────────────────────────────────

describe("dispatch — subcommand help", () => {
  let fetchSpy: jest.SpyInstance;
  let stdoutSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, "fetch");
    stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    stdoutSpy.mockRestore();
  });

  it("list --help prints usage and does not call fetch", async () => {
    await dispatch("list", { baseUrl: "http://localhost:3000", args: ["--help"] });
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: noteapi list"));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("read --help prints usage and does not call fetch", async () => {
    await dispatch("read", { baseUrl: "http://localhost:3000", args: ["--help"] });
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: noteapi read"));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("create --help prints usage and does not call fetch", async () => {
    await dispatch("create", { baseUrl: "http://localhost:3000", args: ["--help"] });
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: noteapi create"));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("update --help prints usage and does not call fetch", async () => {
    await dispatch("update", { baseUrl: "http://localhost:3000", args: ["--help"] });
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: noteapi update"));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("delete --help prints usage and does not call fetch", async () => {
    await dispatch("delete", { baseUrl: "http://localhost:3000", args: ["--help"] });
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: noteapi delete"));
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

// ─── dispatch: list ──────────────────────────────────────────────────────────

describe("dispatch — list", () => {
  let fetchSpy: jest.SpyInstance;
  let stdoutSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, "fetch");
    stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    stdoutSpy.mockRestore();
  });

  it("issues GET /api/notes without filters", async () => {
    fetchSpy.mockResolvedValueOnce(makeResponse([]));
    await dispatch("list", { baseUrl: "http://localhost:3000", args: [] });
    const [url, opts] = fetchSpy.mock.calls[0] as [URL, RequestInit];
    expect(url.pathname).toBe("/api/notes");
    expect((opts as RequestInit).method ?? "GET").toBe("GET");
    expect(stdoutSpy).toHaveBeenCalled();
  });

  it("passes --tag as query parameter", async () => {
    fetchSpy.mockResolvedValueOnce(makeResponse([]));
    await dispatch("list", { baseUrl: "http://localhost:3000", args: ["--tag", "work"] });
    const [url] = fetchSpy.mock.calls[0] as [URL, RequestInit];
    expect(url.searchParams.get("tag")).toBe("work");
  });

  it("passes --q as query parameter", async () => {
    fetchSpy.mockResolvedValueOnce(makeResponse([]));
    await dispatch("list", { baseUrl: "http://localhost:3000", args: ["--q", "meeting"] });
    const [url] = fetchSpy.mock.calls[0] as [URL, RequestInit];
    expect(url.searchParams.get("q")).toBe("meeting");
  });

  it("prints JSON output", async () => {
    const notes = [{ id: "1", title: "Note", content: "Body", tags: [] }];
    fetchSpy.mockResolvedValueOnce(makeResponse(notes));
    await dispatch("list", { baseUrl: "http://localhost:3000", args: [] });
    const written = (stdoutSpy.mock.calls[0][0] as string);
    expect(JSON.parse(written)).toEqual(notes);
  });
});

// ─── dispatch: read ──────────────────────────────────────────────────────────

describe("dispatch — read", () => {
  let fetchSpy: jest.SpyInstance;
  let stdoutSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, "fetch");
    stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    stdoutSpy.mockRestore();
  });

  it("issues GET /api/notes/:id", async () => {
    const note = { id: "abc", title: "Title", content: "Body", tags: [] };
    fetchSpy.mockResolvedValueOnce(makeResponse(note));
    await dispatch("read", { baseUrl: "http://localhost:3000", args: ["--id", "abc"] });
    const [url, opts] = fetchSpy.mock.calls[0] as [URL, RequestInit];
    expect(url.pathname).toBe("/api/notes/abc");
    expect((opts as RequestInit).method ?? "GET").toBe("GET");
    expect(stdoutSpy).toHaveBeenCalled();
  });

  it("throws CliError when --id is missing", async () => {
    await expect(
      dispatch("read", { baseUrl: "http://localhost:3000", args: [] })
    ).rejects.toThrow(/--id is required for read/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("throws CliError when --id is whitespace-only", async () => {
    await expect(
      dispatch("read", { baseUrl: "http://localhost:3000", args: ["--id", "   "] })
    ).rejects.toThrow(/must not be empty or whitespace-only/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

// ─── dispatch: create ────────────────────────────────────────────────────────

describe("dispatch — create", () => {
  let fetchSpy: jest.SpyInstance;
  let stdoutSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, "fetch");
    stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    stdoutSpy.mockRestore();
  });

  it("issues POST /api/notes with title and content", async () => {
    const created = { id: "1", title: "Hello", content: "World", tags: [] };
    fetchSpy.mockResolvedValueOnce(makeResponse(created));
    await dispatch("create", {
      baseUrl: "http://localhost:3000",
      args: ["--title", "Hello", "--content", "World"],
    });
    const [url, opts] = fetchSpy.mock.calls[0] as [URL, RequestInit];
    expect(url.pathname).toBe("/api/notes");
    expect((opts as RequestInit).method).toBe("POST");
    const body = JSON.parse((opts as RequestInit).body as string) as Record<string, unknown>;
    expect(body.title).toBe("Hello");
    expect(body.content).toBe("World");
    expect(stdoutSpy).toHaveBeenCalled();
  });

  it("parses --tags into an array", async () => {
    const created = { id: "1", title: "T", content: "C", tags: ["a", "b"] };
    fetchSpy.mockResolvedValueOnce(makeResponse(created));
    await dispatch("create", {
      baseUrl: "http://localhost:3000",
      args: ["--title", "T", "--content", "C", "--tags", "a,b"],
    });
    const [, opts] = fetchSpy.mock.calls[0] as [URL, RequestInit];
    const body = JSON.parse((opts as RequestInit).body as string) as Record<string, unknown>;
    expect(body.tags).toEqual(["a", "b"]);
  });

  it("throws CliError when --title is missing", async () => {
    await expect(
      dispatch("create", { baseUrl: "http://localhost:3000", args: ["--content", "Body"] })
    ).rejects.toThrow(/--title is required for create/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("throws CliError when --content is missing", async () => {
    await expect(
      dispatch("create", { baseUrl: "http://localhost:3000", args: ["--title", "Title"] })
    ).rejects.toThrow(/--content is required for create/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("throws CliError when --title is whitespace-only", async () => {
    await expect(
      dispatch("create", {
        baseUrl: "http://localhost:3000",
        args: ["--title", "   ", "--content", "Body"],
      })
    ).rejects.toThrow(/must not be empty or whitespace-only/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("throws CliError when --content is whitespace-only", async () => {
    await expect(
      dispatch("create", {
        baseUrl: "http://localhost:3000",
        args: ["--title", "Title", "--content", "  "],
      })
    ).rejects.toThrow(/must not be empty or whitespace-only/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

// ─── dispatch: update ────────────────────────────────────────────────────────

describe("dispatch — update", () => {
  let fetchSpy: jest.SpyInstance;
  let stdoutSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, "fetch");
    stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    stdoutSpy.mockRestore();
  });

  it("issues PUT /api/notes/:id", async () => {
    const updated = { id: "1", title: "New", content: "Body", tags: [] };
    fetchSpy.mockResolvedValueOnce(makeResponse(updated));
    await dispatch("update", {
      baseUrl: "http://localhost:3000",
      args: ["--id", "1", "--title", "New"],
    });
    const [url, opts] = fetchSpy.mock.calls[0] as [URL, RequestInit];
    expect(url.pathname).toBe("/api/notes/1");
    expect((opts as RequestInit).method).toBe("PUT");
    const body = JSON.parse((opts as RequestInit).body as string) as Record<string, unknown>;
    expect(body.title).toBe("New");
    expect(stdoutSpy).toHaveBeenCalled();
  });

  it("includes only provided optional flags in body", async () => {
    const updated = { id: "1", title: "Title", content: "Cont", tags: [] };
    fetchSpy.mockResolvedValueOnce(makeResponse(updated));
    await dispatch("update", {
      baseUrl: "http://localhost:3000",
      args: ["--id", "1", "--content", "Cont"],
    });
    const [, opts] = fetchSpy.mock.calls[0] as [URL, RequestInit];
    const body = JSON.parse((opts as RequestInit).body as string) as Record<string, unknown>;
    expect(body.content).toBe("Cont");
    expect(body.title).toBeUndefined();
  });

  it("throws CliError when --id is missing", async () => {
    await expect(
      dispatch("update", { baseUrl: "http://localhost:3000", args: ["--title", "New"] })
    ).rejects.toThrow(/--id is required for update/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("throws CliError when no optional fields provided", async () => {
    await expect(
      dispatch("update", { baseUrl: "http://localhost:3000", args: ["--id", "1"] })
    ).rejects.toThrow(/At least one of --title, --content, --tags is required/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("throws CliError when --id is whitespace-only", async () => {
    await expect(
      dispatch("update", {
        baseUrl: "http://localhost:3000",
        args: ["--id", "  ", "--title", "New"],
      })
    ).rejects.toThrow(/must not be empty or whitespace-only/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("throws CliError when optional --title value is whitespace-only", async () => {
    await expect(
      dispatch("update", {
        baseUrl: "http://localhost:3000",
        args: ["--id", "1", "--title", "   "],
      })
    ).rejects.toThrow(/must not be empty or whitespace-only/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

// ─── dispatch: delete ────────────────────────────────────────────────────────

describe("dispatch — delete", () => {
  let fetchSpy: jest.SpyInstance;
  let stdoutSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, "fetch");
    stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    stdoutSpy.mockRestore();
  });

  it("issues DELETE /api/notes/:id", async () => {
    fetchSpy.mockResolvedValueOnce({ ok: true, status: 204, text: async () => "" } as Response);
    await dispatch("delete", { baseUrl: "http://localhost:3000", args: ["--id", "abc"] });
    const [url, opts] = fetchSpy.mock.calls[0] as [URL, RequestInit];
    expect(url.pathname).toBe("/api/notes/abc");
    expect((opts as RequestInit).method).toBe("DELETE");
  });

  it("prints confirmation message", async () => {
    fetchSpy.mockResolvedValueOnce({ ok: true, status: 204, text: async () => "" } as Response);
    await dispatch("delete", { baseUrl: "http://localhost:3000", args: ["--id", "abc"] });
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Deleted note abc"));
  });

  it("throws CliError when --id is missing", async () => {
    await expect(
      dispatch("delete", { baseUrl: "http://localhost:3000", args: [] })
    ).rejects.toThrow(/--id is required for delete/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("throws CliError when --id is whitespace-only", async () => {
    await expect(
      dispatch("delete", { baseUrl: "http://localhost:3000", args: ["--id", "   "] })
    ).rejects.toThrow(/must not be empty or whitespace-only/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

// ─── dispatch: unknown subcommand ────────────────────────────────────────────

describe("dispatch — unknown subcommand", () => {
  it("throws CliError for unknown subcommand", async () => {
    await expect(
      dispatch("foobar", { baseUrl: "http://localhost:3000", args: [] })
    ).rejects.toThrow(/Unknown command: foobar/);
  });
});

// ─── main ────────────────────────────────────────────────────────────────────

describe("main", () => {
  let fetchSpy: jest.SpyInstance;
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, "fetch");
    stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
    stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  it("--version exits 0 and prints version", async () => {
    const code = await main(["--version"]);
    expect(code).toBe(0);
    const written = (stdoutSpy.mock.calls[0][0] as string);
    expect(written).toMatch(/noteapi-cli v\d+\.\d+\.\d+/);
  });

  it("-v exits 0 and prints version", async () => {
    const code = await main(["-v"]);
    expect(code).toBe(0);
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringMatching(/noteapi-cli v/));
  });

  it("--help exits 0 and prints usage", async () => {
    const code = await main(["--help"]);
    expect(code).toBe(0);
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: noteapi"));
  });

  it("-h exits 0 and prints usage", async () => {
    const code = await main(["-h"]);
    expect(code).toBe(0);
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: noteapi"));
  });

  it("no args exits 1 (usage error)", async () => {
    const code = await main([]);
    expect(code).toBe(1);
  });

  it("unknown subcommand exits 1 and writes to stderr", async () => {
    const code = await main(["unknowncmd"]);
    expect(code).toBe(1);
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("Error:"));
  });

  it("unknown global flag exits 1 and writes to stderr", async () => {
    const code = await main(["--no-such-flag"]);
    expect(code).toBe(1);
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("Error:"));
  });

  it("list exits 0 on success", async () => {
    fetchSpy.mockResolvedValueOnce(makeResponse([]));
    const code = await main(["list"]);
    expect(code).toBe(0);
  });

  it("read exits 1 when --id missing and writes to stderr", async () => {
    const code = await main(["read"]);
    expect(code).toBe(1);
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("Error:"));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("create exits 1 when required flags missing and writes to stderr", async () => {
    const code = await main(["create", "--title", "T"]);
    expect(code).toBe(1);
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("Error:"));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("delete exits 1 when --id missing and writes to stderr", async () => {
    const code = await main(["delete"]);
    expect(code).toBe(1);
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("Error:"));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("exits 1 on API error and writes message to stderr", async () => {
    fetchSpy.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    const code = await main(["list"]);
    expect(code).toBe(1);
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("Error:"));
  });

  it("resolves base URL via --url flag", async () => {
    fetchSpy.mockResolvedValueOnce(makeResponse([]));
    await main(["--url", "http://custom.example.com", "list"]);
    const [url] = fetchSpy.mock.calls[0] as [URL, RequestInit];
    expect(url.hostname).toBe("custom.example.com");
  });

  it("API 404 error exits 1 with error on stderr", async () => {
    fetchSpy.mockResolvedValueOnce(makeResponse({ error: "Not found" }, 404));
    const code = await main(["read", "--id", "missing-id"]);
    expect(code).toBe(1);
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("Not found"));
  });
});
