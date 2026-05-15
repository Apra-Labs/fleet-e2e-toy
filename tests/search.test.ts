import request from "supertest";
import app from "../src/app";
import { noteStore } from "../src/models/note";

beforeEach(() => {
  noteStore.clear();
});

describe("GET /api/notes - Search Edge Cases", () => {
  describe("Empty query", () => {
    it("returns all notes when query is empty string", async () => {
      await request(app)
        .post("/api/notes")
        .send({ title: "Hello World", content: "Greeting", tags: [] });
      await request(app)
        .post("/api/notes")
        .send({ title: "TypeScript", content: "Language", tags: [] });

      const res = await request(app).get("/api/notes?q=");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it("returns all notes when query is whitespace only", async () => {
      await request(app)
        .post("/api/notes")
        .send({ title: "Note 1", content: "Content 1", tags: [] });
      await request(app)
        .post("/api/notes")
        .send({ title: "Note 2", content: "Content 2", tags: [] });

      const res = await request(app).get("/api/notes?q=%20%20%20");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe("Case-insensitivity", () => {
    it("finds matches with uppercase query", async () => {
      await request(app)
        .post("/api/notes")
        .send({ title: "Hello World", content: "Greeting", tags: [] });

      const res = await request(app).get("/api/notes?q=HELLO");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe("Hello World");
    });

    it("finds matches with mixed case query", async () => {
      await request(app)
        .post("/api/notes")
        .send({ title: "TypeScript Guide", content: "Learn basics", tags: [] });

      const res = await request(app).get("/api/notes?q=TyPeScRiPt");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toContain("TypeScript");
    });

    it("finds matches in content with case variation", async () => {
      await request(app)
        .post("/api/notes")
        .send({ title: "Guide", content: "Learn TypeScript basics", tags: [] });

      const res = await request(app).get("/api/notes?q=BASICS");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe("No matches", () => {
    it("returns empty array in data with 200 when no notes match", async () => {
      await request(app)
        .post("/api/notes")
        .send({ title: "Existing note", content: "Some content", tags: [] });

      const res = await request(app).get("/api/notes?q=nonexistent");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it("returns empty array in data with 200 for query with no matches", async () => {
      await request(app)
        .post("/api/notes")
        .send({ title: "Note", content: "Content", tags: [] });

      const res = await request(app).get("/api/notes?q=xyz123abc");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe("Standard matches", () => {
    it("finds notes by title", async () => {
      await request(app)
        .post("/api/notes")
        .send({ title: "Hello World", content: "Greeting", tags: [] });

      const res = await request(app).get("/api/notes?q=Hello");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toContain("Hello");
    });

    it("finds notes by content", async () => {
      await request(app)
        .post("/api/notes")
        .send({ title: "API", content: "Best practices for REST APIs", tags: [] });

      const res = await request(app).get("/api/notes?q=REST");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it("returns empty array in data for query with no matches in title or content", async () => {
      await request(app)
        .post("/api/notes")
        .send({ title: "One", content: "Another", tags: [] });

      const res = await request(app).get("/api/notes?q=missing");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });
});
