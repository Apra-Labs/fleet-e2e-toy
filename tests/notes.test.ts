import request from "supertest";
import pkg from "../package.json";
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

  it("returns 400 for empty content", async () => {
    const res = await request(app)
      .post("/api/notes")
      .send({ title: "T", content: "" });
    expect(res.status).toBe(400);
  });

  it("returns 400 for whitespace-only content", async () => {
    const res = await request(app)
      .post("/api/notes")
      .send({ title: "T", content: "   " });
    expect(res.status).toBe(400);
  });

  it("returns 400 for empty tag value", async () => {
    const res = await request(app)
      .post("/api/notes")
      .send({ title: "T", content: "ok", tags: [""] });
    expect(res.status).toBe(400);
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

  it("returns 400 for empty content on update", async () => {
    const create = await request(app)
      .post("/api/notes")
      .send({ title: "Note", content: "Body", tags: [] });
    const res = await request(app)
      .put(`/api/notes/${create.body.id}`)
      .send({ content: "" });
    expect(res.status).toBe(400);
  });

  it("returns 400 for whitespace-only tag on update", async () => {
    const create = await request(app)
      .post("/api/notes")
      .send({ title: "Note", content: "Body", tags: [] });
    const res = await request(app)
      .put(`/api/notes/${create.body.id}`)
      .send({ tags: ["  "] });
    expect(res.status).toBe(400);
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

describe("GET /version", () => {
  it("returns 200", async () => {
    const res = await request(app).get("/version");
    expect(res.status).toBe(200);
  });

  it("body has name fleet-e2e-toy and version 1.0.0", async () => {
    const res = await request(app).get("/version");
    expect(res.body.name).toBe("fleet-e2e-toy");
    expect(res.body.version).toBe("1.0.0");
  });

  it("version matches package.json", async () => {
    const res = await request(app).get("/version");
    expect(res.body.version).toBe(pkg.version);
  });
});

describe("GET /help", () => {
  it("returns 200", async () => {
    const res = await request(app).get("/help");
    expect(res.status).toBe(200);
  });

  it("body has routes array", async () => {
    const res = await request(app).get("/help");
    expect(Array.isArray(res.body.routes)).toBe(true);
  });

  it("routes array has at least 8 entries", async () => {
    const res = await request(app).get("/help");
    expect(res.body.routes.length).toBeGreaterThanOrEqual(8);
  });

  it("each route entry has method, path, description fields", async () => {
    const res = await request(app).get("/help");
    for (const route of res.body.routes) {
      expect(route).toHaveProperty("method");
      expect(route).toHaveProperty("path");
      expect(route).toHaveProperty("description");
    }
  });
});
