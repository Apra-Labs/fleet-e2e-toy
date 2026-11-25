import request from "supertest";
import app from "../src/app";

describe("GET /api/echo", () => {
  it("echoes the msg query param", async () => {
    const res = await request(app).get("/api/echo?msg=hello");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body).toEqual({ echo: "hello" });
  });

  it("decodes URL-encoded msg", async () => {
    const res = await request(app).get("/api/echo?msg=hello%20world");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ echo: "hello world" });
  });

  it("returns 400 when msg is missing", async () => {
    const res = await request(app).get("/api/echo");
    expect(res.status).toBe(400);
    expect(typeof res.body.error).toBe("string");
    expect(res.body).not.toHaveProperty("echo");
  });

  it("returns 400 when msg is repeated", async () => {
    const res = await request(app).get("/api/echo?msg=a&msg=b");
    expect(res.status).toBe(400);
    expect(typeof res.body.error).toBe("string");
  });

  it("returns 200 with empty echo when msg is empty", async () => {
    const res = await request(app).get("/api/echo?msg=");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ echo: "" });
  });
});
