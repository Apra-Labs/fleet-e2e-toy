/**
 * Integration tests for the CRUD CLI subcommands (create/list/read/update/delete).
 *
 * The NoteAPI is started in-process on an ephemeral port (listen(0)).
 * NOTEAPI_URL is set before importing the CLI module so that apiClient.ts
 * picks up the correct base URL.  noteStore is reset between each test.
 */
import { Server } from "http";
import app from "../src/app";
import { noteStore } from "../src/models/note";

let server: Server;
let mainFn: (argv: string[]) => Promise<number>;

beforeAll((done) => {
  server = app.listen(0, () => {
    const addr = server.address();
    if (!addr || typeof addr === "string") {
      done(new Error("Unexpected server address format"));
      return;
    }
    const port = addr.port;
    process.env.NOTEAPI_URL = `http://localhost:${port}`;

    // Import main after NOTEAPI_URL is set so apiClient reads the right base URL
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const cliModule = require("../src/cli/index") as { main: (argv: string[]) => Promise<number> };
      mainFn = cliModule.main;
      done();
    });
  });
});

afterAll((done) => {
  server.close(done);
  delete process.env.NOTEAPI_URL;
});

beforeEach(() => {
  noteStore.clear();
});

// Helper to capture stdout for a main() call
async function captureStdout(argv: string[]): Promise<{ code: number; output: string }> {
  const chunks: string[] = [];
  const spy = jest.spyOn(process.stdout, "write").mockImplementation((chunk) => {
    chunks.push(typeof chunk === "string" ? chunk : chunk.toString());
    return true;
  });
  try {
    const code = await mainFn(argv);
    return { code, output: chunks.join("") };
  } finally {
    spy.mockRestore();
  }
}

// Helper to capture stderr for a main() call
async function captureStderr(argv: string[]): Promise<{ code: number; output: string }> {
  const chunks: string[] = [];
  const spy = jest.spyOn(process.stderr, "write").mockImplementation((chunk) => {
    chunks.push(typeof chunk === "string" ? chunk : chunk.toString());
    return true;
  });
  try {
    const code = await mainFn(argv);
    return { code, output: chunks.join("") };
  } finally {
    spy.mockRestore();
  }
}

describe("CLI CRUD lifecycle", () => {
  it("create --title T --content C exits 0 and stdout contains id and title", async () => {
    const { code, output } = await captureStdout([
      "create",
      "--title",
      "Test Note",
      "--content",
      "Hello World",
    ]);
    expect(code).toBe(0);
    // Output should contain the title and an ID field
    expect(output).toContain("Test Note");
    expect(output).toMatch(/ID:/);
  });

  it("list exits 0 and output includes the created note", async () => {
    // First create a note
    await captureStdout(["create", "--title", "List Me", "--content", "content"]);

    const { code, output } = await captureStdout(["list"]);
    expect(code).toBe(0);
    expect(output).toContain("List Me");
  });

  it("list --tag <t> filters to only matching notes", async () => {
    await captureStdout([
      "create",
      "--title",
      "Tagged",
      "--content",
      "c",
      "--tags",
      "work",
    ]);
    await captureStdout([
      "create",
      "--title",
      "Other",
      "--content",
      "c",
      "--tags",
      "personal",
    ]);

    const { code, output } = await captureStdout(["list", "--tag", "work"]);
    expect(code).toBe(0);
    expect(output).toContain("Tagged");
    expect(output).not.toContain("Other");
  });

  it("read --id <id> exits 0 and prints the note", async () => {
    // Capture the ID from create output
    const { output: createOutput } = await captureStdout([
      "create",
      "--title",
      "Readable",
      "--content",
      "body",
    ]);
    // Extract the ID line: "ID:      <uuid>"
    const idMatch = createOutput.match(/ID:\s+(\S+)/);
    expect(idMatch).not.toBeNull();
    const id = idMatch![1];

    const { code, output } = await captureStdout(["read", "--id", id]);
    expect(code).toBe(0);
    expect(output).toContain("Readable");
    expect(output).toContain(id);
  });

  it("read --id missing returns non-zero", async () => {
    const { code } = await captureStderr(["read", "--id", "does-not-exist"]);
    expect(code).not.toBe(0);
  });

  it("update --id <id> --title New exits 0 and output reflects new title", async () => {
    const { output: createOutput } = await captureStdout([
      "create",
      "--title",
      "Old Title",
      "--content",
      "body",
    ]);
    const idMatch = createOutput.match(/ID:\s+(\S+)/);
    expect(idMatch).not.toBeNull();
    const id = idMatch![1];

    const { code, output } = await captureStdout([
      "update",
      "--id",
      id,
      "--title",
      "New Title",
    ]);
    expect(code).toBe(0);
    expect(output).toContain("New Title");
  });

  it("delete --id <id> exits 0; subsequent read returns non-zero", async () => {
    const { output: createOutput } = await captureStdout([
      "create",
      "--title",
      "Delete Me",
      "--content",
      "bye",
    ]);
    const idMatch = createOutput.match(/ID:\s+(\S+)/);
    expect(idMatch).not.toBeNull();
    const id = idMatch![1];

    // Delete should succeed
    const { code: deleteCode } = await captureStdout(["delete", "--id", id]);
    expect(deleteCode).toBe(0);

    // Subsequent read should fail with non-zero
    const { code: readCode } = await captureStderr(["read", "--id", id]);
    expect(readCode).not.toBe(0);
  });
});
