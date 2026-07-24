import { run } from "../src/cli/index";
import { CommandIO } from "../src/cli/commands";
import { client } from "../src/cli/client";
import { ApiError } from "../src/cli/client";
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

describe("CLI list command", () => {
  it("prints all notes when no flags given", async () => {
    mockedClient.list.mockResolvedValue([makeNote({ id: "1" }), makeNote({ id: "2" })]);
    const io = makeIo();
    const code = await run(["list"], io);
    expect(code).toBe(0);
    expect(mockedClient.list).toHaveBeenCalledWith({ tag: undefined, q: undefined });
    const text = io.outLines.join("\n");
    expect(text).toContain("1");
    expect(text).toContain("2");
    expect(io.errLines).toHaveLength(0);
  });

  it("filters by --tag=work", async () => {
    mockedClient.list.mockResolvedValue([makeNote({ tags: ["work"] })]);
    const io = makeIo();
    const code = await run(["list", "--tag", "work"], io);
    expect(code).toBe(0);
    expect(mockedClient.list).toHaveBeenCalledWith({ tag: "work", q: undefined });
  });

  it("filters by --q=meeting", async () => {
    mockedClient.list.mockResolvedValue([makeNote({ title: "Meeting notes" })]);
    const io = makeIo();
    const code = await run(["list", "--q", "meeting"], io);
    expect(code).toBe(0);
    expect(mockedClient.list).toHaveBeenCalledWith({ tag: undefined, q: "meeting" });
  });

  it("prints a friendly message when no notes match", async () => {
    mockedClient.list.mockResolvedValue([]);
    const io = makeIo();
    const code = await run(["list"], io);
    expect(code).toBe(0);
    expect(io.outLines.join("\n")).toContain("No notes found");
  });

  it("yields non-zero exit and an { error } style message on API error", async () => {
    mockedClient.list.mockRejectedValue(new ApiError(500, "server exploded"));
    const io = makeIo();
    const code = await run(["list"], io);
    expect(code).not.toBe(0);
    expect(io.errLines.join("\n")).toContain("server exploded");
    expect(io.errLines.join("\n")).not.toMatch(/at .*\(.*:\d+:\d+\)/);
  });
});
