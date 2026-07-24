import { run } from "../src/cli/index";
import { CommandIO } from "../src/cli/commands";
import { client, ApiError } from "../src/cli/client";
import { Note } from "../src/models/note";

jest.mock("../src/cli/client", () => {
  const actual = jest.requireActual("../src/cli/client");
  return {
    ...actual,
    client: {
      list: jest.fn(),
      read: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
});

const mockedClient = client as jest.Mocked<typeof client>;

function makeIo(): CommandIO & { outLines: string[]; errLines: string[] } {
  const outLines: string[] = [];
  const errLines: string[] = [];
  return {
    outLines,
    errLines,
    out: (line: string) => outLines.push(line),
    err: (line: string) => errLines.push(line),
  };
}

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: "abc123",
    title: "My Note",
    content: "Body",
    tags: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CLI update command", () => {
  it("updating title only works", async () => {
    mockedClient.update.mockResolvedValue(makeNote({ title: "New Title" }));
    const io = makeIo();
    const code = await run(["update", "--id", "abc123", "--title", "New Title"], io);
    expect(code).toBe(0);
    expect(mockedClient.update).toHaveBeenCalledWith("abc123", { title: "New Title" });
    expect(io.outLines.join("\n")).toContain("New Title");
    expect(io.errLines).toHaveLength(0);
  });

  it("updating content only works", async () => {
    mockedClient.update.mockResolvedValue(makeNote({ content: "New Body" }));
    const io = makeIo();
    const code = await run(["update", "--id", "abc123", "--content", "New Body"], io);
    expect(code).toBe(0);
    expect(mockedClient.update).toHaveBeenCalledWith("abc123", { content: "New Body" });
    expect(io.outLines.join("\n")).toContain("New Body");
  });

  it("missing --id errors non-zero without calling the API", async () => {
    const io = makeIo();
    const code = await run(["update", "--title", "New Title"], io);
    expect(code).not.toBe(0);
    expect(io.errLines.join("\n")).toContain("--id");
    expect(mockedClient.update).not.toHaveBeenCalled();
  });

  it("404 is surfaced readably with non-zero exit", async () => {
    mockedClient.update.mockRejectedValue(new ApiError(404, "note not found"));
    const io = makeIo();
    const code = await run(["update", "--id", "missing", "--title", "X"], io);
    expect(code).not.toBe(0);
    expect(io.errLines.join("\n")).toContain("note not found");
    expect(io.errLines.join("\n")).not.toMatch(/at .*\(.*:\d+:\d+\)/);
  });
});
