import request from "supertest";
import app from "../src/app";

describe("GET /version", () => {
  it("returns 200 and the package version", async () => {
    const res = await request(app).get("/version");
    expect(res.status).toBe(200);
    expect(typeof res.body.version).toBe("string");
    expect(res.body.version).toBe("1.0.0");
  });
});
