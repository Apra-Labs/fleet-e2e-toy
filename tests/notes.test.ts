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
