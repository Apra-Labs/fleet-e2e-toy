import { apiRequest, ApiError } from "../src/cli/client";

jest.mock("../src/cli/client", () => {
  const actual = jest.requireActual("../src/cli/client");
  return {
    apiRequest: jest.fn(),
    ApiError: actual.ApiError,
  };
});

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

describe("CLI commands", () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);
    mockedApiRequest.mockReset();
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  describe("list", () => {
    it("requests all notes with no filters", async () => {
      const { listCommand } = await import("../src/cli/commands/list");
      mockedApiRequest.mockResolvedValueOnce([]);

      await listCommand([]);

      expect(mockedApiRequest).toHaveBeenCalledWith("/api/notes");
    });

    it("honors --tag and --q filters", async () => {
      const { listCommand } = await import("../src/cli/commands/list");
      mockedApiRequest.mockResolvedValueOnce([]);

      await listCommand(["--tag", "work", "--q", "meeting"]);

      const calledPath = mockedApiRequest.mock.calls[0][0];
      expect(calledPath).toContain("/api/notes?");
      expect(calledPath).toContain("tag=work");
      expect(calledPath).toContain("q=meeting");
    });

    it("propagates a clear error when the API request fails", async () => {
      const { listCommand } = await import("../src/cli/commands/list");
      mockedApiRequest.mockRejectedValueOnce(new ApiError("Could not reach NoteAPI at http://localhost:3000"));

      await expect(listCommand([])).rejects.toThrow(/Could not reach NoteAPI/);
    });
  });

  describe("read", () => {
    it("prints the matching note for --id", async () => {
      const { readCommand } = await import("../src/cli/commands/read");
      mockedApiRequest.mockResolvedValueOnce({
        id: "abc",
        title: "t",
        content: "c",
        tags: [],
        createdAt: "now",
        updatedAt: "now",
      });

      await readCommand(["--id", "abc"]);

      expect(mockedApiRequest).toHaveBeenCalledWith("/api/notes/abc");
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("abc"));
    });

    it("throws a clear error when --id is missing", async () => {
      const { readCommand } = await import("../src/cli/commands/read");

      await expect(readCommand([])).rejects.toThrow(/Usage: read --id/);
      expect(mockedApiRequest).not.toHaveBeenCalled();
    });

    it("propagates a clear error when the note is not found (404)", async () => {
      const { readCommand } = await import("../src/cli/commands/read");
      mockedApiRequest.mockRejectedValueOnce(new ApiError("Note not found", 404));

      await expect(readCommand(["--id", "missing"])).rejects.toThrow(/Note not found/);
      expect(mockedApiRequest).toHaveBeenCalledWith("/api/notes/missing");
    });
  });

  describe("create", () => {
    it("requires --title and --content", async () => {
      const { createCommand } = await import("../src/cli/commands/create");

      await expect(createCommand(["--title", "only"])).rejects.toThrow(/Usage: create/);
      expect(mockedApiRequest).not.toHaveBeenCalled();
    });

    it("creates a note and prints it", async () => {
      const { createCommand } = await import("../src/cli/commands/create");
      mockedApiRequest.mockResolvedValueOnce({
        id: "1",
        title: "T",
        content: "C",
        tags: [],
        createdAt: "now",
        updatedAt: "now",
      });

      await createCommand(["--title", "T", "--content", "C"]);

      expect(mockedApiRequest).toHaveBeenCalledWith(
        "/api/notes",
        expect.objectContaining({ method: "POST", body: JSON.stringify({ title: "T", content: "C" }) })
      );
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("T"));
    });

    it("propagates a clear error when the API request fails", async () => {
      const { createCommand } = await import("../src/cli/commands/create");
      mockedApiRequest.mockRejectedValueOnce(new ApiError("title: Title is required and must be a non-empty string", 400));

      await expect(createCommand(["--title", "T", "--content", "C"])).rejects.toThrow(/Title is required/);
    });
  });

  describe("update", () => {
    it("requires --id and at least one field", async () => {
      const { updateCommand } = await import("../src/cli/commands/update");

      await expect(updateCommand(["--id", "1"])).rejects.toThrow(/Usage: update/);
      expect(mockedApiRequest).not.toHaveBeenCalled();
    });

    it("applies provided fields", async () => {
      const { updateCommand } = await import("../src/cli/commands/update");
      mockedApiRequest.mockResolvedValueOnce({
        id: "1",
        title: "New",
        content: "C",
        tags: [],
        createdAt: "now",
        updatedAt: "now",
      });

      await updateCommand(["--id", "1", "--title", "New"]);

      expect(mockedApiRequest).toHaveBeenCalledWith(
        "/api/notes/1",
        expect.objectContaining({ method: "PUT", body: JSON.stringify({ title: "New" }) })
      );
    });

    it("propagates a clear error when the note is not found (404)", async () => {
      const { updateCommand } = await import("../src/cli/commands/update");
      mockedApiRequest.mockRejectedValueOnce(new ApiError("Note not found", 404));

      await expect(updateCommand(["--id", "missing", "--title", "New"])).rejects.toThrow(/Note not found/);
    });
  });

  describe("delete", () => {
    it("requires --id", async () => {
      const { deleteCommand } = await import("../src/cli/commands/delete");

      await expect(deleteCommand([])).rejects.toThrow(/Usage: delete --id/);
      expect(mockedApiRequest).not.toHaveBeenCalled();
    });

    it("deletes the note by id", async () => {
      const { deleteCommand } = await import("../src/cli/commands/delete");
      mockedApiRequest.mockResolvedValueOnce(undefined);

      await deleteCommand(["--id", "1"]);

      expect(mockedApiRequest).toHaveBeenCalledWith("/api/notes/1", expect.objectContaining({ method: "DELETE" }));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("1"));
    });

    it("propagates a clear error when the note is not found (404)", async () => {
      const { deleteCommand } = await import("../src/cli/commands/delete");
      mockedApiRequest.mockRejectedValueOnce(new ApiError("Note not found", 404));

      await expect(deleteCommand(["--id", "missing"])).rejects.toThrow(/Note not found/);
    });
  });
});
