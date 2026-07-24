import type { Server } from "http";
import type { AddressInfo } from "net";
import app from "../src/app";
import { run } from "../src/cli/index";

// End-to-end test: starts a real NoteAPI server on an ephemeral port and
// drives the CLI dispatcher (`run`) against it via HTTP (fetch), exercising
// all five subcommands (list/read/create/update/delete) and their error
// paths. This complements the mocked unit tests in cli-commands.test.ts by
// verifying the CLI and API integrate correctly end-to-end.
describe("CLI CRUD commands end-to-end", () => {
  let server: Server;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let originalUrl: string | undefined;

  beforeAll((done) => {
    server = app.listen(0, () => {
      const { port } = server.address() as AddressInfo;
      originalUrl = process.env.NOTEAPI_URL;
      process.env.NOTEAPI_URL = `http://localhost:${port}`;
      done();
    });
  });

  afterAll((done) => {
    if (originalUrl === undefined) {
      delete process.env.NOTEAPI_URL;
    } else {
      process.env.NOTEAPI_URL = originalUrl;
    }
    server.close(done);
  });

  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  function loggedOutput(): string {
    return logSpy.mock.calls.map((call) => String(call[0])).join("\n");
  }

  it("create: creates a note and prints it with exit code 0", async () => {
    const code = await run(["create", "--title", "My Title", "--content", "My Content"]);

    expect(code).toBe(0);
    expect(loggedOutput()).toContain("My Title");
    expect(loggedOutput()).toContain("My Content");
  });

  it("create: rejects missing required flags with a non-zero exit code and no server round-trip", async () => {
    const code = await run(["create", "--title", "Only Title"]);

    expect(code).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: create"));
  });

  it("list: lists notes including a freshly created one", async () => {
    const createCode = await run(["create", "--title", "Listed Note", "--content", "Some content"]);
    expect(createCode).toBe(0);

    logSpy.mockClear();
    const code = await run(["list"]);

    expect(code).toBe(0);
    expect(loggedOutput()).toContain("Listed Note");
  });

  it("read: reads back a created note by id with exit code 0", async () => {
    await run(["create", "--title", "Readable", "--content", "Read me"]);
    const created = JSON.parse(loggedOutput());
    logSpy.mockClear();

    const code = await run(["read", "--id", created.id]);

    expect(code).toBe(0);
    expect(loggedOutput()).toContain("Readable");
    expect(loggedOutput()).toContain(created.id);
  });

  it("read: returns exit code 1 and a clear message for an unknown id (404)", async () => {
    const code = await run(["read", "--id", "does-not-exist"]);

    expect(code).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Note not found"));
  });

  it("update: updates a note's fields with exit code 0", async () => {
    await run(["create", "--title", "Before", "--content", "Before content"]);
    const created = JSON.parse(loggedOutput());
    logSpy.mockClear();

    const code = await run(["update", "--id", created.id, "--title", "After"]);

    expect(code).toBe(0);
    expect(loggedOutput()).toContain("After");

    logSpy.mockClear();
    const readCode = await run(["read", "--id", created.id]);
    expect(readCode).toBe(0);
    expect(loggedOutput()).toContain("After");
  });

  it("update: returns exit code 1 and a clear message for an unknown id (404)", async () => {
    const code = await run(["update", "--id", "does-not-exist", "--title", "New"]);

    expect(code).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Note not found"));
  });

  it("delete: deletes a note with exit code 0 and it is no longer readable", async () => {
    await run(["create", "--title", "ToDelete", "--content", "Bye"]);
    const created = JSON.parse(loggedOutput());
    logSpy.mockClear();

    const code = await run(["delete", "--id", created.id]);
    expect(code).toBe(0);

    errorSpy.mockClear();
    const readCode = await run(["read", "--id", created.id]);
    expect(readCode).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Note not found"));
  });

  it("delete: returns exit code 1 and a clear message for an unknown id (404)", async () => {
    const code = await run(["delete", "--id", "does-not-exist"]);

    expect(code).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Note not found"));
  });
});
