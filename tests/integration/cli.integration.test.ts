// End-to-end integration suite for the NoteAPI CLI.
//
// Per CLAUDE.md, all integration tests live in an integration-test folder
// (tests/integration/) — separate from the mocked-fetch unit tests in
// tests/cli.test.ts and tests/cli-commands.test.ts, which are left untouched.
//
// Unlike those unit tests, this suite exercises the CLI against a REAL Express
// server. We start the app on an ephemeral port with app.listen(0) (so it can
// never collide with a dev server on 3000 or a start:test server on 3001),
// point the CLI's http client at it via NOTEAPI_URL, and invoke the exported
// dispatch(argv) directly (no subprocess) so the CLI and server share the same
// in-process in-memory noteStore. That shared singleton is what lets
// noteStore.clear() give real per-test isolation.
//
// dispatch() RETURNS the exit code (it is main() that assigns process.exitCode),
// so we assert on that returned number — the faithful end-to-end exit signal.

import type { AddressInfo } from "net";
import type { Server } from "http";

import app from "../../src/app";
import { dispatch } from "../../src/cli/index";
import { noteStore, Note } from "../../src/models/note";

let server: Server;

/** Capture stdout + stderr for the duration of one dispatch call. */
interface Captured {
  code: number;
  stdout: string;
  stderr: string;
}

async function runCli(argv: string[]): Promise<Captured> {
  let stdout = "";
  let stderr = "";

  const outSpy = jest
    .spyOn(process.stdout, "write")
    .mockImplementation((chunk: string | Uint8Array): boolean => {
      stdout += chunk.toString();
      return true;
    });
  const errSpy = jest
    .spyOn(process.stderr, "write")
    .mockImplementation((chunk: string | Uint8Array): boolean => {
      stderr += chunk.toString();
      return true;
    });

  try {
    const code = await dispatch(argv);
    return { code, stdout, stderr };
  } finally {
    outSpy.mockRestore();
    errSpy.mockRestore();
  }
}

beforeAll(async () => {
  server = await new Promise<Server>((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const { port } = server.address() as AddressInfo;
  process.env.NOTEAPI_URL = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  delete process.env.NOTEAPI_URL;
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

beforeEach(() => {
  noteStore.clear();
});

describe("CLI end-to-end against a live NoteAPI server", () => {
  it("runs the full CRUD lifecycle: create -> list -> read -> update -> delete -> 404", async () => {
    // create
    const created = await runCli([
      "create",
      "--title",
      "Integration Note",
      "--content",
      "hello world",
    ]);
    expect(created.code).toBe(0);
    expect(created.stderr).toBe("");
    const note = JSON.parse(created.stdout) as Note;
    expect(note.id).toBeTruthy();
    expect(note.title).toBe("Integration Note");
    expect(note.content).toBe("hello world");

    // list — the created note is present
    const listed = await runCli(["list"]);
    expect(listed.code).toBe(0);
    const notes = JSON.parse(listed.stdout) as Note[];
    expect(notes).toHaveLength(1);
    expect(notes[0].id).toBe(note.id);

    // read the single note by id
    const read = await runCli(["read", "--id", note.id]);
    expect(read.code).toBe(0);
    expect((JSON.parse(read.stdout) as Note).title).toBe("Integration Note");

    // update the title
    const updated = await runCli([
      "update",
      "--id",
      note.id,
      "--title",
      "Renamed",
    ]);
    expect(updated.code).toBe(0);
    expect((JSON.parse(updated.stdout) as Note).title).toBe("Renamed");

    // delete
    const deleted = await runCli(["delete", "--id", note.id]);
    expect(deleted.code).toBe(0);
    expect(deleted.stdout).toContain(`Deleted note ${note.id}`);

    // read after delete -> clean non-zero exit, message on stderr, no raw JSON/stack
    const gone = await runCli(["read", "--id", note.id]);
    expect(gone.code).toBe(1);
    expect(gone.stdout).toBe("");
    expect(gone.stderr).toBe("Error: Note not found\n");
    expect(gone.stderr).not.toContain("{");
    expect(gone.stderr).not.toContain("\n    at ");
  });

  it("list reflects per-test isolation (store cleared between tests)", async () => {
    const listed = await runCli(["list"]);
    expect(listed.code).toBe(0);
    expect(JSON.parse(listed.stdout) as Note[]).toHaveLength(0);
  });
});

describe("version, help and validation paths (end-to-end)", () => {
  it("prints the version for --version and exits 0", async () => {
    const res = await runCli(["--version"]);
    expect(res.code).toBe(0);
    expect(res.stdout).toMatch(/^fleet-e2e-toy v\d+\.\d+\.\d+\n$/);
  });

  it("prints the version for the -v short form", async () => {
    const res = await runCli(["-v"]);
    expect(res.code).toBe(0);
    expect(res.stdout).toMatch(/^fleet-e2e-toy v/);
  });

  it("prints global help for --help", async () => {
    const res = await runCli(["--help"]);
    expect(res.code).toBe(0);
    expect(res.stdout).toContain("Usage: fleet-e2e-toy <command> [options]");
    expect(res.stdout).toContain("create");
    expect(res.stdout).toContain("read");
  });

  it("prints global help when no command is given", async () => {
    const res = await runCli([]);
    expect(res.code).toBe(0);
    expect(res.stdout).toContain("Usage: fleet-e2e-toy <command> [options]");
  });

  it("prints per-subcommand help for `create --help`", async () => {
    const res = await runCli(["create", "--help"]);
    expect(res.code).toBe(0);
    expect(res.stdout).toContain(
      "Usage: fleet-e2e-toy create --title <title> --content <content>"
    );
    // Help never issues a network request, so nothing is created.
    const listed = await runCli(["list"]);
    expect(JSON.parse(listed.stdout) as Note[]).toHaveLength(0);
  });

  it("prints per-subcommand help for the `read -h` short form", async () => {
    const res = await runCli(["read", "-h"]);
    expect(res.code).toBe(0);
    expect(res.stdout).toContain("Usage: fleet-e2e-toy read --id <id>");
  });

  it("rejects a blank/whitespace required argument before any network call", async () => {
    const res = await runCli(["read", "--id", "   "]);
    expect(res.code).toBe(1);
    expect(res.stdout).toBe("");
    expect(res.stderr).toBe("Error: missing required argument '--id'\n");
  });

  it("rejects a missing required argument on create", async () => {
    const res = await runCli(["create", "--title", "only a title"]);
    expect(res.code).toBe(1);
    expect(res.stderr).toBe("Error: missing required argument '--content'\n");
  });

  it("rejects an unknown subcommand with a clean non-zero exit", async () => {
    const res = await runCli(["bogus"]);
    expect(res.code).toBe(1);
    expect(res.stdout).toBe("");
    expect(res.stderr).toBe("Error: unknown command 'bogus'\n");
    expect(res.stderr).not.toContain("\n    at ");
  });

  it("surfaces a live API error (update of a nonexistent id) as a clean message", async () => {
    // The id passes CLI non-blank validation, so the request reaches the server,
    // which returns 404 { error: "Note not found" }. This exercises the real
    // network error path end-to-end (not the pre-network CLI validation), and we
    // assert the response is a single clean line with no raw JSON or stack trace.
    const res = await runCli([
      "update",
      "--id",
      "does-not-exist",
      "--title",
      "whatever",
    ]);
    expect(res.code).toBe(1);
    expect(res.stdout).toBe("");
    expect(res.stderr).toBe("Error: Note not found\n");
    expect(res.stderr).not.toContain("{");
    expect(res.stderr).not.toContain("\n    at ");
  });
});
