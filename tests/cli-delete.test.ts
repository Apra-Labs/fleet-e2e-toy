import { run } from "../src/cli/index";
import { CommandIO } from "../src/cli/commands";
import { client, ApiError } from "../src/cli/client";

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

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CLI delete command", () => {
  it("valid id deletes and prints confirmation, exit 0", async () => {
    mockedClient.delete.mockResolvedValue(undefined);
    const io = makeIo();
    const code = await run(["delete", "--id", "abc123"], io);
    expect(code).toBe(0);
    expect(mockedClient.delete).toHaveBeenCalledWith("abc123");
    expect(io.outLines.join("\n")).toContain("abc123");
    expect(io.errLines).toHaveLength(0);
  });

  it("missing --id errors non-zero without calling the API", async () => {
    const io = makeIo();
    const code = await run(["delete"], io);
    expect(code).not.toBe(0);
    expect(io.errLines.join("\n")).toContain("--id");
    expect(mockedClient.delete).not.toHaveBeenCalled();
  });

  it("blank --id errors non-zero without calling the API", async () => {
    const io = makeIo();
    const code = await run(["delete", "--id", "   "], io);
    expect(code).not.toBe(0);
    expect(io.errLines.join("\n")).toContain("--id");
    expect(mockedClient.delete).not.toHaveBeenCalled();
  });

  it("404 is surfaced readably with non-zero exit", async () => {
    mockedClient.delete.mockRejectedValue(new ApiError(404, "note not found"));
    const io = makeIo();
    const code = await run(["delete", "--id", "missing"], io);
    expect(code).not.toBe(0);
    expect(io.errLines.join("\n")).toContain("note not found");
    expect(io.errLines.join("\n")).not.toMatch(/at .*\(.*:\d+:\d+\)/);
  });
});
