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
    id: "new-id",
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

describe("CLI create command", () => {
  it("valid input prints the created note with id", async () => {
    mockedClient.create.mockResolvedValue(makeNote({ id: "new-id", title: "My Note" }));
    const io = makeIo();
    const code = await run(["create", "--title", "My Note", "--content", "Body"], io);
    expect(code).toBe(0);
    expect(mockedClient.create).toHaveBeenCalledWith({
      title: "My Note",
      content: "Body",
      tags: [],
    });
    expect(io.outLines.join("\n")).toContain("new-id");
    expect(io.errLines).toHaveLength(0);
  });

  it("supports repeated --tag flags", async () => {
    mockedClient.create.mockResolvedValue(makeNote({ tags: ["work", "urgent"] }));
    const io = makeIo();
    const code = await run(
      ["create", "--title", "T", "--content", "C", "--tag", "work", "--tag", "urgent"],
      io
    );
    expect(code).toBe(0);
    expect(mockedClient.create).toHaveBeenCalledWith({
      title: "T",
      content: "C",
      tags: ["work", "urgent"],
    });
  });

  it("missing --title errors non-zero without calling the API", async () => {
    const io = makeIo();
    const code = await run(["create", "--content", "Body"], io);
    expect(code).not.toBe(0);
    expect(io.errLines.join("\n")).toContain("--title");
    expect(mockedClient.create).not.toHaveBeenCalled();
  });

  it("missing --content errors non-zero without calling the API", async () => {
    const io = makeIo();
    const code = await run(["create", "--title", "T"], io);
    expect(code).not.toBe(0);
    expect(io.errLines.join("\n")).toContain("--content");
    expect(mockedClient.create).not.toHaveBeenCalled();
  });

  it("API 400 is surfaced as a readable error with non-zero exit", async () => {
    mockedClient.create.mockRejectedValue(new ApiError(400, "title is required"));
    const io = makeIo();
    const code = await run(["create", "--title", "T", "--content", "C"], io);
    expect(code).not.toBe(0);
    expect(io.errLines.join("\n")).toContain("title is required");
    expect(io.errLines.join("\n")).not.toMatch(/at .*\(.*:\d+:\d+\)/);
  });
});
