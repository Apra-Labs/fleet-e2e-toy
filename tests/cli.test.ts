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
// (4) CRUD subcommands — use mock HTTP server via express
// ---------------------------------------------------------------------------
import express from "express";
import http from "http";

function startStub(): Promise<{ server: http.Server; url: string }> {
  return new Promise((resolve) => {
    const app = express();
    app.use(express.json());

    const notes = [{ id: "1", title: "Test", content: "", tags: [], createdAt: "", updatedAt: "" }];

    app.get("/api/notes", (_req, res) => { res.json(notes); });
    app.get("/api/notes/:id", (req, res) => {
      const n = notes.find((x) => x.id === req.params["id"]);
      if (!n) return res.status(404).json({ error: "Not found" });
      return res.json(n);
    });
    app.post("/api/notes", (req, res) => {
      const note = { id: "2", ...req.body as object, createdAt: "", updatedAt: "" } as typeof notes[0];
      notes.push(note);
      res.status(201).json(note);
    });
    app.put("/api/notes/:id", (req, res) => {
      const n = notes.find((x) => x.id === req.params["id"]);
      if (!n) return res.status(404).json({ error: "Not found" });
      Object.assign(n, req.body);
      return res.json(n);
    });
    app.delete("/api/notes/:id", (req, res) => {
      const idx = notes.findIndex((x) => x.id === req.params["id"]);
      if (idx === -1) return res.status(404).json({ error: "Not found" });
      notes.splice(idx, 1);
      return res.status(204).send();
    });

    const server = app.listen(0, () => {
      const addr = server.address();
      const port = typeof addr === "object" && addr ? addr.port : 3000;
      resolve({ server, url: `http://localhost:${port}` });
    });
  });
}

describe("CLI CRUD subcommands", () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    const stub = await startStub();
    server = stub.server;
    baseUrl = stub.url;
  });

  afterAll((done) => {
    server.close(done);
  });

  it("list hits GET /api/notes and exits 0", () => {
    const res = run(["list"], { NOTE_API_URL: baseUrl });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("Test");
  });

  it("read hits GET /api/notes/:id and exits 0", () => {
    const res = run(["read", "--id", "1"], { NOTE_API_URL: baseUrl });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain('"id"');
    expect(res.stdout).toContain('"1"');
  });

  it("create hits POST /api/notes and exits 0", () => {
    const res = run(["create", "--title", "New Note", "--content", "Body"], { NOTE_API_URL: baseUrl });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("New Note");
  });

  it("update hits PUT /api/notes/:id and exits 0", () => {
    const res = run(["update", "--id", "1", "--title", "Updated"], { NOTE_API_URL: baseUrl });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("Updated");
  });

  it("delete hits DELETE /api/notes/:id and exits 0", () => {
    const res = run(["delete", "--id", "1"], { NOTE_API_URL: baseUrl });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("Deleted note 1");
  });

  // ---------------------------------------------------------------------------
  // (5) HTTP 4xx causes non-zero exit and stderr message
  // ---------------------------------------------------------------------------
  it("read with unknown id causes non-zero exit and stderr message", () => {
    const res = run(["read", "--id", "nonexistent-id"], { NOTE_API_URL: baseUrl });
    expect(res.status).not.toBe(0);
    expect(res.stderr).toContain("HTTP 404");
  });

  it("delete with unknown id causes non-zero exit and stderr message", () => {
    const res = run(["delete", "--id", "ghost-id"], { NOTE_API_URL: baseUrl });
    expect(res.status).not.toBe(0);
    expect(res.stderr).toContain("HTTP 404");
  });
});
