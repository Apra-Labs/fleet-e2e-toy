import { exec } from "child_process";
import app from "../src/app";
import { noteStore } from "../src/models/note";
import { Server } from "http";
import path from "path";
import { v4 as uuidv4 } from "uuid";

let server: Server;
let apiUrl: string;
let port: number;

beforeAll((done) => {
  server = app.listen(0, () => {
    const address = server.address();
    if (address && typeof address !== "string") {
      port = address.port;
      apiUrl = `http://localhost:${port}/api/notes`;
    }
    done();
  });
});

afterAll((done) => {
  server.close(done);
});

beforeEach(() => {
  noteStore.clear();
});

const runCli = (args: string): Promise<{ stdout: string; stderr: string }> => {
  return new Promise((resolve, reject) => {
    const cliPath = path.resolve(__dirname, "../src/cli.ts");
    // Use ts-node directly from node_modules for cross-platform compatibility
    const tsNode = path.resolve(__dirname, "../node_modules/.bin/ts-node");
    exec(`"${tsNode}" "${cliPath}" ${args}`, { env: { ...process.env, API_URL: apiUrl } }, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
};

describe("CLI Integration Tests", () => {
  it("should create a note", async () => {
    const { stdout } = await runCli(`create --title "CLI Title" --content "CLI Content"`);
    const note = JSON.parse(stdout);
    expect(note.id).toBeDefined();
    expect(note.title).toBe("CLI Title");
    
    const notes = noteStore.getAll();
    expect(notes).toHaveLength(1);
    expect(notes[0].title).toBe("CLI Title");
  });

  it("should update a note", async () => {
    const id = uuidv4();
    noteStore.create({ 
        id, 
        title: "Old Title", 
        content: "Old Content", 
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    
    const { stdout } = await runCli(`update --id ${id} --title "New Title"`);
    const note = JSON.parse(stdout);
    expect(note.title).toBe("New Title");
    
    const updatedNote = noteStore.getById(id);
    expect(updatedNote?.title).toBe("New Title");
    expect(updatedNote?.content).toBe("Old Content");
  });

  it("should delete a note", async () => {
    const id = uuidv4();
    noteStore.create({ 
        id, 
        title: "Delete Me", 
        content: "To be deleted", 
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    
    const { stdout } = await runCli(`delete --id ${id}`);
    expect(stdout).toContain(`Deleted note ${id}`);
    
    const notes = noteStore.getAll();
    expect(notes).toHaveLength(0);
  });

  it("should fail to create without title or content", async () => {
    try {
      await runCli(`create --title "Only Title"`);
      fail("Should have failed");
    } catch (e: any) {
      expect(e.stderr).toContain("Error: --title and --content are required for create.");
    }
  });

  it("should fail to update without id", async () => {
    try {
      await runCli(`update --title "New Title"`);
      fail("Should have failed");
    } catch (e: any) {
      expect(e.stderr).toContain("Error: --id is required for update.");
    }
  });

  it("should fail to delete without id", async () => {
    try {
      await runCli(`delete`);
      fail("Should have failed");
    } catch (e: any) {
      expect(e.stderr).toContain("Error: --id is required for delete.");
    }
  });
});
