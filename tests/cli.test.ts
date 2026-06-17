import { execSync } from "child_process";
import * as path from "path";
import request from "supertest";
import app from "../src/app";

const cliPath = path.resolve(__dirname, "../src/cli.ts");

describe("CLI", () => {
  describe("--version flag", () => {
    it("should print version number", () => {
      const output = execSync(`npx ts-node ${cliPath} --version`, {
        encoding: "utf-8",
      }).trim();
      expect(output).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe("--help flag", () => {
    it("should print help information", () => {
      const output = execSync(`npx ts-node ${cliPath} --help`, {
        encoding: "utf-8",
      });
      expect(output).toContain("Usage:");
      expect(output).toContain("Commands:");
      expect(output).toContain("start");
      expect(output).toContain("list");
      expect(output).toContain("get");
      expect(output).toContain("create");
      expect(output).toContain("delete");
    });
  });

  describe("list command", () => {
    it("should list all notes from running server", async () => {
      const res = await request(app).get("/api/notes").expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("create command", () => {
    it("should create a new note", async () => {
      const res = await request(app)
        .post("/api/notes")
        .send({ title: "Test Note", content: "Test Content", tags: ["test"] })
        .expect(201);
      expect(res.body.title).toBe("Test Note");
      expect(res.body.content).toBe("Test Content");
      expect(res.body.id).toBeDefined();
    });

    it("should reject invalid input", async () => {
      await request(app).post("/api/notes").send({}).expect(400);
    });
  });

  describe("get command", () => {
    it("should get a note by ID", async () => {
      const createRes = await request(app)
        .post("/api/notes")
        .send({ title: "Get Test", content: "Content" })
        .expect(201);

      const res = await request(app)
        .get(`/api/notes/${createRes.body.id}`)
        .expect(200);
      expect(res.body.title).toBe("Get Test");
    });

    it("should return 404 for non-existent note", async () => {
      await request(app).get("/api/notes/nonexistent").expect(404);
    });
  });

  describe("delete command", () => {
    it("should delete a note", async () => {
      const createRes = await request(app)
        .post("/api/notes")
        .send({ title: "Delete Test", content: "Content" })
        .expect(201);

      await request(app)
        .delete(`/api/notes/${createRes.body.id}`)
        .expect(204);

      await request(app).get(`/api/notes/${createRes.body.id}`).expect(404);
    });
  });
});
