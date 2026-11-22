import request from "supertest";
import app from "../../src/app";
import { noteStore } from "../../src/models/note";

beforeEach(() => {
  noteStore.clear();
});

async function createNote(title: string): Promise<string> {
  const res = await request(app).post("/api/notes").send({ title, content: "body", tags: [] });
  expect(res.status).toBe(201);
  return res.body.id as string;
}

describe("GET /api/notes/count (integration)", () => {
  it("returns { count: 0 } on an empty store", async () => {
    const res = await request(app).get("/api/notes/count");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ count: 0 });
  });

  it("tracks the create/delete lifecycle and matches the list length", async () => {
    const ids = [await createNote("one"), await createNote("two"), await createNote("three")];

    let count = await request(app).get("/api/notes/count");
    let list = await request(app).get("/api/notes");
    expect(count.body.count).toBe(3);
    expect(count.body.count).toBe(list.body.length);

    const del = await request(app).delete(`/api/notes/${ids[0]}`);
    expect(del.status).toBe(204);

    count = await request(app).get("/api/notes/count");
    list = await request(app).get("/api/notes");
    expect(count.body.count).toBe(2);
    expect(count.body.count).toBe(list.body.length);
  });

  it("returns an integer count with no other keys", async () => {
    await createNote("x");
    const res = await request(app).get("/api/notes/count");
    expect(typeof res.body.count).toBe("number");
    expect(Number.isInteger(res.body.count)).toBe(true);
    expect(Object.keys(res.body)).toEqual(["count"]);
  });

  it("is not interpreted as a note id", async () => {
    const res = await request(app).get("/api/notes/count");
    expect(res.status).not.toBe(404);
    expect(res.body).not.toHaveProperty("error");
  });
});
