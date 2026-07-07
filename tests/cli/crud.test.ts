import { Server } from "http";
import { AddressInfo } from "net";
import app from "../../src/app";
import { noteStore } from "../../src/models/note";
import { listCommand } from "../../src/cli/commands/list";
import { readCommand } from "../../src/cli/commands/read";
import { createCommand } from "../../src/cli/commands/create";
import { updateCommand } from "../../src/cli/commands/update";
import { deleteCommand } from "../../src/cli/commands/delete";
import { CliFlags } from "../../src/cli/index";

let server: Server;

interface CaptureResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

async function invoke(
  handler: (flags: CliFlags) => Promise<void> | void,
  flags: CliFlags
): Promise<CaptureResult> {
  const stdoutWrites: string[] = [];
  const stderrWrites: string[] = [];

  const originalStdoutWrite = process.stdout.write.bind(process.stdout);
  const originalStderrWrite = process.stderr.write.bind(process.stderr);
  const originalExitCode = process.exitCode;

  process.exitCode = 0;
  process.stdout.write = ((chunk: string): boolean => {
    stdoutWrites.push(chunk.toString());
    return true;
  }) as typeof process.stdout.write;
  process.stderr.write = ((chunk: string): boolean => {
    stderrWrites.push(chunk.toString());
    return true;
  }) as typeof process.stderr.write;

  try {
    await handler(flags);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    stderrWrites.push(`Error: ${message}\n`);
    process.exitCode = 1;
  }

  const exitCode = typeof process.exitCode === "number" ? process.exitCode : 0;
  process.stdout.write = originalStdoutWrite;
  process.stderr.write = originalStderrWrite;
  process.exitCode = originalExitCode;

  return {
    stdout: stdoutWrites.join(""),
    stderr: stderrWrites.join(""),
    exitCode,
  };
}

beforeAll((done) => {
  server = app.listen(0, () => {
    const { port } = server.address() as AddressInfo;
    process.env.NOTEAPI_URL = `http://localhost:${port}`;
    done();
  });
});

afterAll((done) => {
  server.close(() => done());
});

beforeEach(() => {
  noteStore.clear();
});

describe("CLI CRUD commands end-to-end", () => {
  it("create --title/--content returns exit 0 and emits an id", async () => {
    const result = await invoke(createCommand, { title: "First Note", content: "Hello world" });

    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim().length).toBeGreaterThan(0);
    expect(result.stderr).toBe("");
  });

  it("list shows the created note; list --tag filters correctly", async () => {
    await invoke(createCommand, { title: "Work Note", content: "Body A", tags: "work" });
    await invoke(createCommand, { title: "Personal Note", content: "Body B", tags: "personal" });

    const all = await invoke(listCommand, {});
    expect(all.exitCode).toBe(0);
    expect(all.stdout).toContain("Work Note");
    expect(all.stdout).toContain("Personal Note");

    const filtered = await invoke(listCommand, { tag: "work" });
    expect(filtered.exitCode).toBe(0);
    expect(filtered.stdout).toContain("Work Note");
    expect(filtered.stdout).not.toContain("Personal Note");
  });

  it("read --id <created> returns the note", async () => {
    const created = await invoke(createCommand, { title: "Readable", content: "Content here" });
    const id = created.stdout.trim();

    const result = await invoke(readCommand, { id });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Readable");
    expect(result.stdout).toContain(id);
  });

  it("read of a bogus id exits non-zero with a clean Error: message (no stack trace)", async () => {
    const result = await invoke(readCommand, { id: "does-not-exist" });

    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("Error:");
    expect(result.stderr).not.toContain(" at ");
    expect(result.stdout).toBe("");
  });

  it("update --id changes the title; a following read reflects it", async () => {
    const created = await invoke(createCommand, { title: "Original Title", content: "Content" });
    const id = created.stdout.trim();

    const updateResult = await invoke(updateCommand, { id, title: "Updated Title" });
    expect(updateResult.exitCode).toBe(0);
    expect(updateResult.stdout).toContain("Updated Title");

    const readResult = await invoke(readCommand, { id });
    expect(readResult.exitCode).toBe(0);
    expect(readResult.stdout).toContain("Updated Title");
    expect(readResult.stdout).not.toContain("Original Title");
  });

  it("delete --id removes it; a following read exits non-zero", async () => {
    const created = await invoke(createCommand, { title: "To Delete", content: "Content" });
    const id = created.stdout.trim();

    const deleteResult = await invoke(deleteCommand, { id });
    expect(deleteResult.exitCode).toBe(0);
    expect(deleteResult.stderr).toBe("");

    const readResult = await invoke(readCommand, { id });
    expect(readResult.exitCode).not.toBe(0);
    expect(readResult.stderr).toContain("Error:");
    expect(readResult.stderr).not.toContain(" at ");
  });

  it("missing required flags (create with no --title) exit non-zero with a clean error", async () => {
    const result = await invoke(createCommand, { content: "Body without title" });

    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("Error:");
    expect(result.stderr).not.toContain(" at ");
    expect(result.stdout).toBe("");
  });
});
