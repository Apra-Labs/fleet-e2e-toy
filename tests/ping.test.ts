import request from "supertest";
import app from "../src/app";

describe("GET /api/ping", () => {
  it("returns 200 and { pong: true } as JSON", async () => {
    const res = await request(app).get("/api/ping");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body).toEqual({ pong: true });
  });
});
