import { main } from "../src/cli";

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: "",
    text: async () => JSON.stringify(body),
  } as Response;
}

function emptyResponse(status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: "",
    text: async () => "",
  } as Response;
}

describe("CLI --version flag", () => {
  it("'--version' prints exactly 'fleet-e2e-toy v1.0.0' to stdout and exits 0", async () => {
    const result = await main(["--version"]);
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(result.exitCode).toBe(0);
    expect(result.stdout).not.toMatch(/at .*\(.*:\d+:\d+\)/);
    expect(result.stderr).toBe("");
  });

  it("'-v' behaves identically to '--version'", async () => {
    const result = await main(["-v"]);
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
  });

  it("--version works combined with other flags", async () => {
    const result = await main(["list", "--tag=work", "--version"]);
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
  });

  it("-v works combined with other flags", async () => {
    const result = await main(["create", "-v", "--title=x"]);
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
  });
});

describe("CLI CRUD subcommands", () => {
  const originalFetch = global.fetch;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("list", () => {
    it("GETs /api/notes with --tag and --q query params", async () => {
      const notes = [{ id: "1", title: "A", content: "B", tags: ["work"], createdAt: "", updatedAt: "" }];
      fetchMock.mockResolvedValueOnce(jsonResponse(200, notes));

      const result = await main(["list", "--tag=work", "--q=hello"]);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toContain("/api/notes?");
      expect(url).toContain("tag=work");
      expect(url).toContain("q=hello");
      expect(opts.method).toBe("GET");
      expect(JSON.parse(result.stdout)).toEqual(notes);
      expect(result.exitCode).toBe(0);
    });

    it("GETs /api/notes with no query params when none given", async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(200, []));

      const result = await main(["list"]);

      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toMatch(/\/api\/notes$/);
      expect(opts.method).toBe("GET");
      expect(result.exitCode).toBe(0);
    });
  });

  describe("read", () => {
    it("GETs /api/notes/:id", async () => {
      const note = { id: "abc", title: "A", content: "B", tags: [], createdAt: "", updatedAt: "" };
      fetchMock.mockResolvedValueOnce(jsonResponse(200, note));

      const result = await main(["read", "--id=abc"]);

      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toMatch(/\/api\/notes\/abc$/);
      expect(opts.method).toBe("GET");
      expect(JSON.parse(result.stdout)).toEqual(note);
      expect(result.exitCode).toBe(0);
    });
  });

  describe("create", () => {
    it("POSTs to /api/notes with JSON body and tags as string[]", async () => {
      const created = {
        id: "new-id",
        title: "Title",
        content: "Content",
        tags: ["a", "b"],
        createdAt: "",
        updatedAt: "",
      };
      fetchMock.mockResolvedValueOnce(jsonResponse(201, created));

      const result = await main([
        "create",
        "--title=Title",
        "--content=Content",
        "--tags=a,b",
      ]);

      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toMatch(/\/api\/notes$/);
      expect(opts.method).toBe("POST");
      const body = JSON.parse(opts.body);
      expect(body).toEqual({ title: "Title", content: "Content", tags: ["a", "b"] });
      expect(JSON.parse(result.stdout)).toEqual(created);
      expect(result.exitCode).toBe(0);
    });

    it("POSTs with an empty tags array when --tags is omitted", async () => {
      const created = { id: "x", title: "T", content: "C", tags: [], createdAt: "", updatedAt: "" };
      fetchMock.mockResolvedValueOnce(jsonResponse(201, created));

      await main(["create", "--title=T", "--content=C"]);

      const [, opts] = fetchMock.mock.calls[0];
      const body = JSON.parse(opts.body);
      expect(body.tags).toEqual([]);
    });
  });

  describe("update", () => {
    it("PUTs to /api/notes/:id with JSON body", async () => {
      const updated = { id: "abc", title: "New", content: "C", tags: ["z"], createdAt: "", updatedAt: "" };
      fetchMock.mockResolvedValueOnce(jsonResponse(200, updated));

      const result = await main(["update", "--id=abc", "--title=New", "--tags=z"]);

      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toMatch(/\/api\/notes\/abc$/);
      expect(opts.method).toBe("PUT");
      const body = JSON.parse(opts.body);
      expect(body).toEqual({ title: "New", tags: ["z"] });
      expect(JSON.parse(result.stdout)).toEqual(updated);
      expect(result.exitCode).toBe(0);
    });
  });

  describe("delete", () => {
    it("DELETEs /api/notes/:id, prints empty output and exits 0 on 204", async () => {
      fetchMock.mockResolvedValueOnce(emptyResponse(204));

      const result = await main(["delete", "--id=abc"]);

      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toMatch(/\/api\/notes\/abc$/);
      expect(opts.method).toBe("DELETE");
      expect(result.stdout).toBe("");
      expect(result.exitCode).toBe(0);
    });
  });

  describe("API error handling", () => {
    it("prints 'Error: ...' to stderr and exits 1 on 404", async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(404, { error: "Note not found" }));

      const result = await main(["read", "--id=missing"]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Error:");
      expect(result.stderr).toContain("Note not found");
      expect(result.stdout).not.toContain("Error:");
    });

    it("prints 'Error: ...' to stderr and exits 1 on 500", async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(500, { error: "Internal Server Error" }));

      const result = await main(["list"]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Error:");
      expect(result.stdout).not.toContain("Error:");
    });
  });

  describe("network error handling", () => {
    it("prints 'Error: Could not connect to API at ...' to stderr and exits 1 when fetch throws", async () => {
      fetchMock.mockRejectedValueOnce(new Error("ECONNREFUSED"));

      const result = await main(["list"]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Error: Could not connect to API at");
      expect(result.stdout).not.toContain("Error:");
    });
  });
});

describe("CLI help system", () => {
  const subcommands = ["list", "read", "create", "update", "delete"];

  it("'--help' prints global usage containing 'Usage' and each subcommand name, exits 0", async () => {
    const result = await main(["--help"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage");
    for (const cmd of subcommands) {
      expect(result.stdout).toContain(cmd);
    }
    expect(result.stderr).toBe("");
    expect(result.stdout).not.toMatch(/at .*\(.*:\d+:\d+\)/);
  });

  it("'-h' behaves identically to '--help'", async () => {
    const result = await main(["-h"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage");
    for (const cmd of subcommands) {
      expect(result.stdout).toContain(cmd);
    }
    expect(result.stderr).toBe("");
  });

  it("running with no args prints global usage and exits 0", async () => {
    const result = await main([]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage");
    expect(result.stderr).toBe("");
  });

  it.each([
    ["create", ["--title", "--content"]],
    ["update", ["--id"]],
    ["read", ["--id"]],
    ["delete", ["--id"]],
    ["list", []],
  ])("'%s --help' mentions its required flags and exits 0", async (cmd, requiredFlags) => {
    const result = await main([cmd, "--help"]);
    expect(result.exitCode).toBe(0);
    for (const flag of requiredFlags) {
      expect(result.stdout).toContain(flag);
    }
    expect(result.stderr).toBe("");
    expect(result.stdout).not.toMatch(/at .*\(.*:\d+:\d+\)/);
  });

  it("'create -h' behaves identically to 'create --help'", async () => {
    const result = await main(["create", "-h"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("--title");
    expect(result.stdout).toContain("--content");
  });
});

describe("CLI input validation", () => {
  const originalFetch = global.fetch;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  function assertRejected(result: { stdout: string; stderr: string; exitCode: number }): void {
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Error:");
    expect(result.stdout).not.toContain("Error:");
    expect(result.stderr).not.toMatch(/at .*\(.*:\d+:\d+\)/);
    expect(result.stdout).not.toMatch(/at .*\(.*:\d+:\d+\)/);
    expect(fetchMock).not.toHaveBeenCalled();
  }

  describe("blank/empty --id", () => {
    it.each(["", " ", "\t", "\n"])("rejects read --id=%j", async (value) => {
      const result = await main(["read", `--id=${value}`]);
      assertRejected(result);
    });

    it.each(["", " ", "\t", "\n"])("rejects update --id=%j", async (value) => {
      const result = await main(["update", `--id=${value}`, "--title=X"]);
      assertRejected(result);
    });

    it.each(["", " ", "\t", "\n"])("rejects delete --id=%j", async (value) => {
      const result = await main(["delete", `--id=${value}`]);
      assertRejected(result);
    });
  });

  describe("blank/empty --title", () => {
    it.each(["", " ", "\t", "\n"])("rejects create --title=%j", async (value) => {
      const result = await main(["create", `--title=${value}`, "--content=Body"]);
      assertRejected(result);
    });
  });

  describe("blank/empty --content", () => {
    it.each(["", " ", "\t", "\n"])("rejects create --content=%j", async (value) => {
      const result = await main(["create", "--title=Title", `--content=${value}`]);
      assertRejected(result);
    });
  });

  describe("required-flag checks", () => {
    it("rejects create missing --title", async () => {
      const result = await main(["create", "--content=Body"]);
      assertRejected(result);
    });

    it("rejects create missing --content", async () => {
      const result = await main(["create", "--title=Title"]);
      assertRejected(result);
    });

    it("rejects create missing both --title and --content", async () => {
      const result = await main(["create"]);
      assertRejected(result);
    });

    it("rejects read missing --id", async () => {
      const result = await main(["read"]);
      assertRejected(result);
    });

    it("rejects update missing --id", async () => {
      const result = await main(["update", "--title=X"]);
      assertRejected(result);
    });

    it("rejects delete missing --id", async () => {
      const result = await main(["delete"]);
      assertRejected(result);
    });

    it("rejects update with none of --title/--content/--tags", async () => {
      const result = await main(["update", "--id=abc"]);
      assertRejected(result);
    });
  });
});
