import { main } from "../src/cli/index";
import { Note } from "../src/models/note";

const sampleNote: Note = {
  id: "abc-123",
  title: "Meeting notes",
  content: "Discuss roadmap",
  tags: ["work"],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("CLI", () => {
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

  describe("list", () => {
    it("prints all notes", async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse([sampleNote]));

      const code = await main(["list"]);

      expect(code).toBe(0);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const calledUrl = fetchSpy.mock.calls[0][0] as URL;
      expect(calledUrl.toString()).toBe("http://localhost:3000/api/notes");
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Meeting notes"));
    });

    it("filters by --tag", async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse([sampleNote]));

      const code = await main(["list", "--tag", "work"]);

      expect(code).toBe(0);
      const calledUrl = fetchSpy.mock.calls[0][0] as URL;
      expect(calledUrl.searchParams.get("tag")).toBe("work");
    });

    it("filters by --q", async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse([sampleNote]));

      const code = await main(["list", "--q", "meeting"]);

      expect(code).toBe(0);
      const calledUrl = fetchSpy.mock.calls[0][0] as URL;
      expect(calledUrl.searchParams.get("q")).toBe("meeting");
    });

    it("prints a stderr error and exits non-zero on API failure", async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse({ error: "boom" }, 500));

      const code = await main(["list"]);

      expect(code).toBe(1);
      expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("boom"));
    });
  });

  describe("read", () => {
    it("prints the matching note and exits 0", async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse(sampleNote));

      const code = await main(["read", "--id", "abc-123"]);

      expect(code).toBe(0);
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Meeting notes"));
    });

    it("prints a wrapped error and exits non-zero when not found", async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse({ error: "Note not found" }, 404));

      const code = await main(["read", "--id", "missing"]);

      expect(code).toBe(1);
      expect(stderrSpy).toHaveBeenCalledTimes(1);
      const stderrOutput = stderrSpy.mock.calls[0][0] as string;
      expect(() => JSON.parse(stderrOutput)).not.toThrow();
      expect(JSON.parse(stderrOutput)).toEqual({ error: "Note not found" });
      expect(stderrOutput).not.toContain("at ");
    });

    it("requires --id", async () => {
      const code = await main(["read"]);

      expect(code).toBe(1);
      expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("Missing required flag --id"));
    });
  });

  describe("unknown command", () => {
    it("prints an error and exits non-zero", async () => {
      const code = await main(["bogus"]);

      expect(code).toBe(1);
      expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("Unknown command"));
    });
  });
});
