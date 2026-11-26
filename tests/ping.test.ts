import request from "supertest";
import app from "../src/app";

describe("GET /ping", () => {
  it("returns pong", async () => {
    const res = await request(app).get("/ping");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ pong: true });
  });
});
