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

  it("returns 400 when title exceeds 200 characters", async () => {
    const res = await request(app)
      .post("/api/notes")
      .send({ title: "a".repeat(201), content: "Body" });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].field).toBe("title");
    expect(res.body.errors[0].message).toBe("Title must be 200 characters or fewer");
  });

  it("returns 201 when title is exactly 200 characters", async () => {
    const res = await request(app)
      .post("/api/notes")
      .send({ title: "a".repeat(200), content: "Body" });
    expect(res.status).toBe(201);
  });

  it("returns 400 when content exceeds 10000 characters", async () => {
    const res = await request(app)
      .post("/api/notes")
      .send({ title: "Note", content: "a".repeat(10001) });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].field).toBe("content");
    expect(res.body.errors[0].message).toBe("Content must be 10000 characters or fewer");
  });

  it("returns 201 when content is exactly 10000 characters", async () => {
    const res = await request(app)
      .post("/api/notes")
      .send({ title: "Note", content: "a".repeat(10000) });
    expect(res.status).toBe(201);
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

  it("returns 400 when title exceeds 200 characters on PUT", async () => {
    const create = await request(app)
      .post("/api/notes")
      .send({ title: "Original", content: "Old", tags: [] });

    const res = await request(app)
      .put(`/api/notes/${create.body.id}`)
      .send({ title: "a".repeat(201) });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].field).toBe("title");
    expect(res.body.errors[0].message).toBe("Title must be 200 characters or fewer");
  });

  it("returns 200 when title is exactly 200 characters on PUT", async () => {
    const create = await request(app)
      .post("/api/notes")
      .send({ title: "Original", content: "Old", tags: [] });

    const res = await request(app)
      .put(`/api/notes/${create.body.id}`)
      .send({ title: "a".repeat(200) });
    expect(res.status).toBe(200);
  });

  it("returns 400 when content exceeds 10000 characters on PUT", async () => {
    const create = await request(app)
      .post("/api/notes")
      .send({ title: "Original", content: "Old", tags: [] });

    const res = await request(app)
      .put(`/api/notes/${create.body.id}`)
      .send({ content: "a".repeat(10001) });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].field).toBe("content");
    expect(res.body.errors[0].message).toBe("Content must be 10000 characters or fewer");
  });

  it("returns 200 when content is exactly 10000 characters on PUT", async () => {
    const create = await request(app)
      .post("/api/notes")
      .send({ title: "Original", content: "Old", tags: [] });

    const res = await request(app)
      .put(`/api/notes/${create.body.id}`)
      .send({ content: "a".repeat(10000) });
    expect(res.status).toBe(200);
  });

  it("updatedAt advances on PUT /api/notes/:id", async () => {
    const create = await request(app)
      .post("/api/notes")
      .send({ title: "Original", content: "Old", tags: [] });

    const originalCreatedAt = create.body.createdAt;
    const originalUpdatedAt = create.body.updatedAt;

    // Small delay to ensure distinct timestamp
    await new Promise((resolve) => setTimeout(resolve, 10));

    const res = await request(app)
      .put(`/api/notes/${create.body.id}`)
      .send({ title: "Updated Title" });

    expect(res.status).toBe(200);
    expect(res.body.createdAt).toBe(originalCreatedAt);
    expect(new Date(res.body.updatedAt).getTime()).toBeGreaterThan(new Date(originalUpdatedAt).getTime());
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

describe("GET /api/notes pagination", () => {
  async function createNotes(count: number): Promise<void> {
    for (let i = 1; i <= count; i++) {
      await request(app)
        .post("/api/notes")
        .send({ title: `Note ${i}`, content: `Content ${i}`, tags: i % 2 === 0 ? ["even"] : ["odd"] });
    }
  }

  it("default returns 20 items with correct pagination metadata when >20 notes exist", async () => {
    await createNotes(25);
    const res = await request(app).get("/api/notes");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(20);
    expect(res.body.total).toBe(25);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(20);
    expect(res.body.totalPages).toBe(2);
  });

  it("page=2&limit=10 returns the correct slice", async () => {
    await createNotes(25);
    const res = await request(app).get("/api/notes?page=2&limit=10");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(10);
    expect(res.body.page).toBe(2);
    expect(res.body.limit).toBe(10);
    expect(res.body.total).toBe(25);
    expect(res.body.totalPages).toBe(3);
    // Second page with limit=10 should have items 11-20
    expect(res.body.data[0].title).toBe("Note 11");
    expect(res.body.data[9].title).toBe("Note 20");
  });

  it("pagination applies after tag filter", async () => {
    await createNotes(25);
    // Even-tagged notes: 2,4,6,8,10,12,14,16,18,20,22,24 = 12 notes
    const res = await request(app).get("/api/notes?tag=even&page=1&limit=5");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.total).toBe(12);
    expect(res.body.totalPages).toBe(3);
  });

  it("pagination applies after q search filter", async () => {
    await createNotes(25);
    // All notes have title "Note N" so searching "note" matches all 25
    const res = await request(app).get("/api/notes?q=note&page=2&limit=10");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(25);
    expect(res.body.data).toHaveLength(10);
    expect(res.body.page).toBe(2);
  });

  it("returns 400 for page=0", async () => {
    const res = await request(app).get("/api/notes?page=0");
    expect(res.status).toBe(400);
  });

  it("returns 400 for negative page", async () => {
    const res = await request(app).get("/api/notes?page=-1");
    expect(res.status).toBe(400);
  });

  it("returns 400 for non-integer page", async () => {
    const res = await request(app).get("/api/notes?page=1.5");
    expect(res.status).toBe(400);
  });

  it("returns 400 for limit=0", async () => {
    const res = await request(app).get("/api/notes?limit=0");
    expect(res.status).toBe(400);
  });

  it("returns 400 for negative limit", async () => {
    const res = await request(app).get("/api/notes?limit=-5");
    expect(res.status).toBe(400);
  });

  it("returns 400 for non-integer limit", async () => {
    const res = await request(app).get("/api/notes?limit=2.5");
    expect(res.status).toBe(400);
  });

  it("returns 400 for limit>100", async () => {
    const res = await request(app).get("/api/notes?limit=101");
    expect(res.status).toBe(400);
  });
});

describe("GET /health", () => {
  it("returns ok status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
