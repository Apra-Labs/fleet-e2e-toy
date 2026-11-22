import request from "supertest";
import app from "../../src/app";
import { noteStore } from "../../src/models/note";

beforeEach(() => {
  noteStore.clear();
});

async function createNote(title: string): Promise<string> {
  const res = await request(app)
    .post("/api/notes")
    .send({ title, content: `${title} content`, tags: [] });
  expect(res.status).toBe(201);
  return res.body.id as string;
}

describe("GET /api/notes/count end-to-end", () => {
  it("tracks count across a create/delete lifecycle", async () => {
    let res = await request(app).get("/api/notes/count");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ count: 0 });

    const ids = [await createNote("A"), await createNote("B"), await createNote("C")];

    res = await request(app).get("/api/notes/count");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ count: 3 });
    expect(Number.isInteger(res.body.count)).toBe(true);

    const del = await request(app).delete(`/api/notes/${ids[0]}`);
    expect(del.status).toBe(204);

    res = await request(app).get("/api/notes/count");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ count: 2 });

    const list = await request(app).get("/api/notes");
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(res.body.count);

    const byId = await request(app).get(`/api/notes/${ids[1]}`);
    expect(byId.status).toBe(200);
    expect(byId.body.id).toBe(ids[1]);
  });
});
