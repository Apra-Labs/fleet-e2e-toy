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

  describe("GET /api/notes — tag filter edge cases", () => {
    it("?tag= (empty string) returns all notes", async () => {
      await request(app)
        .post("/api/notes")
        .send({ title: "Note 1", content: "Content", tags: ["a"] });
      await request(app)
        .post("/api/notes")
        .send({ title: "Note 2", content: "Content", tags: ["b"] });

      const res = await request(app).get("/api/notes?tag=");
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(2);
      expect(res.body.data).toHaveLength(2);
    });

    it("?tag=nonexistent returns empty data and total=0", async () => {
      await request(app)
        .post("/api/notes")
        .send({ title: "Note 1", content: "Content", tags: ["work"] });
      await request(app)
        .post("/api/notes")
        .send({ title: "Note 2", content: "Content", tags: ["personal"] });

      const res = await request(app).get("/api/notes?tag=nonexistent");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.total).toBe(0);
    });

    it("multiple ?tag=a&tag=b uses last value", async () => {
      await request(app)
        .post("/api/notes")
        .send({ title: "Note A", content: "Content", tags: ["a"] });
      await request(app)
        .post("/api/notes")
        .send({ title: "Note B", content: "Content", tags: ["b"] });

      const res = await request(app).get("/api/notes?tag=a&tag=b");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe("Note B");
      expect(res.body.total).toBe(1);
    });
  });

  describe("GET /api/notes — search edge cases", () => {
    it("?q= (empty) returns all notes", async () => {
      await request(app)
        .post("/api/notes")
        .send({ title: "Note 1", content: "Content", tags: [] });
      await request(app)
        .post("/api/notes")
        .send({ title: "Note 2", content: "Content", tags: [] });

      const res = await request(app).get("/api/notes?q=");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.total).toBe(2);
    });

    it("?q=zzznomatch returns empty data and total=0", async () => {
      await request(app)
        .post("/api/notes")
        .send({ title: "Note 1", content: "Content", tags: [] });
      await request(app)
        .post("/api/notes")
        .send({ title: "Note 2", content: "Content", tags: [] });

      const res = await request(app).get("/api/notes?q=zzznomatch");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.total).toBe(0);
    });

    it("?q=c++ does not throw, returns results or empty array", async () => {
      await request(app)
        .post("/api/notes")
        .send({ title: "C++ Programming", content: "Learn C++", tags: [] });
      await request(app)
        .post("/api/notes")
        .send({ title: "JavaScript Notes", content: "ES6 features", tags: [] });

      const res = await request(app).get("/api/notes?q=c%2B%2B");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe("C++ Programming");
    });

    it("?q=foo bar (space in query) does not throw, treated as literal substring match", async () => {
      await request(app)
        .post("/api/notes")
        .send({ title: "foo bar baz", content: "Content", tags: [] });
      await request(app)
        .post("/api/notes")
        .send({ title: "foo only", content: "Content", tags: [] });

      const res = await request(app).get("/api/notes?q=foo%20bar");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe("foo bar baz");
    });
  });

  describe("GET /api/notes — pagination edge cases", () => {
    it("?page=abc returns 400 with error", async () => {
      const res = await request(app).get("/api/notes?page=abc");
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it("?limit=xyz returns 400 with error", async () => {
      const res = await request(app).get("/api/notes?limit=xyz");
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it("?limit=0 returns 400", async () => {
      const res = await request(app).get("/api/notes?limit=0");
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it("?page=999 beyond last page returns empty data with actual total", async () => {
      await request(app)
        .post("/api/notes")
        .send({ title: "Note 1", content: "Content", tags: [] });
      await request(app)
        .post("/api/notes")
        .send({ title: "Note 2", content: "Content", tags: [] });

      const res = await request(app).get("/api/notes?page=999");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.total).toBe(2);
      expect(res.body.page).toBe(999);
      expect(res.body.limit).toBe(10);
    });

    it("?limit=100 with 3 notes returns all 3 with total=3", async () => {
      for (let i = 1; i <= 3; i++) {
        await request(app)
          .post("/api/notes")
          .send({ title: `Note ${i}`, content: "Content", tags: [] });
      }

      const res = await request(app).get("/api/notes?limit=100");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.total).toBe(3);
    });

    it("?page=1&limit=2 with 5 notes returns first 2 with total=5", async () => {
      for (let i = 1; i <= 5; i++) {
        await request(app)
          .post("/api/notes")
          .send({ title: `Note ${i}`, content: "Content", tags: [] });
      }

      const res = await request(app).get("/api/notes?page=1&limit=2");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.total).toBe(5);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(2);
    });

    it("default pagination returns page=1 and limit=10", async () => {
      const res = await request(app).get("/api/notes");
      expect(res.status).toBe(200);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(10);
    });
  });
});

describe("GET /api/notes — composition", () => {
  beforeEach(() => {
    noteStore.clear();
  });

  it("tag+search+pagination page 1 returns filtered results", async () => {
    // 3 notes that match both tag=work AND q=meeting
    await request(app).post("/api/notes").send({ title: "Work meeting 1", content: "meeting agenda", tags: ["work"] });
    await request(app).post("/api/notes").send({ title: "Work meeting 2", content: "weekly meeting notes", tags: ["work"] });
    await request(app).post("/api/notes").send({ title: "Work meeting 3", content: "meeting tomorrow", tags: ["work"] });
    // notes that only match one filter — should be excluded
    await request(app).post("/api/notes").send({ title: "Work task", content: "complete the project", tags: ["work"] });
    await request(app).post("/api/notes").send({ title: "Personal meeting", content: "family meeting", tags: ["personal"] });
    await request(app).post("/api/notes").send({ title: "Random note", content: "nothing", tags: [] });

    const res = await request(app).get("/api/notes?tag=work&q=meeting&page=1&limit=2");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(2);
    // all returned notes must be tagged work and contain meeting
    for (const note of res.body.data) {
      expect(note.tags).toContain("work");
      const haystack = (note.title + " " + note.content).toLowerCase();
      expect(haystack).toContain("meeting");
    }
  });

  it("tag+search+pagination page 2 returns remaining results", async () => {
    await request(app).post("/api/notes").send({ title: "Work meeting 1", content: "meeting agenda", tags: ["work"] });
    await request(app).post("/api/notes").send({ title: "Work meeting 2", content: "weekly meeting notes", tags: ["work"] });
    await request(app).post("/api/notes").send({ title: "Work meeting 3", content: "meeting tomorrow", tags: ["work"] });
    await request(app).post("/api/notes").send({ title: "Work task", content: "complete the project", tags: ["work"] });
    await request(app).post("/api/notes").send({ title: "Personal meeting", content: "family meeting", tags: ["personal"] });
    await request(app).post("/api/notes").send({ title: "Random note", content: "nothing", tags: [] });

    const res = await request(app).get("/api/notes?tag=work&q=meeting&page=2&limit=2");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.page).toBe(2);
    expect(res.body.limit).toBe(2);
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
