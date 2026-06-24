import http from "http";
import { exec } from "child_process";
import path from "path";
import app from "../src/app";
import { noteStore } from "../src/models/note";
import { validateOptions } from "../src/cli/validation";

const PORT = 3005;
jest.setTimeout(30000);

function runCLI(args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const cliPath = path.join(__dirname, "../src/cli/index.ts");
    const cmd = `npx ts-node "${cliPath}" ${args.map((a) => `"${a}"`).join(" ")}`;
    exec(
      cmd,
      {
        env: {
          ...process.env,
          PORT: PORT.toString(),
        },
      },
      (error, stdout, stderr) => {
        resolve({
          code: error ? (error.code ?? 1) : 0,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
        });
      }
    );
  });
}

describe("validateOptions Unit Tests", () => {
  it("should throw error if an option is empty string", () => {
    expect(() => validateOptions({ title: "" })).toThrow("title must not be empty");
  });

  it("should throw error if an option is whitespace-only", () => {
    expect(() => validateOptions({ tag: "   " })).toThrow("tag must not be empty");
  });

  it("should not throw error if options are valid", () => {
    expect(() => validateOptions({ title: "My Note", content: "some content" })).not.toThrow();
  });

  it("should not throw error if option is boolean", () => {
    expect(() => validateOptions({ help: true })).not.toThrow();
  });
});

describe("CLI Integration Tests", () => {
  let server: http.Server;

  beforeAll((done) => {
    server = app.listen(PORT, () => {
      done();
    });
  });

  afterAll((done) => {
    if (typeof server.closeAllConnections === "function") {
      server.closeAllConnections();
    }
    server.close(() => {
      done();
    });
  });

  beforeEach(() => {
    noteStore.clear();
  });

  it("prints global help with --help and exits 0", async () => {
    const { code, stdout } = await runCLI(["--help"]);
    expect(code).toBe(0);
    expect(stdout).toContain("Usage: fleet-e2e-toy <command> [options]");
  });

  it("prints command help with list -h and exits 0", async () => {
    const { code, stdout } = await runCLI(["list", "-h"]);
    expect(code).toBe(0);
    expect(stdout).toContain("Usage: fleet-e2e-toy list [options]");
    expect(stdout).toContain("--tag");
  });

  it("exits with 1 and prints validation error for empty option", async () => {
    const { code, stderr } = await runCLI(["create", "--title", ""]);
    expect(code).toBe(1);
    expect(stderr).toContain("Error: title must not be empty");
  });

  it("exits with 1 and prints validation error for whitespace option", async () => {
    const { code, stderr } = await runCLI(["create", "--title", "   "]);
    expect(code).toBe(1);
    expect(stderr).toContain("Error: title must not be empty");
  });

  it("performs full note CRUD lifecycle successfully", async () => {
    // 1. Create note
    const createRes = await runCLI([
      "create",
      "--title",
      "Hello World",
      "--content",
      "My first note",
      "--tags",
      "test,cli",
    ]);
    expect(createRes.code).toBe(0);
    expect(createRes.stdout).toContain("Title: Hello World");
    expect(createRes.stdout).toContain("Content: My first note");
    expect(createRes.stdout).toContain("Tags: test, cli");

    // Extract ID
    const match = createRes.stdout.match(/ID:\s*([a-zA-Z0-9-]+)/);
    expect(match).not.toBeNull();
    const noteId = match![1];

    // 2. Read note
    const readRes = await runCLI(["read", "--id", noteId]);
    expect(readRes.code).toBe(0);
    expect(readRes.stdout).toContain(`ID: ${noteId}`);
    expect(readRes.stdout).toContain("Title: Hello World");

    // 3. List notes
    const listRes = await runCLI(["list"]);
    expect(listRes.code).toBe(0);
    expect(listRes.stdout).toContain(`ID: ${noteId}`);
    expect(listRes.stdout).toContain("Title: Hello World");

    // 4. Update note
    const updateRes = await runCLI(["update", "--id", noteId, "--title", "Updated Title"]);
    expect(updateRes.code).toBe(0);
    expect(updateRes.stdout).toContain("Title: Updated Title");

    // 5. Delete note
    const deleteRes = await runCLI(["delete", "--id", noteId]);
    expect(deleteRes.code).toBe(0);

    // 6. Verify deleted (should exit with 1 on read)
    const readDeletedRes = await runCLI(["read", "--id", noteId]);
    expect(readDeletedRes.code).toBe(1);
    expect(readDeletedRes.stderr).toContain("Note not found");
  });
});
