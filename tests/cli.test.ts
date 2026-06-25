import { spawnSync } from "child_process";
import path from "path";

const CLI = path.resolve(__dirname, "../dist/cli/index.js");

function run(args: string[], env?: Record<string, string>) {
  return spawnSync("node", [CLI, ...args], {
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

// ---------------------------------------------------------------------------
// (1) --version / -V
// ---------------------------------------------------------------------------
describe("CLI --version", () => {
  it("prints fleet-e2e-toy v1.0.0 with --version and exits 0", () => {
    const res = run(["--version"]);
    expect(res.status).toBe(0);
    expect(res.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("prints fleet-e2e-toy v1.0.0 with -V and exits 0", () => {
    const res = run(["-V"]);
    expect(res.status).toBe(0);
    expect(res.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
  });
});

// ---------------------------------------------------------------------------
// (2) --help / -h
// ---------------------------------------------------------------------------
describe("CLI --help", () => {
  it("exits 0 with --help and lists all subcommands", () => {
    const res = run(["--help"]);
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("list");
    expect(res.stdout).toContain("read");
    expect(res.stdout).toContain("create");
    expect(res.stdout).toContain("update");
    expect(res.stdout).toContain("delete");
  });

  it("exits 0 with -h", () => {
    const res = run(["-h"]);
    expect(res.status).toBe(0);
  });

  it("subcommand create --help exits 0", () => {
    const res = run(["create", "--help"]);
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("--title");
  });

  it("subcommand list --help exits 0", () => {
    const res = run(["list", "--help"]);
    expect(res.status).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// (3) Input validation — empty/whitespace strings → exit 1 + stderr
// ---------------------------------------------------------------------------
describe("CLI input validation", () => {
  it("create with empty --title exits 1 with stderr message", () => {
    const res = run(["create", "--title", "   "]);
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("title");
    expect(res.stderr).not.toContain("at Object");
  });

  it("read with empty --id exits 1 with stderr message", () => {
    const res = run(["read", "--id", "  "]);
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("id");
    expect(res.stderr).not.toContain("at Object");
  });

  it("update with empty --id exits 1 with stderr message", () => {
    const res = run(["update", "--id", "  ", "--title", "foo"]);
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("id");
  });

  it("delete with empty --id exits 1 with stderr message", () => {
    const res = run(["delete", "--id", "  "]);
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("id");
  });

  it("update with no fields exits 1 with stderr message", () => {
    const res = run(["update", "--id", "some-id"]);
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("at least one");
  });
});

// ---------------------------------------------------------------------------
// (4) CRUD subcommands — use jest.mock to stub request in-process
// ---------------------------------------------------------------------------
jest.mock("../src/cli/http");

import { request } from "../src/cli/http";
import { listCommand } from "../src/cli/commands/list";
import { readCommand } from "../src/cli/commands/read";
import { createCommand } from "../src/cli/commands/create";
import { updateCommand } from "../src/cli/commands/update";
import { deleteCommand } from "../src/cli/commands/delete";

const mockedRequest = request as jest.MockedFunction<typeof request>;

describe("CLI CRUD subcommands", () => {
  let stdoutSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetAllMocks();
    stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
  });

  it("list hits GET /api/notes and exits 0", async () => {
    const notes = [{ id: "1", title: "Test", content: "", tags: [], createdAt: "", updatedAt: "" }];
    mockedRequest.mockResolvedValue(notes);

    await listCommand.parseAsync([], { from: "user" });

    expect(mockedRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: "GET", path: "/api/notes" })
    );
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Test"));
  });

  it("read hits GET /api/notes/:id and exits 0", async () => {
    const note = { id: "1", title: "Test", content: "", tags: [], createdAt: "", updatedAt: "" };
    mockedRequest.mockResolvedValue(note);

    await readCommand.parseAsync(["--id", "1"], { from: "user" });

    expect(mockedRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: "GET", path: "/api/notes/1" })
    );
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('"id"'));
  });

  it("create hits POST /api/notes and exits 0", async () => {
    const created = { id: "2", title: "New Note", content: "Body", tags: [], createdAt: "", updatedAt: "" };
    mockedRequest.mockResolvedValue(created);

    await createCommand.parseAsync(["--title", "New Note", "--content", "Body"], { from: "user" });

    expect(mockedRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/api/notes",
        body: expect.objectContaining({ title: "New Note", content: "Body" }),
      })
    );
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("New Note"));
  });

  it("update hits PUT /api/notes/:id and exits 0", async () => {
    const updated = { id: "1", title: "Updated", content: "", tags: [], createdAt: "", updatedAt: "" };
    mockedRequest.mockResolvedValue(updated);

    await updateCommand.parseAsync(["--id", "1", "--title", "Updated"], { from: "user" });

    expect(mockedRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PUT",
        path: "/api/notes/1",
        body: expect.objectContaining({ title: "Updated" }),
      })
    );
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Updated"));
  });

  it("delete hits DELETE /api/notes/:id and exits 0", async () => {
    mockedRequest.mockResolvedValue(undefined);

    await deleteCommand.parseAsync(["--id", "1"], { from: "user" });

    expect(mockedRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: "DELETE", path: "/api/notes/1" })
    );
    expect(stdoutSpy).toHaveBeenCalledWith("Deleted note 1\n");
  });

  // ---------------------------------------------------------------------------
  // (5) HTTP 4xx causes non-zero exit and error thrown
  // ---------------------------------------------------------------------------
  it("read with unknown id propagates HTTP 404 error", async () => {
    mockedRequest.mockRejectedValue(new Error("HTTP 404: Not found"));

    await expect(
      readCommand.parseAsync(["--id", "nonexistent-id"], { from: "user" })
    ).rejects.toThrow(/HTTP 404/);
  });

  it("delete with unknown id propagates HTTP 404 error", async () => {
    mockedRequest.mockRejectedValue(new Error("HTTP 404: Not found"));

    await expect(
      deleteCommand.parseAsync(["--id", "ghost-id"], { from: "user" })
    ).rejects.toThrow(/HTTP 404/);
  });
});
