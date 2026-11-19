import request from "supertest";
import app from "../src/app";

describe("GET /api/ping", () => {
  it("returns 200 with pong true", async () => {
    const res = await request(app).get("/api/ping");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ pong: true });
  });

  it("responds with a JSON content type", async () => {
    const res = await request(app).get("/api/ping");
    expect(res.headers["content-type"]).toMatch(/application\/json/);
  });
});
