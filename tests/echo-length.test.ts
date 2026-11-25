import request from "supertest";
import app from "../src/app";

describe("GET /api/echo/length", () => {
  it("returns the length of msg", async () => {
    const res = await request(app).get("/api/echo/length?msg=hello");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body).toEqual({ length: 5 });
  });

  it("measures the URL-decoded msg", async () => {
    const res = await request(app).get("/api/echo/length?msg=hello%20world");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ length: 11 });
  });

  it("returns length 0 for an empty msg", async () => {
    const res = await request(app).get("/api/echo/length?msg=");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ length: 0 });
  });

  it("returns 400 when msg is missing", async () => {
    const res = await request(app).get("/api/echo/length");
    expect(res.status).toBe(400);
    expect(typeof res.body.error).toBe("string");
  });

  it("returns 400 when msg is repeated", async () => {
    const res = await request(app).get("/api/echo/length?msg=a&msg=b");
    expect(res.status).toBe(400);
  });
});
