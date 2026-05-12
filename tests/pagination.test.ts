import request from "supertest";
import app from "../src/app";
import { noteStore } from "../src/models/note";

beforeEach(() => {
  noteStore.clear();
});

async function createNote(title: string, content = "Content", tags: string[] = []) {
  const res = await request(app)
    .post("/api/notes")
    .send({ title, content, tags });
  return res.body;
}

describe("GET /api/notes — Pagination", () => {
  it("returns paginated response format with defaults", async () => {
    await createNote("Note 1");

    const res = await request(app).get("/api/notes");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("total");
    expect(res.body).toHaveProperty("page");
    expect(res.body).toHaveProperty("limit");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("defaults to page 1 and limit 10", async () => {
    for (let i = 0; i < 15; i++) {
      await createNote(`Note ${i}`);
    }

    const res = await request(app).get("/api/notes");
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(10);
    expect(res.body.total).toBe(15);
    expect(res.body.data).toHaveLength(10);
  });

  it("returns second page of results", async () => {
    for (let i = 0; i < 15; i++) {
      await createNote(`Note ${i}`);
    }

    const res = await request(app).get("/api/notes?page=2&limit=10");
    expect(res.body.page).toBe(2);
    expect(res.body.limit).toBe(10);
    expect(res.body.total).toBe(15);
    expect(res.body.data).toHaveLength(5);
  });

  it("respects custom limit", async () => {
    for (let i = 0; i < 5; i++) {
      await createNote(`Note ${i}`);
    }

    const res = await request(app).get("/api/notes?limit=3");
    expect(res.body.limit).toBe(3);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.total).toBe(5);
  });

  it("returns empty data array for page beyond results", async () => {
    await createNote("Only note");

    const res = await request(app).get("/api/notes?page=5&limit=10");
    expect(res.body.data).toHaveLength(0);
    expect(res.body.total).toBe(1);
    expect(res.body.page).toBe(5);
  });

  it("returns 400 for invalid page parameter", async () => {
    const res = await request(app).get("/api/notes?page=abc");
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("returns 400 for page less than 1", async () => {
    const res = await request(app).get("/api/notes?page=0");
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("returns 400 for invalid limit parameter", async () => {
    const res = await request(app).get("/api/notes?limit=xyz");
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("returns 400 for limit less than 1", async () => {
    const res = await request(app).get("/api/notes?limit=0");
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("works with tag filter and pagination", async () => {
    for (let i = 0; i < 5; i++) {
      await createNote(`Work ${i}`, "Content", ["work"]);
    }
    await createNote("Personal", "Content", ["personal"]);

    const res = await request(app).get("/api/notes?tag=work&limit=3");
    expect(res.body.total).toBe(5);
    expect(res.body.data).toHaveLength(3);
  });

  it("works with search and pagination", async () => {
    for (let i = 0; i < 5; i++) {
      await createNote(`Meeting ${i}`, "Discuss project");
    }
    await createNote("Shopping", "Buy milk");

    const res = await request(app).get("/api/notes?q=meeting&limit=2");
    expect(res.body.total).toBe(5);
    expect(res.body.data).toHaveLength(2);
  });
});
