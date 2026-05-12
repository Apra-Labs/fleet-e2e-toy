import request from "supertest";
import app from "../src/app";
import { noteStore } from "../src/models/note";

beforeEach(() => {
  noteStore.clear();
});

describe("Note Archiving", () => {
  async function createNote(title = "Test Note", content = "Content", tags: string[] = []) {
    const res = await request(app)
      .post("/api/notes")
      .send({ title, content, tags });
    return res.body;
  }

  describe("Note model", () => {
    it("creates notes with archived defaulting to false", async () => {
      const res = await request(app)
        .post("/api/notes")
        .send({ title: "New Note", content: "Content", tags: [] });
      expect(res.status).toBe(201);
      expect(res.body.archived).toBe(false);
    });
  });

  describe("POST /api/notes/:id/archive", () => {
    it("archives an existing note and returns it", async () => {
      const note = await createNote();

      const res = await request(app).post(`/api/notes/${note.id}/archive`);
      expect(res.status).toBe(200);
      expect(res.body.archived).toBe(true);
      expect(res.body.id).toBe(note.id);
    });

    it("returns 404 when archiving a non-existent note", async () => {
      const res = await request(app).post("/api/notes/nonexistent-id/archive");
      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
    });
  });

  describe("POST /api/notes/:id/unarchive", () => {
    it("unarchives an archived note and returns it", async () => {
      const note = await createNote();
      await request(app).post(`/api/notes/${note.id}/archive`);

      const res = await request(app).post(`/api/notes/${note.id}/unarchive`);
      expect(res.status).toBe(200);
      expect(res.body.archived).toBe(false);
      expect(res.body.id).toBe(note.id);
    });

    it("returns 404 when unarchiving a non-existent note", async () => {
      const res = await request(app).post("/api/notes/nonexistent-id/unarchive");
      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
    });
  });

  describe("GET /api/notes - archived filtering", () => {
    it("excludes archived notes by default", async () => {
      const note = await createNote("Active Note");
      const archived = await createNote("Archived Note");
      await request(app).post(`/api/notes/${archived.id}/archive`);

      const res = await request(app).get("/api/notes");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(note.id);
    });

    it("includes archived notes when include_archived=true", async () => {
      const note = await createNote("Active Note");
      const archived = await createNote("Archived Note");
      await request(app).post(`/api/notes/${archived.id}/archive`);

      const res = await request(app).get("/api/notes?include_archived=true");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it("returns empty array when all notes are archived", async () => {
      const note = await createNote();
      await request(app).post(`/api/notes/${note.id}/archive`);

      const res = await request(app).get("/api/notes");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("unarchived notes reappear in default listing", async () => {
      const note = await createNote();
      await request(app).post(`/api/notes/${note.id}/archive`);
      await request(app).post(`/api/notes/${note.id}/unarchive`);

      const res = await request(app).get("/api/notes");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });
});
