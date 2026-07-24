// End-to-end CLI test: exercises all five subcommands (create, read, list,
// update, delete) against a real Express app instance over HTTP (no client
// mocking), driven through the CLI's own argv dispatcher (`run`).

import type { Server } from "http";
import app from "../src/app";
import { noteStore } from "../src/models/note";
import { run } from "../src/cli/index";
import { CommandIO } from "../src/cli/commands";

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

let server: Server;
let previousNoteapiUrl: string | undefined;

beforeAll((done) => {
  previousNoteapiUrl = process.env.NOTEAPI_URL;
  server = app.listen(0, () => {
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("expected server to bind to a random TCP port");
    }
    process.env.NOTEAPI_URL = `http://127.0.0.1:${address.port}`;
    done();
  });
});

afterAll((done) => {
  if (previousNoteapiUrl === undefined) {
    delete process.env.NOTEAPI_URL;
  } else {
    process.env.NOTEAPI_URL = previousNoteapiUrl;
  }
  server.close(done);
});

beforeEach(() => {
  noteStore.clear();
});

function extractId(outLines: string[]): string {
  const text = outLines.join("\n");
  const match = text.match(/^id: (.+)$/m);
  if (!match) {
    throw new Error(`could not find "id:" line in CLI output:\n${text}`);
  }
  return match[1].trim();
}

describe("CLI CRUD commands end-to-end", () => {
  it("create -> read -> list (--tag/--q) -> update -> delete happy path", async () => {
    // create
    const createIo = makeIo();
    const createCode = await run(
      [
        "create",
        "--title",
        "Meeting notes",
        "--content",
        "Discuss roadmap",
        "--tag",
        "work",
        "--tag",
        "urgent",
      ],
      createIo
    );
    expect(createCode).toBe(0);
    expect(createIo.errLines).toHaveLength(0);
    const id = extractId(createIo.outLines);
    expect(id.length).toBeGreaterThan(0);
    expect(createIo.outLines.join("\n")).toContain("title: Meeting notes");

    // read
    const readIo = makeIo();
    const readCode = await run(["read", "--id", id], readIo);
    expect(readCode).toBe(0);
    expect(readIo.errLines).toHaveLength(0);
    const readText = readIo.outLines.join("\n");
    expect(readText).toContain(`id: ${id}`);
    expect(readText).toContain("title: Meeting notes");
    expect(readText).toContain("content: Discuss roadmap");
    expect(readText).toContain("tags: work, urgent");

    // list with no filters
    const listAllIo = makeIo();
    const listAllCode = await run(["list"], listAllIo);
    expect(listAllCode).toBe(0);
    expect(listAllIo.outLines.join("\n")).toContain(`id: ${id}`);

    // list filtered by --tag (matches)
    const listTagMatchIo = makeIo();
    const listTagMatchCode = await run(["list", "--tag", "work"], listTagMatchIo);
    expect(listTagMatchCode).toBe(0);
    expect(listTagMatchIo.outLines.join("\n")).toContain(`id: ${id}`);

    // list filtered by --tag (no match)
    const listTagNoMatchIo = makeIo();
    const listTagNoMatchCode = await run(["list", "--tag", "personal"], listTagNoMatchIo);
    expect(listTagNoMatchCode).toBe(0);
    expect(listTagNoMatchIo.outLines.join("\n")).toContain("No notes found");

    // list filtered by --q (matches)
    const listQMatchIo = makeIo();
    const listQMatchCode = await run(["list", "--q", "roadmap"], listQMatchIo);
    expect(listQMatchCode).toBe(0);
    expect(listQMatchIo.outLines.join("\n")).toContain(`id: ${id}`);

    // list filtered by --q (no match)
    const listQNoMatchIo = makeIo();
    const listQNoMatchCode = await run(["list", "--q", "nonexistent"], listQNoMatchIo);
    expect(listQNoMatchCode).toBe(0);
    expect(listQNoMatchIo.outLines.join("\n")).toContain("No notes found");

    // update
    const updateIo = makeIo();
    const updateCode = await run(
      ["update", "--id", id, "--title", "Updated meeting notes"],
      updateIo
    );
    expect(updateCode).toBe(0);
    expect(updateIo.errLines).toHaveLength(0);
    expect(updateIo.outLines.join("\n")).toContain("title: Updated meeting notes");

    // read again to confirm the update persisted
    const readAfterUpdateIo = makeIo();
    const readAfterUpdateCode = await run(["read", "--id", id], readAfterUpdateIo);
    expect(readAfterUpdateCode).toBe(0);
    expect(readAfterUpdateIo.outLines.join("\n")).toContain("title: Updated meeting notes");

    // delete
    const deleteIo = makeIo();
    const deleteCode = await run(["delete", "--id", id], deleteIo);
    expect(deleteCode).toBe(0);
    expect(deleteIo.errLines).toHaveLength(0);
    expect(deleteIo.outLines.join("\n")).toContain(id);

    // confirm deletion via read -> 404
    const readAfterDeleteIo = makeIo();
    const readAfterDeleteCode = await run(["read", "--id", id], readAfterDeleteIo);
    expect(readAfterDeleteCode).not.toBe(0);
    expect(readAfterDeleteIo.errLines.join("\n")).not.toHaveLength(0);
  });

  describe("error paths", () => {
    it("create: missing --title exits non-zero without a stack trace", async () => {
      const io = makeIo();
      const code = await run(["create", "--content", "Body"], io);
      expect(code).not.toBe(0);
      expect(io.errLines.join("\n")).toContain("--title");
      expect(io.errLines.join("\n")).not.toMatch(/at .*\(.*:\d+:\d+\)/);
    });

    it("create: missing --content exits non-zero without a stack trace", async () => {
      const io = makeIo();
      const code = await run(["create", "--title", "T"], io);
      expect(code).not.toBe(0);
      expect(io.errLines.join("\n")).toContain("--content");
      expect(io.errLines.join("\n")).not.toMatch(/at .*\(.*:\d+:\d+\)/);
    });

    it("read: missing --id exits non-zero without a stack trace", async () => {
      const io = makeIo();
      const code = await run(["read"], io);
      expect(code).not.toBe(0);
      expect(io.errLines.join("\n")).toContain("--id");
      expect(io.errLines.join("\n")).not.toMatch(/at .*\(.*:\d+:\d+\)/);
    });

    it("read: unknown id (404) exits non-zero without a stack trace", async () => {
      const io = makeIo();
      const code = await run(["read", "--id", "does-not-exist"], io);
      expect(code).not.toBe(0);
      expect(io.errLines.join("\n")).not.toHaveLength(0);
      expect(io.errLines.join("\n")).not.toMatch(/at .*\(.*:\d+:\d+\)/);
    });

    it("update: missing --id exits non-zero without a stack trace", async () => {
      const io = makeIo();
      const code = await run(["update", "--title", "New Title"], io);
      expect(code).not.toBe(0);
      expect(io.errLines.join("\n")).toContain("--id");
      expect(io.errLines.join("\n")).not.toMatch(/at .*\(.*:\d+:\d+\)/);
    });

    it("update: unknown id (404) exits non-zero without a stack trace", async () => {
      const io = makeIo();
      const code = await run(["update", "--id", "does-not-exist", "--title", "X"], io);
      expect(code).not.toBe(0);
      expect(io.errLines.join("\n")).not.toHaveLength(0);
      expect(io.errLines.join("\n")).not.toMatch(/at .*\(.*:\d+:\d+\)/);
    });

    it("delete: missing --id exits non-zero without a stack trace", async () => {
      const io = makeIo();
      const code = await run(["delete"], io);
      expect(code).not.toBe(0);
      expect(io.errLines.join("\n")).toContain("--id");
      expect(io.errLines.join("\n")).not.toMatch(/at .*\(.*:\d+:\d+\)/);
    });

    it("delete: unknown id (404) exits non-zero without a stack trace", async () => {
      const io = makeIo();
      const code = await run(["delete", "--id", "does-not-exist"], io);
      expect(code).not.toBe(0);
      expect(io.errLines.join("\n")).not.toHaveLength(0);
      expect(io.errLines.join("\n")).not.toMatch(/at .*\(.*:\d+:\d+\)/);
    });
  });
});
