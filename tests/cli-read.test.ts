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
    tags: ["work"],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CLI read command", () => {
  it("valid id prints the note", async () => {
    mockedClient.read.mockResolvedValue(makeNote({ id: "abc123" }));
    const io = makeIo();
    const code = await run(["read", "--id", "abc123"], io);
    expect(code).toBe(0);
    expect(mockedClient.read).toHaveBeenCalledWith("abc123");
    expect(io.outLines.join("\n")).toContain("abc123");
    expect(io.errLines).toHaveLength(0);
  });

  it("missing --id errors non-zero without calling the API", async () => {
    const io = makeIo();
    const code = await run(["read"], io);
    expect(code).not.toBe(0);
    expect(io.errLines.join("\n")).toContain("--id");
    expect(mockedClient.read).not.toHaveBeenCalled();
  });

  it("not-found (404) errors non-zero with no stack trace", async () => {
    mockedClient.read.mockRejectedValue(new ApiError(404, "note not found"));
    const io = makeIo();
    const code = await run(["read", "--id", "missing"], io);
    expect(code).not.toBe(0);
    expect(io.errLines.join("\n")).toContain("note not found");
    expect(io.errLines.join("\n")).not.toMatch(/at .*\(.*:\d+:\d+\)/);
  });
});
