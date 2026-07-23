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

  describe("create", () => {
    it("creates a note and prints it, exit 0", async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse(sampleNote, 201));

      const code = await main(["create", "--title", "Meeting notes", "--content", "Discuss roadmap"]);

      expect(code).toBe(0);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const init = fetchSpy.mock.calls[0][1];
      expect(init?.method).toBe("POST");
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Meeting notes"));
    });

    it("collects repeated --tag flags", async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse(sampleNote, 201));

      const code = await main([
        "create",
        "--title",
        "T",
        "--content",
        "C",
        "--tag",
        "work",
        "--tag",
        "urgent",
      ]);

      expect(code).toBe(0);
      const init = fetchSpy.mock.calls[0][1];
      const body = JSON.parse(init?.body as string);
      expect(body.tags).toEqual(["work", "urgent"]);
    });

    it("requires --title", async () => {
      const code = await main(["create", "--content", "C"]);

      expect(code).toBe(1);
      expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("Missing required flag --title"));
    });

    it("requires --content", async () => {
      const code = await main(["create", "--title", "T"]);

      expect(code).toBe(1);
      expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("Missing required flag --content"));
    });

    it("prints a wrapped error and exits non-zero on API failure", async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse({ error: "boom" }, 500));

      const code = await main(["create", "--title", "T", "--content", "C"]);

      expect(code).toBe(1);
      expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("boom"));
    });
  });

  describe("update", () => {
    it("updates the note and prints it, exit 0", async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse(sampleNote));

      const code = await main(["update", "--id", "abc-123", "--title", "New title"]);

      expect(code).toBe(0);
      const init = fetchSpy.mock.calls[0][1];
      expect(init?.method).toBe("PUT");
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Meeting notes"));
    });

    it("requires --id", async () => {
      const code = await main(["update", "--title", "New title"]);

      expect(code).toBe(1);
      expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("Missing required flag --id"));
    });

    it("prints a wrapped error and exits non-zero on API failure", async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse({ error: "Note not found" }, 404));

      const code = await main(["update", "--id", "missing", "--title", "New title"]);

      expect(code).toBe(1);
      expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("Note not found"));
    });
  });

  describe("delete", () => {
    it("deletes the note and prints confirmation, exit 0", async () => {
      fetchSpy.mockResolvedValueOnce({ ok: true, status: 204, json: async () => ({}) } as Response);

      const code = await main(["delete", "--id", "abc-123"]);

      expect(code).toBe(0);
      const init = fetchSpy.mock.calls[0][1];
      expect(init?.method).toBe("DELETE");
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("abc-123"));
    });

    it("requires --id", async () => {
      const code = await main(["delete"]);

      expect(code).toBe(1);
      expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("Missing required flag --id"));
    });

    it("prints a wrapped error and exits non-zero on API failure", async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse({ error: "Note not found" }, 404));

      const code = await main(["delete", "--id", "missing"]);

      expect(code).toBe(1);
      expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("Note not found"));
    });
  });

  describe("unknown command", () => {
    it("prints an error and exits non-zero", async () => {
      const code = await main(["bogus"]);

      expect(code).toBe(1);
      expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("Unknown command"));
    });

    it("prints a usage hint to stderr", async () => {
      const code = await main(["bogus"]);

      expect(code).toBe(1);
      expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("Usage:"));
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe("help", () => {
    it("'--help' prints top-level usage and exits 0", async () => {
      const code = await main(["--help"]);

      expect(code).toBe(0);
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Usage:"));
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("list"));
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("create"));
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("'-h' prints top-level usage and exits 0", async () => {
      const code = await main(["-h"]);

      expect(code).toBe(0);
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Usage:"));
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it.each(["list", "read", "create", "update", "delete"])(
      "'%s --help' prints subcommand-specific usage and exits 0",
      async (subcommand) => {
        const code = await main([subcommand, "--help"]);

        expect(code).toBe(0);
        expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining(`Usage: noteapi-cli ${subcommand}`));
        expect(fetchSpy).not.toHaveBeenCalled();
      }
    );

    it("'list -h' prints subcommand-specific usage and exits 0", async () => {
      const code = await main(["list", "-h"]);

      expect(code).toBe(0);
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: noteapi-cli list"));
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("help output does not contain stack traces", async () => {
      await main(["--help"]);

      const output = stdoutSpy.mock.calls[0][0] as string;
      expect(output).not.toContain("at ");
    });
  });
});
