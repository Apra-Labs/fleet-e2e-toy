import { main } from "../src/cli";

function mockFetchResponse(status: number, body: unknown): Response {
  const text = body === undefined ? "" : JSON.stringify(body);
  return {
    status,
    ok: status >= 200 && status < 300,
    text: () => Promise.resolve(text),
  } as unknown as Response;
}

describe("CLI --version", () => {
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;

  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
    stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  it("prints version and exits 0 for --version", async () => {
    const code = await main(["--version"]);
    expect(code).toBe(0);
    expect(stdoutSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0\n");
  });

  it("prints version and exits 0 for -v", async () => {
    const code = await main(["-v"]);
    expect(code).toBe(0);
    expect(stdoutSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0\n");
  });

  it("errors when no command is provided", async () => {
    const code = await main([]);
    expect(code).toBe(1);
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("Error:"));
  });

  it("errors on unknown command", async () => {
    const code = await main(["bogus"]);
    expect(code).toBe(1);
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("Error:"));
  });
});

describe("CLI CRUD subcommands", () => {
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
    stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
    fetchSpy = jest.spyOn(global, "fetch");
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
    fetchSpy.mockRestore();
  });

  describe("list", () => {
    it("GETs /api/notes and prints JSON on success", async () => {
      const notes = [{ id: "1", title: "A", content: "B", tags: [], createdAt: "", updatedAt: "" }];
      fetchSpy.mockResolvedValue(mockFetchResponse(200, notes));

      const code = await main(["list"]);

      expect(code).toBe(0);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/api/notes"),
        expect.objectContaining({ method: "GET" })
      );
      expect(stdoutSpy).toHaveBeenCalledWith(`${JSON.stringify(notes, null, 2)}\n`);
    });

    it("passes --tag and --q as query params", async () => {
      fetchSpy.mockResolvedValue(mockFetchResponse(200, []));

      await main(["list", "--tag=work", "--q=hello"]);

      const calledUrl = fetchSpy.mock.calls[0][0] as string;
      expect(calledUrl).toContain("tag=work");
      expect(calledUrl).toContain("q=hello");
    });
  });

  describe("read", () => {
    it("GETs /api/notes/:id and prints JSON on success", async () => {
      const note = { id: "abc", title: "A", content: "B", tags: [], createdAt: "", updatedAt: "" };
      fetchSpy.mockResolvedValue(mockFetchResponse(200, note));

      const code = await main(["read", "--id=abc"]);

      expect(code).toBe(0);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/api/notes/abc"),
        expect.objectContaining({ method: "GET" })
      );
      expect(stdoutSpy).toHaveBeenCalledWith(`${JSON.stringify(note, null, 2)}\n`);
    });

    it("prints Error: and exits 1 on API error (404)", async () => {
      fetchSpy.mockResolvedValue(mockFetchResponse(404, { error: "Note not found" }));

      const code = await main(["read", "--id=missing"]);

      expect(code).toBe(1);
      expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("Error:"));
    });
  });

  describe("create", () => {
    it("POSTs JSON to /api/notes and prints JSON on success", async () => {
      const created = { id: "new-id", title: "T", content: "C", tags: ["x"], createdAt: "", updatedAt: "" };
      fetchSpy.mockResolvedValue(mockFetchResponse(201, created));

      const code = await main(["create", "--title=T", "--content=C", "--tags=x"]);

      expect(code).toBe(0);
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toContain("/api/notes");
      expect(options.method).toBe("POST");
      expect(JSON.parse(options.body)).toEqual({ title: "T", content: "C", tags: ["x"] });
      expect(stdoutSpy).toHaveBeenCalledWith(`${JSON.stringify(created, null, 2)}\n`);
    });
  });

  describe("update", () => {
    it("PUTs JSON to /api/notes/:id and prints JSON on success", async () => {
      const updated = { id: "abc", title: "New", content: "C", tags: [], createdAt: "", updatedAt: "" };
      fetchSpy.mockResolvedValue(mockFetchResponse(200, updated));

      const code = await main(["update", "--id=abc", "--title=New"]);

      expect(code).toBe(0);
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toContain("/api/notes/abc");
      expect(options.method).toBe("PUT");
      expect(JSON.parse(options.body)).toEqual({ title: "New" });
      expect(stdoutSpy).toHaveBeenCalledWith(`${JSON.stringify(updated, null, 2)}\n`);
    });
  });

  describe("delete", () => {
    it("DELETEs /api/notes/:id, prints empty result, exits 0 on 204", async () => {
      fetchSpy.mockResolvedValue(mockFetchResponse(204, undefined));

      const code = await main(["delete", "--id=abc"]);

      expect(code).toBe(0);
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toContain("/api/notes/abc");
      expect(options.method).toBe("DELETE");
      expect(stdoutSpy).toHaveBeenCalledWith("\n");
    });
  });

  describe("network errors", () => {
    it("prints 'Error: Could not connect to API at' and exits 1", async () => {
      fetchSpy.mockRejectedValue(new Error("ECONNREFUSED"));

      const code = await main(["list"]);

      expect(code).toBe(1);
      expect(stderrSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error: Could not connect to API at")
      );
    });
  });
});
