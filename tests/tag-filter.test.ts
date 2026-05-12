import request from "supertest";
import app from "../src/app";
import { noteStore } from "../src/models/note";

beforeEach(() => {
  noteStore.clear();
});

describe("GET /api/notes?tag= — Tag Filtering", () => {
  it("returns only notes with the given tag", async () => {
    await request(app)
      .post("/api/notes")
      .send({ title: "Work item", content: "Do work", tags: ["work"] });
    await request(app)
      .post("/api/notes")
      .send({ title: "Personal item", content: "Buy groceries", tags: ["personal"] });

    const res = await request(app).get("/api/notes?tag=work");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe("Work item");
  });

  it("returns empty array when no notes match the tag", async () => {
    await request(app)
      .post("/api/notes")
      .send({ title: "A note", content: "Content", tags: ["other"] });

    const res = await request(app).get("/api/notes?tag=nonexistent");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("returns notes that have the tag among multiple tags", async () => {
    await request(app)
      .post("/api/notes")
      .send({ title: "Multi-tagged", content: "Content", tags: ["work", "urgent", "review"] });
    await request(app)
      .post("/api/notes")
      .send({ title: "Single-tagged", content: "Content", tags: ["personal"] });

    const res = await request(app).get("/api/notes?tag=urgent");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe("Multi-tagged");
  });

  it("returns multiple notes that all share the same tag", async () => {
    await request(app)
      .post("/api/notes")
      .send({ title: "Note A", content: "Content", tags: ["work"] });
    await request(app)
      .post("/api/notes")
      .send({ title: "Note B", content: "Content", tags: ["work", "urgent"] });
    await request(app)
      .post("/api/notes")
      .send({ title: "Note C", content: "Content", tags: ["personal"] });

    const res = await request(app).get("/api/notes?tag=work");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    const titles = res.body.data.map((n: { title: string }) => n.title);
    expect(titles).toContain("Note A");
    expect(titles).toContain("Note B");
  });

  it("returns all notes when no tag filter is provided", async () => {
    await request(app)
      .post("/api/notes")
      .send({ title: "One", content: "Content", tags: ["a"] });
    await request(app)
      .post("/api/notes")
      .send({ title: "Two", content: "Content", tags: ["b"] });

    const res = await request(app).get("/api/notes");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });
});
