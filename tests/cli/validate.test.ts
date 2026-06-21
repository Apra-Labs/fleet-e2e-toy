import { requireFlag, optionalFlag } from "../../src/cli/validate";
import { CliError } from "../../src/cli/types";
import { noteStore, Note } from "../../src/models/note";
import request from "supertest";
import app from "../../src/app";

// Mock apiClient for end-to-end validation tests
jest.mock("../../src/cli/apiClient");

import * as apiClient from "../../src/cli/apiClient";
import { main } from "../../src/cli/cli";

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

beforeEach(() => {
  noteStore.clear();
  jest.clearAllMocks();

  // Default implementations proxy through in-process Express app
  mockApiClient.createNote.mockImplementation(async (input) => {
    const res = await request(app).post("/api/notes").send(input);
    if (res.status >= 200 && res.status < 300) return res.body as Note;
    const msg = (res.body as Record<string, unknown>)?.error ?? `Request failed with status ${res.status}`;
    throw new CliError(String(msg), res.status);
  });

  mockApiClient.getNote.mockImplementation(async (id: string) => {
    const res = await request(app).get(`/api/notes/${encodeURIComponent(id)}`);
    if (res.status >= 200 && res.status < 300) return res.body as Note;
    const msg = (res.body as Record<string, unknown>)?.error ?? `Request failed with status ${res.status}`;
    throw new CliError(String(msg), res.status);
  });
});

/** Capture stdout/stderr during main() and return them. */
async function runMain(argv: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const stdoutChunks: string[] = [];
  const stderrChunks: string[] = [];

  const origStdoutWrite = process.stdout.write.bind(process.stdout);
  const origStderrWrite = process.stderr.write.bind(process.stderr);

  process.stdout.write = ((chunk: string) => {
    stdoutChunks.push(chunk);
    return true;
  }) as typeof process.stdout.write;

  process.stderr.write = ((chunk: string) => {
    stderrChunks.push(chunk);
    return true;
  }) as typeof process.stderr.write;

  let exitCode: number;
  try {
    exitCode = await main(argv);
  } finally {
    process.stdout.write = origStdoutWrite;
    process.stderr.write = origStderrWrite;
  }

  return {
    stdout: stdoutChunks.join(""),
    stderr: stderrChunks.join(""),
    exitCode,
  };
}

describe("requireFlag", () => {
  it("returns the trimmed value when flag is present", () => {
    const result = requireFlag({ title: "My Note" }, "title");
    expect(result).toBe("My Note");
  });

  it("trims whitespace from value", () => {
    const result = requireFlag({ title: "  hello  " }, "title");
    expect(result).toBe("hello");
  });

  it("throws CliError when flag is missing", () => {
    expect(() => requireFlag({}, "title")).toThrow(CliError);
  });

  it("throws CliError with message naming the flag when missing", () => {
    expect(() => requireFlag({}, "title")).toThrow("--title is required and cannot be empty");
  });

  it("throws CliError when flag is whitespace-only", () => {
    expect(() => requireFlag({ title: "   " }, "title")).toThrow(CliError);
  });

  it("throws CliError with message naming the flag when whitespace-only", () => {
    expect(() => requireFlag({ title: "   " }, "title")).toThrow("--title is required and cannot be empty");
  });

  it("throws CliError when flag is boolean true (no value)", () => {
    expect(() => requireFlag({ title: true }, "title")).toThrow(CliError);
  });

  it("names the offending flag in the error message", () => {
    expect(() => requireFlag({}, "content")).toThrow("--content is required and cannot be empty");
  });
});

describe("optionalFlag", () => {
  it("returns trimmed value when flag is present", () => {
    expect(optionalFlag({ q: "search term" }, "q")).toBe("search term");
  });

  it("returns undefined when flag is missing", () => {
    expect(optionalFlag({}, "q")).toBeUndefined();
  });

  it("returns undefined when flag is whitespace-only", () => {
    expect(optionalFlag({ q: "   " }, "q")).toBeUndefined();
  });

  it("returns undefined when flag is boolean true", () => {
    expect(optionalFlag({ q: true }, "q")).toBeUndefined();
  });
});

describe("CLI end-to-end input validation", () => {
  it("create with blank --title yields non-zero exit and clear error message", async () => {
    const { stderr, exitCode } = await runMain([
      "create",
      "--title", "   ",
      "--content", "x",
    ]);

    expect(exitCode).toBe(1);
    expect(stderr).toBeTruthy();
    // Error must be a JSON { error } object without a stack trace
    const parsed = JSON.parse(stderr.trim()) as Record<string, unknown>;
    expect(typeof parsed.error).toBe("string");
    expect(parsed.error).toContain("--title is required");
    expect(stderr).not.toContain("    at ");
  });

  it("create with blank --title does not expose a stack trace", async () => {
    const { stderr } = await runMain([
      "create",
      "--title", "   ",
      "--content", "x",
    ]);

    expect(stderr).not.toContain("    at ");
  });

  it("read with no --id yields non-zero exit and clear error message", async () => {
    const { stderr, exitCode } = await runMain(["read"]);

    expect(exitCode).toBe(1);
    expect(stderr).toBeTruthy();
    const parsed = JSON.parse(stderr.trim()) as Record<string, unknown>;
    expect(typeof parsed.error).toBe("string");
    expect(parsed.error).toContain("--id is required");
  });

  it("valid create input passes validation and exits 0", async () => {
    const { exitCode } = await runMain([
      "create",
      "--title", "Valid Title",
      "--content", "Valid content",
    ]);

    expect(exitCode).toBe(0);
  });

  it("valid read input passes validation and exits 0", async () => {
    const createRes = await request(app)
      .post("/api/notes")
      .send({ title: "Note to read", content: "Content", tags: [] });
    const id = (createRes.body as Note).id;

    const { exitCode } = await runMain(["read", "--id", id]);

    expect(exitCode).toBe(0);
  });
});
