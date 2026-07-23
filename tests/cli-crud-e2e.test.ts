import type { Server } from "http";
import type { AddressInfo } from "net";
import app from "../src/app";
import { noteStore } from "../src/models/note";
import { main } from "../src/cli/index";

describe("CLI CRUD end-to-end", () => {
  let server: Server;
  let stdoutSpy: jest.SpiedFunction<typeof process.stdout.write>;
  let stderrSpy: jest.SpiedFunction<typeof process.stderr.write>;
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
    noteStore.clear();
    stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
    stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function stdout(): string {
    return stdoutSpy.mock.calls.map((c) => c[0]).join("");
  }

  function stderr(): string {
    return stderrSpy.mock.calls.map((c) => c[0]).join("");
  }

  it("creates, reads, lists (with filters), updates, and deletes a note end-to-end", async () => {
    // create
    const createCode = await main([
      "create",
      "--title",
      "Meeting notes",
      "--content",
      "Discuss roadmap",
      "--tag",
      "work",
    ]);
    expect(createCode).toBe(0);
    const created = JSON.parse(stdout());
    expect(created.title).toBe("Meeting notes");
    expect(created.content).toBe("Discuss roadmap");
    expect(created.tags).toEqual(["work"]);
    const id: string = created.id;
    expect(typeof id).toBe("string");
    stdoutSpy.mockClear();

    // read
    const readCode = await main(["read", "--id", id]);
    expect(readCode).toBe(0);
    const read = JSON.parse(stdout());
    expect(read.id).toBe(id);
    expect(read.title).toBe("Meeting notes");
    stdoutSpy.mockClear();

    // list — no filter
    const listCode = await main(["list"]);
    expect(listCode).toBe(0);
    const listed = JSON.parse(stdout());
    expect(listed).toHaveLength(1);
    expect(listed[0].id).toBe(id);
    stdoutSpy.mockClear();

    // list — filtered by --tag (match)
    const listTagCode = await main(["list", "--tag", "work"]);
    expect(listTagCode).toBe(0);
    const listedByTag = JSON.parse(stdout());
    expect(listedByTag).toHaveLength(1);
    stdoutSpy.mockClear();

    // list — filtered by --tag (no match)
    const listTagMissCode = await main(["list", "--tag", "personal"]);
    expect(listTagMissCode).toBe(0);
    const listedByTagMiss = JSON.parse(stdout());
    expect(listedByTagMiss).toHaveLength(0);
    stdoutSpy.mockClear();

    // list — filtered by --q (match)
    const listQCode = await main(["list", "--q", "roadmap"]);
    expect(listQCode).toBe(0);
    const listedByQ = JSON.parse(stdout());
    expect(listedByQ).toHaveLength(1);
    stdoutSpy.mockClear();

    // list — filtered by --q (no match)
    const listQMissCode = await main(["list", "--q", "nonexistent"]);
    expect(listQMissCode).toBe(0);
    const listedByQMiss = JSON.parse(stdout());
    expect(listedByQMiss).toHaveLength(0);
    stdoutSpy.mockClear();

    // update
    const updateCode = await main(["update", "--id", id, "--title", "Updated title"]);
    expect(updateCode).toBe(0);
    const updated = JSON.parse(stdout());
    expect(updated.id).toBe(id);
    expect(updated.title).toBe("Updated title");
    expect(updated.content).toBe("Discuss roadmap");
    stdoutSpy.mockClear();

    // delete
    const deleteCode = await main(["delete", "--id", id]);
    expect(deleteCode).toBe(0);
    expect(stdout()).toContain(id);
    stdoutSpy.mockClear();

    // confirm deletion via read
    const readAfterDeleteCode = await main(["read", "--id", id]);
    expect(readAfterDeleteCode).not.toBe(0);
  });

  describe("missing id errors", () => {
    it("read exits non-zero with an error message for a missing id", async () => {
      const code = await main(["read", "--id", "does-not-exist"]);
      expect(code).not.toBe(0);
      const errOutput = stderr();
      expect(() => JSON.parse(errOutput)).not.toThrow();
      expect(JSON.parse(errOutput).error).toBeTruthy();
      expect(errOutput).not.toContain("at ");
    });

    it("update exits non-zero with an error message for a missing id", async () => {
      const code = await main(["update", "--id", "does-not-exist", "--title", "New"]);
      expect(code).not.toBe(0);
      const errOutput = stderr();
      expect(() => JSON.parse(errOutput)).not.toThrow();
      expect(JSON.parse(errOutput).error).toBeTruthy();
      expect(errOutput).not.toContain("at ");
    });

    it("delete exits non-zero with an error message for a missing id", async () => {
      const code = await main(["delete", "--id", "does-not-exist"]);
      expect(code).not.toBe(0);
      const errOutput = stderr();
      expect(() => JSON.parse(errOutput)).not.toThrow();
      expect(JSON.parse(errOutput).error).toBeTruthy();
      expect(errOutput).not.toContain("at ");
    });
  });

  describe("missing required args", () => {
    it("create exits non-zero when --title is missing", async () => {
      const code = await main(["create", "--content", "Body"]);
      expect(code).not.toBe(0);
    });

    it("create exits non-zero when --content is missing", async () => {
      const code = await main(["create", "--title", "Title"]);
      expect(code).not.toBe(0);
    });

    it("read exits non-zero when --id is missing", async () => {
      const code = await main(["read"]);
      expect(code).not.toBe(0);
    });

    it("update exits non-zero when --id is missing", async () => {
      const code = await main(["update", "--title", "New"]);
      expect(code).not.toBe(0);
    });

    it("delete exits non-zero when --id is missing", async () => {
      const code = await main(["delete"]);
      expect(code).not.toBe(0);
    });
  });
});
