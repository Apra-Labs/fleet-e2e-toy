import request from "supertest";
import app from "../src/app";

describe("GET /version", () => {
  it("returns 200 with correct fields", async () => {
    const res = await request(app).get("/version");
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("fleet-e2e-toy");
    expect(res.body.version).toBe("1.0.0");
    expect(res.body.display).toBe("fleet-e2e-toy v1.0.0");
  });
});

describe("GET /help", () => {
  it("returns 200 with correct name and version", async () => {
    const res = await request(app).get("/help");
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("fleet-e2e-toy");
    expect(res.body.version).toBe("1.0.0");
  });

  it("returns endpoints array with at least 8 entries", async () => {
    const res = await request(app).get("/help");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.endpoints)).toBe(true);
    expect(res.body.endpoints.length).toBeGreaterThanOrEqual(8);
  });

  it("includes all required endpoint (method, path) pairs", async () => {
    const res = await request(app).get("/help");
    expect(res.status).toBe(200);

    const endpoints: Array<{ method: string; path: string }> = res.body.endpoints;

    const has = (method: string, path: string) =>
      endpoints.some((e) => e.method === method && e.path === path);

    expect(has("GET", "/health")).toBe(true);
    expect(has("GET", "/version")).toBe(true);
    expect(has("GET", "/help")).toBe(true);
    expect(has("GET", "/api/notes")).toBe(true);
    expect(has("POST", "/api/notes")).toBe(true);
    expect(has("GET", "/api/notes/:id")).toBe(true);
    expect(has("PUT", "/api/notes/:id")).toBe(true);
    expect(has("DELETE", "/api/notes/:id")).toBe(true);
  });

  it("returns description field", async () => {
    const res = await request(app).get("/help");
    expect(res.status).toBe(200);
    expect(typeof res.body.description).toBe("string");
    expect(res.body.description.length).toBeGreaterThan(0);
  });
});
