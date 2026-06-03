import request from "supertest";
import app from "../src/app";

describe("GET /api/help", () => {
  it("returns 200 with an endpoints array of length 8", async () => {
    const res = await request(app).get("/api/help");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.endpoints)).toBe(true);
    expect(res.body.endpoints).toHaveLength(8);
  });

  it("includes every existing route", async () => {
    const res = await request(app).get("/api/help");
    const expectedRoutes = [
      { method: "GET", path: "/version" },
      { method: "GET", path: "/health" },
      { method: "GET", path: "/api/help" },
      { method: "GET", path: "/api/notes" },
      { method: "GET", path: "/api/notes/:id" },
      { method: "POST", path: "/api/notes" },
      { method: "PUT", path: "/api/notes/:id" },
      { method: "DELETE", path: "/api/notes/:id" }
    ];
    for (const expected of expectedRoutes) {
      expect(res.body.endpoints).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ method: expected.method, path: expected.path })
        ])
      );
    }
  });

  it("every entry has non-empty method, path, and description strings", async () => {
    const res = await request(app).get("/api/help");
    for (const entry of res.body.endpoints) {
      expect(typeof entry.method).toBe("string");
      expect(entry.method.trim().length).toBeGreaterThan(0);
      expect(typeof entry.path).toBe("string");
      expect(entry.path.trim().length).toBeGreaterThan(0);
      expect(typeof entry.description).toBe("string");
      expect(entry.description.trim().length).toBeGreaterThan(0);
    }
  });
});
