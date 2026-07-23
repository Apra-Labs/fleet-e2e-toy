import { main } from "../src/cli/index";

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("CLI input validation for empty/blank strings", () => {
  let fetchSpy: jest.SpiedFunction<typeof fetch>;
  let stderrSpy: jest.SpiedFunction<typeof process.stderr.write>;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, "fetch");
    jest.spyOn(process.stdout, "write").mockImplementation(() => true);
    stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function stderr(): string {
    return stderrSpy.mock.calls.map((c) => c[0]).join("");
  }

  describe("create", () => {
    it("rejects an empty --title", async () => {
      const code = await main(["create", "--title", "", "--content", "C"]);

      expect(code).toBe(1);
      expect(fetchSpy).not.toHaveBeenCalled();
      const out = stderr();
      expect(() => JSON.parse(out)).not.toThrow();
      expect(JSON.parse(out).error).toContain("--title");
      expect(out).not.toContain("at ");
    });

    it("rejects a whitespace-only --title", async () => {
      const code = await main(["create", "--title", "   ", "--content", "C"]);

      expect(code).toBe(1);
      expect(fetchSpy).not.toHaveBeenCalled();
      const out = stderr();
      expect(JSON.parse(out).error).toContain("--title");
    });

    it("rejects an empty --content", async () => {
      const code = await main(["create", "--title", "T", "--content", ""]);

      expect(code).toBe(1);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(JSON.parse(stderr()).error).toContain("--content");
    });

    it("rejects a whitespace-only --content", async () => {
      const code = await main(["create", "--title", "T", "--content", "  \t "]);

      expect(code).toBe(1);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(JSON.parse(stderr()).error).toContain("--content");
    });

    it("rejects a blank --tag", async () => {
      const code = await main(["create", "--title", "T", "--content", "C", "--tag", "  "]);

      expect(code).toBe(1);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(JSON.parse(stderr()).error).toContain("--tag");
    });

    it("allows valid non-empty values to pass through unchanged", async () => {
      fetchSpy.mockResolvedValueOnce(
        jsonResponse(
          {
            id: "abc-123",
            title: "T",
            content: "C",
            tags: ["work"],
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
          201
        )
      );

      const code = await main(["create", "--title", "T", "--content", "C", "--tag", "work"]);

      expect(code).toBe(0);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const init = fetchSpy.mock.calls[0][1];
      const body = JSON.parse(init?.body as string);
      expect(body.title).toBe("T");
      expect(body.content).toBe("C");
      expect(body.tags).toEqual(["work"]);
    });
  });

  describe("read", () => {
    it("rejects an empty --id", async () => {
      const code = await main(["read", "--id", ""]);

      expect(code).toBe(1);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(JSON.parse(stderr()).error).toContain("--id");
    });

    it("rejects a whitespace-only --id", async () => {
      const code = await main(["read", "--id", "   "]);

      expect(code).toBe(1);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(JSON.parse(stderr()).error).toContain("--id");
    });
  });

  describe("update", () => {
    it("rejects an empty --id", async () => {
      const code = await main(["update", "--id", "", "--title", "New"]);

      expect(code).toBe(1);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(JSON.parse(stderr()).error).toContain("--id");
    });

    it("rejects a whitespace-only --title", async () => {
      const code = await main(["update", "--id", "abc-123", "--title", "   "]);

      expect(code).toBe(1);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(JSON.parse(stderr()).error).toContain("--title");
    });

    it("rejects a whitespace-only --content", async () => {
      const code = await main(["update", "--id", "abc-123", "--content", "  "]);

      expect(code).toBe(1);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(JSON.parse(stderr()).error).toContain("--content");
    });
  });

  describe("delete", () => {
    it("rejects an empty --id", async () => {
      const code = await main(["delete", "--id", ""]);

      expect(code).toBe(1);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(JSON.parse(stderr()).error).toContain("--id");
    });

    it("rejects a whitespace-only --id", async () => {
      const code = await main(["delete", "--id", "\t\t"]);

      expect(code).toBe(1);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(JSON.parse(stderr()).error).toContain("--id");
    });
  });

  describe("list", () => {
    it("rejects a whitespace-only --tag", async () => {
      const code = await main(["list", "--tag", "   "]);

      expect(code).toBe(1);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(JSON.parse(stderr()).error).toContain("--tag");
    });

    it("rejects a whitespace-only --q", async () => {
      const code = await main(["list", "--q", "   "]);

      expect(code).toBe(1);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(JSON.parse(stderr()).error).toContain("--q");
    });

    it("allows a valid --tag and --q to pass through unchanged", async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse([]));

      const code = await main(["list", "--tag", "work", "--q", "meeting"]);

      expect(code).toBe(0);
      const calledUrl = fetchSpy.mock.calls[0][0] as URL;
      expect(calledUrl.searchParams.get("tag")).toBe("work");
      expect(calledUrl.searchParams.get("q")).toBe("meeting");
    });
  });

  it("stderr output for blank-value errors never contains a stack trace", async () => {
    await main(["read", "--id", "   "]);

    expect(stderr()).not.toContain("at ");
  });
});
