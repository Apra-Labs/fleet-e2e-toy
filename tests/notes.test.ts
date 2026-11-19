import request from "supertest";
import app from "../src/app";
import { noteStore } from "../src/models/note";

beforeEach(() => {
  noteStore.clear();
});

describe("GET /api/notes", () => {
  it("returns empty array when no notes exist", async () => {
    const res = await request(app).get("/api/notes");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns all notes", async () => {
    await request(app)
      .post("/api/notes")
      .send({ title: "First", content: "Content 1", tags: ["a"] });
    await request(app)
      .post("/api/notes")
      .send({ title: "Second", content: "Content 2", tags: ["b"] });

    const res = await request(app).get("/api/notes");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("filters by tag", async () => {
    await request(app)
      .post("/api/notes")
      .send({ title: "Tagged", content: "Body", tags: ["work"] });
    await request(app)
      .post("/api/notes")
      .send({ title: "Untagged", content: "Body", tags: ["personal"] });

    const res = await request(app).get("/api/notes?tag=work");
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Tagged");
  });

  it("searches by query string", async () => {
    await request(app)
      .post("/api/notes")
      .send({ title: "Meeting notes", content: "Discuss project", tags: [] });
    await request(app)
      .post("/api/notes")
      .send({ title: "Shopping list", content: "Milk, eggs", tags: [] });

    const res = await request(app).get("/api/notes?q=meeting");
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Meeting notes");
  });
});

function seedNotes(count: number, tagFor?: (i: number) => string[]): void {
  for (let i = 1; i <= count; i++) {
    const stamp = new Date(2026, 0, 1).toISOString();
    noteStore.create({
      id: `n${i}`,
      title: `Note ${i}`,
      content: `Body ${i}`,
      tags: tagFor ? tagFor(i) : [],
      createdAt: stamp,
      updatedAt: stamp,
    });
  }
}

describe("GET /api/notes pagination", () => {
  it("returns notes 11-20 for page=2&limit=10", async () => {
    seedNotes(25);
    const res = await request(app).get("/api/notes?page=2&limit=10");
    expect(res.status).toBe(200);
    expect(res.body.map((n: { id: string }) => n.id)).toEqual(
      Array.from({ length: 10 }, (_, i) => `n${i + 11}`)
    );
  });

  it("defaults to the first 20 notes", async () => {
    seedNotes(25);
    const res = await request(app).get("/api/notes");
    expect(res.body).toHaveLength(20);
    expect(res.body[0].id).toBe("n1");
  });

  it("returns a partial last page and [] past the end", async () => {
    seedNotes(25);
    const last = await request(app).get("/api/notes?page=3&limit=10");
    expect(last.body).toHaveLength(5);
    const past = await request(app).get("/api/notes?page=4&limit=10");
    expect(past.body).toEqual([]);
  });

  it("applies pagination after filters", async () => {
    seedNotes(25, (i) => (i <= 12 ? ["x"] : ["y"]));
    const res = await request(app).get("/api/notes?tag=x&limit=5&page=3");
    expect(res.body.map((n: { id: string }) => n.id)).toEqual(["n11", "n12"]);
  });
});

describe("GET /api/notes pagination validation", () => {
  it.each([
    ["page=0", "page"],
    ["page=abc", "page"],
    ["page=-1", "page"],
    ["limit=101", "limit"],
    ["limit=0", "limit"],
    ["limit=1.5", "limit"],
  ])("returns 400 for %s", async (qs, field) => {
    const res = await request(app).get(`/api/notes?${qs}`);
    expect(res.status).toBe(400);
    expect(res.body.errors.map((e: { field: string }) => e.field)).toContain(field);
  });

  it("reports both invalid params", async () => {
    const res = await request(app).get("/api/notes?page=0&limit=abc");
    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveLength(2);
  });

  it("accepts limit=100 and valid page/limit", async () => {
    seedNotes(25);
    expect((await request(app).get("/api/notes?limit=100")).status).toBe(200);
    const res = await request(app).get("/api/notes?page=2&limit=10");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(10);
  });
});

describe("GET /api/notes/:id", () => {
  it("returns 404 for non-existent note", async () => {
    const res = await request(app).get("/api/notes/does-not-exist");
    expect(res.status).toBe(404);
  });

  it("returns a note by ID", async () => {
    const create = await request(app)
      .post("/api/notes")
      .send({ title: "Find me", content: "Here", tags: [] });

    const res = await request(app).get(`/api/notes/${create.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Find me");
  });
});

describe("POST /api/notes", () => {
  it("creates a note and returns 201", async () => {
    const res = await request(app)
      .post("/api/notes")
      .send({ title: "New note", content: "Body text", tags: ["test"] });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe("New note");
    expect(res.body.createdAt).toBeDefined();
  });

  it("returns 400 for invalid input", async () => {
    const res = await request(app).post("/api/notes").send({ content: "No title" });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});

describe("PUT /api/notes/:id", () => {
  it("updates an existing note", async () => {
    const create = await request(app)
      .post("/api/notes")
      .send({ title: "Original", content: "Old", tags: [] });

    const res = await request(app)
      .put(`/api/notes/${create.body.id}`)
      .send({ title: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated");
    expect(res.body.content).toBe("Old");
  });

  it("returns 404 for non-existent note", async () => {
    const res = await request(app)
      .put("/api/notes/no-such-id")
      .send({ title: "Nope" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/notes/:id", () => {
  it("deletes a note and returns 204", async () => {
    const create = await request(app)
      .post("/api/notes")
      .send({ title: "Delete me", content: "Bye", tags: [] });

    const res = await request(app).delete(`/api/notes/${create.body.id}`);
    expect(res.status).toBe(204);

    const get = await request(app).get(`/api/notes/${create.body.id}`);
    expect(get.status).toBe(404);
  });

  it("returns 404 for non-existent note", async () => {
    const res = await request(app).delete("/api/notes/nope");
    expect(res.status).toBe(404);
  });
});

describe("GET /health", () => {
  it("returns ok status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("paginated GET /api/notes end to end", () => {
  async function seedViaApi(): Promise<string[]> {
    const ids: string[] = [];
    for (let i = 1; i <= 30; i++) {
      const res = await request(app)
        .post("/api/notes")
        .send({ title: `Item ${i}`, content: i % 3 === 0 ? "alpha" : "beta", tags: i % 2 === 0 ? ["x"] : ["y"] });
      ids.push(res.body.id);
    }
    return ids;
  }

  it("walks every note exactly once in store order, then returns []", async () => {
    const ids = await seedViaApi();
    const seen: string[] = [];
    for (let page = 1; page <= 5; page++) {
      const res = await request(app).get(`/api/notes?page=${page}&limit=7`);
      expect(res.status).toBe(200);
      seen.push(...res.body.map((n: { id: string }) => n.id));
    }
    expect(seen).toEqual(ids);
    const after = await request(app).get("/api/notes?page=6&limit=7");
    expect(after.body).toEqual([]);
  });

  it("composes with tag and q filters", async () => {
    await seedViaApi();
    // tag=x -> even i; q=alpha -> i divisible by 3; both -> 6,12,18,24,30
    const p1 = await request(app).get("/api/notes?tag=x&q=alpha&page=1&limit=2");
    expect(p1.body.map((n: { title: string }) => n.title)).toEqual(["Item 6", "Item 12"]);
    const p3 = await request(app).get("/api/notes?tag=x&q=alpha&page=3&limit=2");
    expect(p3.body.map((n: { title: string }) => n.title)).toEqual(["Item 30"]);
  });

  it("returns at most 20 notes with no params", async () => {
    await seedViaApi();
    const res = await request(app).get("/api/notes");
    expect(res.body).toHaveLength(20);
  });

  it.each([
    ["page=0", "page"],
    ["page=abc", "page"],
    ["limit=101", "limit"],
  ])("rejects %s with 400 and leaves the store unchanged", async (qs, field) => {
    await seedViaApi();
    const before = noteStore.getAll();
    const res = await request(app).get(`/api/notes?${qs}`);
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([{ field, message: expect.any(String) }]);
    expect(noteStore.getAll()).toEqual(before);
  });
});

describe("PUT /api/notes/:id updatedAt", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("sets a later updatedAt, keeps createdAt, and persists it", async () => {
    jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate"] });
    jest.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    const created = await request(app).post("/api/notes").send({ title: "T", content: "C" });
    jest.setSystemTime(new Date("2026-01-01T00:05:00.000Z"));
    const put = await request(app).put(`/api/notes/${created.body.id}`).send({ title: "T2" });
    expect(put.status).toBe(200);
    expect(new Date(put.body.updatedAt).getTime()).toBeGreaterThan(new Date(created.body.updatedAt).getTime());
    expect(put.body.createdAt).toBe(created.body.createdAt);
    const got = await request(app).get(`/api/notes/${created.body.id}`);
    expect(got.body.updatedAt).toBe(put.body.updatedAt);
  });

  it("returns 404 for unknown id and changes nothing", async () => {
    const created = await request(app).post("/api/notes").send({ title: "T", content: "C" });
    const before = noteStore.getAll();
    const res = await request(app).put("/api/notes/nope").send({ title: "X" });
    expect(res.status).toBe(404);
    expect(noteStore.getAll()).toEqual(before);
    expect(noteStore.getById(created.body.id)?.title).toBe("T");
  });
});

describe("updatedAt lifecycle end to end", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  function at(iso: string): void {
    jest.setSystemTime(new Date(iso));
  }

  it("bumps updatedAt on each PUT and persists it", async () => {
    jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate"] });
    at("2026-02-01T00:00:00.000Z");
    const created = await request(app).post("/api/notes").send({ title: "T", content: "C" });
    expect(created.body.createdAt).toBe(created.body.updatedAt);
    const { id, createdAt } = created.body;

    at("2026-02-01T01:00:00.000Z");
    const first = await request(app).put(`/api/notes/${id}`).send({ title: "T1" });
    at("2026-02-01T02:00:00.000Z");
    const second = await request(app).put(`/api/notes/${id}`).send({ content: "C2" });

    expect(new Date(first.body.updatedAt).getTime()).toBeGreaterThan(new Date(created.body.updatedAt).getTime());
    expect(new Date(second.body.updatedAt).getTime()).toBeGreaterThan(new Date(first.body.updatedAt).getTime());
    for (const body of [first.body, second.body]) {
      expect(body.createdAt).toBe(createdAt);
      expect(body.id).toBe(id);
    }

    const one = await request(app).get(`/api/notes/${id}`);
    expect(one.body.updatedAt).toBe(second.body.updatedAt);
    const all = await request(app).get("/api/notes");
    expect(all.body[0].updatedAt).toBe(second.body.updatedAt);
  });

  it("leaves updatedAt unchanged after a rejected 400 or 404 PUT", async () => {
    jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate"] });
    at("2026-03-01T00:00:00.000Z");
    const created = await request(app).post("/api/notes").send({ title: "T", content: "C" });
    const { id, updatedAt } = created.body;

    at("2026-03-01T01:00:00.000Z");
    const bad = await request(app).put(`/api/notes/${id}`).send({ title: "" });
    expect(bad.status).toBe(400);
    const missing = await request(app).put("/api/notes/unknown").send({ title: "X" });
    expect(missing.status).toBe(404);

    const got = await request(app).get(`/api/notes/${id}`);
    expect(got.body.updatedAt).toBe(updatedAt);
  });
});
