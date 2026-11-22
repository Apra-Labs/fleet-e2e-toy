import request from "supertest";
import { readFileSync } from "fs";
import path from "path";
import app from "../src/app";

const expectedVersion: string = JSON.parse(
  readFileSync(path.join(__dirname, "..", "package.json"), "utf8")
).version;

describe("GET /api/version", () => {
  it("returns 200 with the package.json version as JSON", async () => {
    const res = await request(app).get("/api/version");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(typeof res.body.version).toBe("string");
    expect(res.body.version).toBe(expectedVersion);
  });

  it("does not match unknown sibling paths", async () => {
    const res = await request(app).get("/api/versionx");
    expect(res.body.version).toBeUndefined();
  });
});
