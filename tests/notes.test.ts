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
    expect(res.body.data).toEqual([]);
    expect(res.body.total).toBe(0);
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
    expect(res.body.data).toHaveLength(2);
  });

  it("filters by tag", async () => {
    await request(app)
      .post("/api/notes")
      .send({ title: "Tagged", content: "Body", tags: ["work"] });
    await request(app)
      .post("/api/notes")
      .send({ title: "Untagged", content: "Body", tags: ["personal"] });

    const res = await request(app).get("/api/notes?tag=work");
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe("Tagged");
  });

  it("returns empty array when no notes match tag", async () => {
    await request(app)
      .post("/api/notes")
      .send({ title: "Work note", content: "Body", tags: ["work"] });

    const res = await request(app).get("/api/notes?tag=nonexistent");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("returns note that has multiple tags when filtering by one of them", async () => {
    await request(app)
      .post("/api/notes")
      .send({ title: "Multi-tag", content: "Body", tags: ["work", "important", "review"] });
    await request(app)
      .post("/api/notes")
      .send({ title: "Single-tag", content: "Body", tags: ["personal"] });

    const res = await request(app).get("/api/notes?tag=important");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe("Multi-tag");
  });

  it("searches by query string", async () => {
    await request(app)
      .post("/api/notes")
      .send({ title: "Meeting notes", content: "Discuss project", tags: [] });
    await request(app)
      .post("/api/notes")
      .send({ title: "Shopping list", content: "Milk, eggs", tags: [] });

    const res = await request(app).get("/api/notes?q=meeting");
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe("Meeting notes");
  });

  it("searches in content field (not just title)", async () => {
    await request(app)
      .post("/api/notes")
      .send({ title: "Daily log", content: "Had a team meeting today", tags: [] });
    await request(app)
      .post("/api/notes")
      .send({ title: "Random note", content: "Nothing interesting", tags: [] });

    const res = await request(app).get("/api/notes?q=meeting");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe("Daily log");
  });

  it("returns empty array when no notes match search query", async () => {
    await request(app)
      .post("/api/notes")
      .send({ title: "Note one", content: "Some content", tags: [] });

    const res = await request(app).get("/api/notes?q=zzznomatch");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("returns all notes when search query is empty string", async () => {
    await request(app)
      .post("/api/notes")
      .send({ title: "Note one", content: "Content", tags: [] });
    await request(app)
      .post("/api/notes")
      .send({ title: "Note two", content: "Content", tags: [] });

    const res = await request(app).get("/api/notes?q=");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it("search is case-insensitive", async () => {
    await request(app)
      .post("/api/notes")
      .send({ title: "MEETING AGENDA", content: "Quarterly review", tags: [] });

    const res = await request(app).get("/api/notes?q=meeting");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe("MEETING AGENDA");
  });

  it("paginates results with page and limit params", async () => {
    for (let i = 1; i <= 25; i++) {
      await request(app)
        .post("/api/notes")
        .send({ title: `Note ${i}`, content: "Content", tags: [] });
    }

    const page1 = await request(app).get("/api/notes?page=1&limit=10");
    expect(page1.status).toBe(200);
    expect(page1.body.data).toHaveLength(10);
    expect(page1.body.total).toBe(25);
    expect(page1.body.page).toBe(1);
    expect(page1.body.limit).toBe(10);

    const page3 = await request(app).get("/api/notes?page=3&limit=10");
    expect(page3.body.data).toHaveLength(5);
    expect(page3.body.total).toBe(25);
    expect(page3.body.page).toBe(3);
  });

  it("defaults to page 1 with limit 20", async () => {
    for (let i = 1; i <= 25; i++) {
      await request(app)
        .post("/api/notes")
        .send({ title: `Note ${i}`, content: "Content", tags: [] });
    }

    const res = await request(app).get("/api/notes");
    expect(res.body.data).toHaveLength(20);
    expect(res.body.total).toBe(25);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(20);
  });

  it("returns empty data array when page is beyond total", async () => {
    await request(app)
      .post("/api/notes")
      .send({ title: "Only note", content: "Content", tags: [] });

    const res = await request(app).get("/api/notes?page=5&limit=10");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.total).toBe(1);
    expect(res.body.page).toBe(5);
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

describe("Note archiving", () => {
  it("archived note is excluded from GET /api/notes by default", async () => {
    const create = await request(app)
      .post("/api/notes")
      .send({ title: "To archive", content: "Body", tags: [] });

    await request(app).post(`/api/notes/${create.body.id}/archive`);

    const res = await request(app).get("/api/notes");
    expect(res.body.data.map((n: { id: string }) => n.id)).not.toContain(create.body.id);
    expect(res.body.total).toBe(0);
  });

  it("archived note is included when include_archived=true", async () => {
    const create = await request(app)
      .post("/api/notes")
      .send({ title: "Archived", content: "Body", tags: [] });

    await request(app).post(`/api/notes/${create.body.id}/archive`);

    const res = await request(app).get("/api/notes?include_archived=true");
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].archived).toBe(true);
  });

  it("unarchived note is visible again in default GET", async () => {
    const create = await request(app)
      .post("/api/notes")
      .send({ title: "Unarchive me", content: "Body", tags: [] });

    await request(app).post(`/api/notes/${create.body.id}/archive`);
    await request(app).post(`/api/notes/${create.body.id}/unarchive`);

    const res = await request(app).get("/api/notes");
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].archived).toBe(false);
  });

  it("GET /:id returns archived note", async () => {
    const create = await request(app)
      .post("/api/notes")
      .send({ title: "Archived single", content: "Body", tags: [] });

    await request(app).post(`/api/notes/${create.body.id}/archive`);

    const res = await request(app).get(`/api/notes/${create.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.archived).toBe(true);
  });

  it("archive returns 404 for non-existent note", async () => {
    const res = await request(app).post("/api/notes/no-such-id/archive");
    expect(res.status).toBe(404);
  });

  it("unarchive returns 404 for non-existent note", async () => {
    const res = await request(app).post("/api/notes/no-such-id/unarchive");
    expect(res.status).toBe(404);
  });

  it("pagination total counts only non-archived notes by default", async () => {
    for (let i = 1; i <= 5; i++) {
      await request(app)
        .post("/api/notes")
        .send({ title: `Note ${i}`, content: "Content", tags: [] });
    }
    const list = await request(app).get("/api/notes");
    const firstId = list.body.data[0].id;
    await request(app).post(`/api/notes/${firstId}/archive`);

    const res = await request(app).get("/api/notes");
    expect(res.body.total).toBe(4);
    expect(res.body.data).toHaveLength(4);
  });

  it("archive endpoint returns updated note with archived=true", async () => {
    const create = await request(app)
      .post("/api/notes")
      .send({ title: "Check response", content: "Body", tags: [] });

    const res = await request(app).post(`/api/notes/${create.body.id}/archive`);
    expect(res.status).toBe(200);
    expect(res.body.archived).toBe(true);
    expect(res.body.id).toBe(create.body.id);
  });
});

describe("GET /health", () => {
  it("returns ok status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
