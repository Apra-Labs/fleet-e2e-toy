import { Server } from "http";
import app from "../../src/app";
import { noteStore } from "../../src/models/note";
import { run } from "../../src/cli/index";

let server: Server;

beforeAll((done) => {
  server = app.listen(0, () => {
    const address = server.address();
    const port = typeof address === "object" && address !== null ? address.port : 0;
    process.env.NOTEAPI_URL = `http://localhost:${port}`;
    done();
  });
});

afterAll((done) => {
  server.close(done);
});

beforeEach(() => {
  noteStore.clear();
});

function captureOutput(): { stdout: string[]; stderr: string[]; restore: () => void } {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const origOut = process.stdout.write.bind(process.stdout);
  const origErr = process.stderr.write.bind(process.stderr);
  process.stdout.write = ((chunk: string) => {
    stdout.push(String(chunk));
    return true;
  }) as typeof process.stdout.write;
  process.stderr.write = ((chunk: string) => {
    stderr.push(String(chunk));
    return true;
  }) as typeof process.stderr.write;
  return {
    stdout,
    stderr,
    restore: () => {
      process.stdout.write = origOut;
      process.stderr.write = origErr;
    },
  };
}

describe("cli list", () => {
  it("prints 'No notes found.' when there are none", async () => {
    const cap = captureOutput();
    const code = await run(["list"]);
    cap.restore();
    expect(code).toBe(0);
    expect(cap.stdout.join("")).toContain("No notes found.");
  });

  it("prints all notes", async () => {
    await run(["create", "--title", "First", "--content", "Body1"]);
    await run(["create", "--title", "Second", "--content", "Body2"]);

    const cap = captureOutput();
    const code = await run(["list"]);
    cap.restore();
    expect(code).toBe(0);
    const out = cap.stdout.join("");
    expect(out).toContain("First");
    expect(out).toContain("Second");
  });

  it("filters by --tag", async () => {
    await run(["create", "--title", "Tagged", "--content", "B", "--tag", "work"]);
    await run(["create", "--title", "Untagged", "--content", "B"]);

    const cap = captureOutput();
    const code = await run(["list", "--tag", "work"]);
    cap.restore();
    expect(code).toBe(0);
    const out = cap.stdout.join("");
    expect(out).toContain("Tagged");
    expect(out).not.toContain("Untagged");
  });

  it("filters by --q", async () => {
    await run(["create", "--title", "Meeting notes", "--content", "Discuss"]);
    await run(["create", "--title", "Shopping", "--content", "Milk"]);

    const cap = captureOutput();
    const code = await run(["list", "--q", "meeting"]);
    cap.restore();
    expect(code).toBe(0);
    const out = cap.stdout.join("");
    expect(out).toContain("Meeting notes");
    expect(out).not.toContain("Shopping");
  });
});

describe("cli read", () => {
  it("prints a single note by id", async () => {
    const cap1 = captureOutput();
    await run(["create", "--title", "Find me", "--content", "Here"]);
    const created = JSON.parse(cap1.stdout.join("").replace("Created note:\n", ""));
    cap1.restore();

    const cap2 = captureOutput();
    const code = await run(["read", "--id", created.id]);
    cap2.restore();
    expect(code).toBe(0);
    expect(cap2.stdout.join("")).toContain("Find me");
  });

  it("missing --id -> clear error, non-zero exit", async () => {
    const cap = captureOutput();
    const code = await run(["read"]);
    cap.restore();
    expect(code).not.toBe(0);
    expect(cap.stderr.join("")).toMatch(/--id is required/);
    expect(cap.stderr.join("")).not.toMatch(/at /);
  });

  it("404 -> clear error message, non-zero exit, no stack trace", async () => {
    const cap = captureOutput();
    const code = await run(["read", "--id", "does-not-exist"]);
    cap.restore();
    expect(code).not.toBe(0);
    expect(cap.stderr.join("")).toContain("Note not found");
    expect(cap.stderr.join("")).not.toMatch(/at /);
  });
});

describe("cli create", () => {
  it("posts and prints the new note including id", async () => {
    const cap = captureOutput();
    const code = await run(["create", "--title", "New", "--content", "Body", "--tag", "x", "--tag", "y"]);
    cap.restore();
    expect(code).toBe(0);
    const out = cap.stdout.join("");
    expect(out).toContain("New");
    expect(out).toMatch(/"id":/);
    expect(out).toContain('"x"');
    expect(out).toContain('"y"');
  });

  it("missing --title -> clear error, non-zero exit", async () => {
    const cap = captureOutput();
    const code = await run(["create", "--content", "Body"]);
    cap.restore();
    expect(code).not.toBe(0);
    expect(cap.stderr.join("")).toMatch(/--title is required/);
  });

  it("missing --content -> clear error, non-zero exit", async () => {
    const cap = captureOutput();
    const code = await run(["create", "--title", "Only title"]);
    cap.restore();
    expect(code).not.toBe(0);
    expect(cap.stderr.join("")).toMatch(/--content is required/);
  });
});

describe("cli update", () => {
  it("updates fields via PUT and prints result", async () => {
    const cap1 = captureOutput();
    await run(["create", "--title", "Original", "--content", "Old"]);
    const created = JSON.parse(cap1.stdout.join("").replace("Created note:\n", ""));
    cap1.restore();

    const cap2 = captureOutput();
    const code = await run(["update", "--id", created.id, "--title", "Updated"]);
    cap2.restore();
    expect(code).toBe(0);
    const out = cap2.stdout.join("");
    expect(out).toContain("Updated");
    expect(out).toContain("Old");
  });

  it("404 -> clear error, non-zero exit", async () => {
    const cap = captureOutput();
    const code = await run(["update", "--id", "no-such-id", "--title", "Nope"]);
    cap.restore();
    expect(code).not.toBe(0);
    expect(cap.stderr.join("")).toContain("Note not found");
  });
});

describe("cli delete", () => {
  it("removes the note and confirms", async () => {
    const cap1 = captureOutput();
    await run(["create", "--title", "Delete me", "--content", "Bye"]);
    const created = JSON.parse(cap1.stdout.join("").replace("Created note:\n", ""));
    cap1.restore();

    const cap2 = captureOutput();
    const code = await run(["delete", "--id", created.id]);
    cap2.restore();
    expect(code).toBe(0);
    expect(cap2.stdout.join("")).toContain("Deleted note");

    const cap3 = captureOutput();
    const readCode = await run(["read", "--id", created.id]);
    cap3.restore();
    expect(readCode).not.toBe(0);
  });

  it("404 -> clear error, non-zero exit", async () => {
    const cap = captureOutput();
    const code = await run(["delete", "--id", "no-such-id"]);
    cap.restore();
    expect(code).not.toBe(0);
    expect(cap.stderr.join("")).toContain("Note not found");
  });
});
