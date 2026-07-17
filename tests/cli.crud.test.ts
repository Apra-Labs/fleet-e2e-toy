// End-to-end tests for the CLI CRUD subcommands.
//
// src/cli/client.ts talks to the API exclusively over real HTTP (via
// fetch + NOTEAPI_URL), so exercising it faithfully means starting the real
// Express app on an ephemeral port and pointing the CLI at it — an in-process
// supertest app object is not enough here, since fetch needs an actual
// listening socket. run() (the CLI's exported entry point) is invoked
// directly rather than spawning a subprocess, since it is the same code path
// `require.main === module` would use, and it lets us assert on stdout,
// stderr, and the returned exit code without shell-quoting overhead.

import { Server } from "http";
import { AddressInfo } from "net";
import app from "../src/app";
import { noteStore } from "../src/models/note";
import { run } from "../src/cli";

let server: Server;

beforeAll((done) => {
  server = app.listen(0, () => {
    const { port } = server.address() as AddressInfo;
    process.env.NOTEAPI_URL = `http://127.0.0.1:${port}`;
    done();
  });
});

afterAll((done) => {
  server.close(done);
});

beforeEach(() => {
  noteStore.clear();
});

// Captures everything written to a stream during a run() call, joined into
// a single string, without producing real output.
function captureWrites(stream: NodeJS.WriteStream): { text(): string; restore(): void } {
  const chunks: string[] = [];
  const spy = jest.spyOn(stream, "write").mockImplementation((chunk: unknown) => {
    chunks.push(typeof chunk === "string" ? chunk : String(chunk));
    return true;
  });
  return {
    text: () => chunks.join(""),
    restore: () => spy.mockRestore(),
  };
}

async function runCli(args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  const out = captureWrites(process.stdout);
  const err = captureWrites(process.stderr);
  try {
    const code = await run(args);
    return { code, stdout: out.text(), stderr: err.text() };
  } finally {
    out.restore();
    err.restore();
  }
}

describe("CLI create", () => {
  it("creates a note and prints it with exit code 0", async () => {
    const res = await runCli([
      "create",
      "--title",
      "First note",
      "--content",
      "Body text",
      "--tags",
      "work,urgent",
    ]);

    expect(res.code).toBe(0);
    expect(res.stderr).toBe("");
    const note = JSON.parse(res.stdout);
    expect(note.id).toBeDefined();
    expect(note.title).toBe("First note");
    expect(note.content).toBe("Body text");
    expect(note.tags).toEqual(["work", "urgent"]);
  });
});

describe("CLI list", () => {
  it("lists all notes", async () => {
    await runCli(["create", "--title", "A", "--content", "Content A", "--tags", "x"]);
    await runCli(["create", "--title", "B", "--content", "Content B", "--tags", "y"]);

    const res = await runCli(["list"]);
    expect(res.code).toBe(0);
    const notes = JSON.parse(res.stdout);
    expect(notes).toHaveLength(2);
  });

  it("filters by --tag", async () => {
    await runCli(["create", "--title", "Tagged", "--content", "Body", "--tags", "work"]);
    await runCli(["create", "--title", "Untagged", "--content", "Body", "--tags", "personal"]);

    const res = await runCli(["list", "--tag", "work"]);
    expect(res.code).toBe(0);
    const notes = JSON.parse(res.stdout);
    expect(notes).toHaveLength(1);
    expect(notes[0].title).toBe("Tagged");
  });

  it("filters by --q", async () => {
    await runCli(["create", "--title", "Meeting notes", "--content", "Discuss project", "--tags", ""]);
    await runCli(["create", "--title", "Shopping list", "--content", "Milk, eggs", "--tags", ""]);

    const res = await runCli(["list", "--q", "meeting"]);
    expect(res.code).toBe(0);
    const notes = JSON.parse(res.stdout);
    expect(notes).toHaveLength(1);
    expect(notes[0].title).toBe("Meeting notes");
  });
});

describe("CLI read", () => {
  it("reads a note by id", async () => {
    const create = await runCli(["create", "--title", "Find me", "--content", "Here", "--tags", ""]);
    const { id } = JSON.parse(create.stdout);

    const res = await runCli(["read", "--id", id]);
    expect(res.code).toBe(0);
    const note = JSON.parse(res.stdout);
    expect(note.id).toBe(id);
    expect(note.title).toBe("Find me");
  });

  it("exits non-zero with a surfaced error for a missing id", async () => {
    const res = await runCli(["read", "--id", "does-not-exist"]);
    expect(res.code).not.toBe(0);
    expect(res.stdout).toBe("");
    expect(res.stderr).toContain("Note not found");
    expect(res.stderr).not.toMatch(/at .*\(.*:\d+:\d+\)/); // no stack trace
  });
});

describe("CLI update", () => {
  it("updates an existing note", async () => {
    const create = await runCli(["create", "--title", "Original", "--content", "Old", "--tags", ""]);
    const { id } = JSON.parse(create.stdout);

    const res = await runCli(["update", "--id", id, "--title", "Updated"]);
    expect(res.code).toBe(0);
    const note = JSON.parse(res.stdout);
    expect(note.title).toBe("Updated");
    expect(note.content).toBe("Old");
  });

  it("exits non-zero with a surfaced error for a missing id", async () => {
    const res = await runCli(["update", "--id", "no-such-id", "--title", "Nope"]);
    expect(res.code).not.toBe(0);
    expect(res.stdout).toBe("");
    expect(res.stderr).toContain("Note not found");
    expect(res.stderr).not.toMatch(/at .*\(.*:\d+:\d+\)/);
  });
});

describe("CLI delete", () => {
  it("deletes a note", async () => {
    const create = await runCli(["create", "--title", "Delete me", "--content", "Bye", "--tags", ""]);
    const { id } = JSON.parse(create.stdout);

    const res = await runCli(["delete", "--id", id]);
    expect(res.code).toBe(0);
    expect(JSON.parse(res.stdout)).toEqual({ id, deleted: true });

    const after = await runCli(["read", "--id", id]);
    expect(after.code).not.toBe(0);
  });

  it("exits non-zero with a surfaced error for a missing id", async () => {
    const res = await runCli(["delete", "--id", "nope"]);
    expect(res.code).not.toBe(0);
    expect(res.stdout).toBe("");
    expect(res.stderr).toContain("Note not found");
    expect(res.stderr).not.toMatch(/at .*\(.*:\d+:\d+\)/);
  });
});
