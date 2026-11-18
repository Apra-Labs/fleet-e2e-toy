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

describe("length limits", () => {
  const fields = (body: { errors: { field: string }[] }) => body.errors.map((e) => e.field);

  describe("POST /api/notes", () => {
    it("returns 201 for a 200-char title", async () => {
      const res = await request(app).post("/api/notes").send({ title: "a".repeat(200), content: "x" });
      expect(res.status).toBe(201);
    });

    it("returns 400 with a title error for a 201-char title", async () => {
      const res = await request(app).post("/api/notes").send({ title: "a".repeat(201), content: "x" });
      expect(res.status).toBe(400);
      expect(fields(res.body)).toContain("title");
    });

    it("returns 201 for 10000-char content", async () => {
      const res = await request(app).post("/api/notes").send({ title: "t", content: "x".repeat(10000) });
      expect(res.status).toBe(201);
    });

    it("returns 400 with a content error for 10001-char content", async () => {
      const res = await request(app).post("/api/notes").send({ title: "t", content: "x".repeat(10001) });
      expect(res.status).toBe(400);
      expect(fields(res.body)).toContain("content");
    });
  });

  describe("PUT /api/notes/:id", () => {
    const createNote = async () => {
      const res = await request(app).post("/api/notes").send({ title: "Original", content: "Old" });
      return res.body.id as string;
    };

    it("returns 200 for a 200-char title", async () => {
      const id = await createNote();
      const res = await request(app).put(`/api/notes/${id}`).send({ title: "a".repeat(200) });
      expect(res.status).toBe(200);
    });

    it("returns 400 for a 201-char title and leaves the note unchanged", async () => {
      const id = await createNote();
      const res = await request(app).put(`/api/notes/${id}`).send({ title: "a".repeat(201) });
      expect(res.status).toBe(400);
      expect(fields(res.body)).toContain("title");
      const get = await request(app).get(`/api/notes/${id}`);
      expect(get.body.title).toBe("Original");
      expect(get.body.content).toBe("Old");
    });

    it("returns 200 for 10000-char content", async () => {
      const id = await createNote();
      const res = await request(app).put(`/api/notes/${id}`).send({ content: "x".repeat(10000) });
      expect(res.status).toBe(200);
    });

    it("returns 400 for 10001-char content and leaves the note unchanged", async () => {
      const id = await createNote();
      const res = await request(app).put(`/api/notes/${id}`).send({ content: "x".repeat(10001) });
      expect(res.status).toBe(400);
      expect(fields(res.body)).toContain("content");
      const get = await request(app).get(`/api/notes/${id}`);
      expect(get.body.title).toBe("Original");
      expect(get.body.content).toBe("Old");
    });
  });
});
