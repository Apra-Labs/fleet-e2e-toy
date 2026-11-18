import request from "supertest";
import app from "../src/app";

describe("GET /api/time", () => {
  it("returns 200 and { now: <ISO-8601 string> } as JSON", async () => {
    const before = Date.now();
    const res = await request(app).get("/api/time");
    const after = Date.now();

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(Object.keys(res.body)).toEqual(["now"]);
    expect(typeof res.body.now).toBe("string");

    const parsed = new Date(res.body.now);
    expect(Number.isNaN(parsed.getTime())).toBe(false);
    expect(parsed.toISOString()).toBe(res.body.now);

    // Allow 1s slack for millisecond rounding
    expect(parsed.getTime()).toBeGreaterThanOrEqual(before - 1000);
    expect(parsed.getTime()).toBeLessThanOrEqual(after + 1000);
  });
});
