// Integration tests for the CLI's five CRUD subcommands, exercising the
// full path: CLI dispatcher -> HTTP client -> real Express app.

import { runCli, startTestServer, stopTestServer, resetNotes } from "./helpers/cli-harness";

beforeAll(async () => {
  await startTestServer();
});

afterAll(async () => {
  await stopTestServer();
});

beforeEach(() => {
  resetNotes();
});

describe("create", () => {
  it("creates a note and prints it with an id, exit code 0", async () => {
    const result = await runCli(["create", "--title", "My Note", "--content", "Hello world"]);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");

    const note = JSON.parse(result.stdout);
    expect(note.id).toBeDefined();
    expect(note.title).toBe("My Note");
    expect(note.content).toBe("Hello world");
  });
});

describe("list", () => {
  it("shows a created note", async () => {
    const create = await runCli(["create", "--title", "Listed Note", "--content", "Body"]);
    const created = JSON.parse(create.stdout);

    const result = await runCli(["list"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(created.id);
    expect(result.stdout).toContain("Listed Note");
  });

  it("respects --tag filter", async () => {
    await runCli(["create", "--title", "Tagged", "--content", "Body"]);
    // create doesn't support --tag directly, so filter against title/content via --q instead
    const result = await runCli(["list", "--tag", "nonexistent-tag"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe("");
  });

  it("respects --q filter", async () => {
    await runCli(["create", "--title", "Meeting notes", "--content", "Discuss project"]);
    await runCli(["create", "--title", "Shopping list", "--content", "Milk, eggs"]);

    const result = await runCli(["list", "--q", "meeting"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Meeting notes");
    expect(result.stdout).not.toContain("Shopping list");
  });
});

describe("read", () => {
  it("returns the note for a valid --id", async () => {
    const create = await runCli(["create", "--title", "Readable", "--content", "Body"]);
    const created = JSON.parse(create.stdout);

    const result = await runCli(["read", "--id", created.id]);

    expect(result.exitCode).toBe(0);
    const note = JSON.parse(result.stdout);
    expect(note.id).toBe(created.id);
    expect(note.title).toBe("Readable");
  });
});

describe("update", () => {
  it("changes fields and read reflects it", async () => {
    const create = await runCli(["create", "--title", "Original", "--content", "Old content"]);
    const created = JSON.parse(create.stdout);

    const update = await runCli(["update", "--id", created.id, "--title", "Updated Title"]);
    expect(update.exitCode).toBe(0);

    const updatedNote = JSON.parse(update.stdout);
    expect(updatedNote.title).toBe("Updated Title");
    expect(updatedNote.content).toBe("Old content");

    const read = await runCli(["read", "--id", created.id]);
    const readNote = JSON.parse(read.stdout);
    expect(readNote.title).toBe("Updated Title");
  });
});

describe("delete", () => {
  it("removes the note; subsequent read exits non-zero", async () => {
    const create = await runCli(["create", "--title", "Deletable", "--content", "Body"]);
    const created = JSON.parse(create.stdout);

    const del = await runCli(["delete", "--id", created.id]);
    expect(del.exitCode).toBe(0);
    expect(del.stdout).toContain(created.id);

    const read = await runCli(["read", "--id", created.id]);
    expect(read.exitCode).not.toBe(0);
  });
});

describe("error paths", () => {
  it("read with a bad id exits non-zero with a stderr message and no stack trace", async () => {
    const result = await runCli(["read", "--id", "does-not-exist"]);

    expect(result.exitCode).not.toBe(0);
    expect(result.stderr.length).toBeGreaterThan(0);
    expect(result.stderr).not.toContain("at ");
    expect(result.stderr).not.toContain(".ts:");
    expect(result.stderr).not.toContain(".js:");
  });

  it("update with a bad id exits non-zero with a stderr message and no stack trace", async () => {
    const result = await runCli(["update", "--id", "does-not-exist", "--title", "New"]);

    expect(result.exitCode).not.toBe(0);
    expect(result.stderr.length).toBeGreaterThan(0);
    expect(result.stderr).not.toContain("at ");
  });

  it("delete with a bad id exits non-zero with a stderr message and no stack trace", async () => {
    const result = await runCli(["delete", "--id", "does-not-exist"]);

    expect(result.exitCode).not.toBe(0);
    expect(result.stderr.length).toBeGreaterThan(0);
    expect(result.stderr).not.toContain("at ");
  });

  it("create without required flags exits non-zero with a stderr message", async () => {
    const result = await runCli(["create", "--title", "Only Title"]);

    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("--content");
    expect(result.stderr).not.toContain("at ");
  });
});
