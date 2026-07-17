import { main } from "../src/tool";
import { spawnSync, spawn, ChildProcess } from "child_process";
import * as path from "path";
import * as http from "http";


beforeAll(() => {
  jest.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));
});

describe("CLI version flag unit tests", () => {
  let logSpy: jest.SpyInstance;
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit");
    });
  });

  afterEach(() => {
    logSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it("should print version and exit 0 for --version", () => {
    expect(() => main(["--version"])).toThrow("process.exit");
    expect(logSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0");
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it("should print version and exit 0 for -v", () => {
    expect(() => main(["-v"])).toThrow("process.exit");
    expect(logSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0");
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it("should print version and exit 0 if --version is alongside other arguments", () => {
    expect(() => main(["list", "--version"])).toThrow("process.exit");
    expect(logSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0");
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it("should print version and exit 0 if -v is alongside other arguments", () => {
    expect(() => main(["list", "-v", "--tag", "work"])).toThrow("process.exit");
    expect(logSpy).toHaveBeenCalledWith("fleet-e2e-toy v1.0.0");
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it("should do nothing (no log, no exit) if no version flag is specified", () => {
    main(["list"]);
    expect(logSpy).not.toHaveBeenCalled();
    expect(exitSpy).not.toHaveBeenCalled();
  });
});

describe("CLI help flag unit tests", () => {
  let logSpy: jest.SpyInstance;
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit");
    });
  });

  afterEach(() => {
    logSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it("should print global help and exit 0 for --help", () => {
    expect(() => main(["--help"])).toThrow("process.exit");
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: noteapi-cli [options] [command]"));
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it("should print global help and exit 0 for -h", () => {
    expect(() => main(["-h"])).toThrow("process.exit");
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: noteapi-cli [options] [command]"));
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it("should print list subcommand help and exit 0 for list --help", () => {
    expect(() => main(["list", "--help"])).toThrow("process.exit");
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: noteapi-cli list [options]"));
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it("should print read subcommand help and exit 0 for read -h", () => {
    expect(() => main(["read", "-h"])).toThrow("process.exit");
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: noteapi-cli read <id> [options]"));
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it("should print create subcommand help and exit 0 for create --help", () => {
    expect(() => main(["create", "--help"])).toThrow("process.exit");
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Usage: noteapi-cli create <title> [content] [options]"));
    expect(exitSpy).toHaveBeenCalledWith(0);
  });
});

describe("CLI argument validation unit tests", () => {
  let errorSpy: jest.SpyInstance;
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit");
    });
  });

  afterEach(() => {
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it("should fail validation and exit 1 for empty string argument", () => {
    expect(() => main(["list", ""])).toThrow("process.exit");
    expect(errorSpy).toHaveBeenCalledWith("Error: Argument cannot be empty or whitespace-only.");
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("should fail validation and exit 1 for whitespace-only argument", () => {
    expect(() => main(["create", "   "])).toThrow("process.exit");
    expect(errorSpy).toHaveBeenCalledWith("Error: Argument cannot be empty or whitespace-only.");
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});

describe("CLI integration tests", () => {
  const toolCmd = path.join(__dirname, "../tool");

  it("executes ./tool -v successfully", () => {
    const res = spawnSync(toolCmd, ["-v"], { encoding: "utf-8" });
    expect(res.status).toBe(0);
    expect(res.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("executes ./tool --version successfully", () => {
    const res = spawnSync(toolCmd, ["--version"], { encoding: "utf-8" });
    expect(res.status).toBe(0);
    expect(res.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("executes ./tool list --version successfully", () => {
    const res = spawnSync(toolCmd, ["list", "--version"], { encoding: "utf-8" });
    expect(res.status).toBe(0);
    expect(res.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("executes ./tool create \"some note\" -v successfully", () => {
    const res = spawnSync(toolCmd, ["create", "some note", "-v"], { encoding: "utf-8" });
    expect(res.status).toBe(0);
    expect(res.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("executes ./tool --help successfully", () => {
    const res = spawnSync(toolCmd, ["--help"], { encoding: "utf-8" });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("Usage: noteapi-cli [options] [command]");
  });

  it("executes ./tool -h successfully", () => {
    const res = spawnSync(toolCmd, ["-h"], { encoding: "utf-8" });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("Usage: noteapi-cli [options] [command]");
  });

  it("executes ./tool list --help successfully", () => {
    const res = spawnSync(toolCmd, ["list", "--help"], { encoding: "utf-8" });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("Usage: noteapi-cli list [options]");
  });

  it("executes ./tool read -h successfully", () => {
    const res = spawnSync(toolCmd, ["read", "-h"], { encoding: "utf-8" });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("Usage: noteapi-cli read <id> [options]");
  });

  it("executes ./tool create --help successfully", () => {
    const res = spawnSync(toolCmd, ["create", "--help"], { encoding: "utf-8" });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("Usage: noteapi-cli create <title> [content] [options]");
  });

  it("executes ./tool update -h successfully", () => {
    const res = spawnSync(toolCmd, ["update", "-h"], { encoding: "utf-8" });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("Usage: noteapi-cli update <id> [options]");
  });

  it("executes ./tool delete -h successfully", () => {
    const res = spawnSync(toolCmd, ["delete", "-h"], { encoding: "utf-8" });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("Usage: noteapi-cli delete <id> [options]");
  });

  it("fails when passed an empty argument", () => {
    const res = spawnSync(toolCmd, ["list", ""], { encoding: "utf-8" });
    expect(res.status).not.toBe(0);
    expect(res.stderr).toContain("Error: Argument cannot be empty or whitespace-only.");
    expect(res.stderr).not.toContain("at ");
    expect(res.stderr).not.toContain("tool.ts");
  });

  it("fails when passed a whitespace-only argument", () => {
    const res = spawnSync(toolCmd, ["create", "   "], { encoding: "utf-8" });
    expect(res.status).not.toBe(0);
    expect(res.stderr).toContain("Error: Argument cannot be empty or whitespace-only.");
    expect(res.stderr).not.toContain("at ");
    expect(res.stderr).not.toContain("tool.ts");
  });

  it("fails validation for missing subcommand", () => {
    const res = spawnSync(toolCmd, [], { encoding: "utf-8" });
    expect(res.status).not.toBe(0);
    expect(res.stderr).toContain("Error: Subcommand is required.");
    expect(res.stderr).not.toContain("at ");
    expect(res.stderr).not.toContain("tool.ts");
  });

  it("fails validation for unknown subcommand", () => {
    const res = spawnSync(toolCmd, ["unknowncmd"], { encoding: "utf-8" });
    expect(res.status).not.toBe(0);
    expect(res.stderr).toContain("Error: Unknown subcommand: unknowncmd");
    expect(res.stderr).not.toContain("at ");
    expect(res.stderr).not.toContain("tool.ts");
  });

  it("fails validation for read command without ID", () => {
    const res = spawnSync(toolCmd, ["read"], { encoding: "utf-8" });
    expect(res.status).not.toBe(0);
    expect(res.stderr).toContain("Error: ID is required.");
    expect(res.stderr).not.toContain("at ");
    expect(res.stderr).not.toContain("tool.ts");
  });

  it("fails validation for create command without title", () => {
    const res = spawnSync(toolCmd, ["create"], { encoding: "utf-8" });
    expect(res.status).not.toBe(0);
    expect(res.stderr).toContain("Error: Title is required.");
    expect(res.stderr).not.toContain("at ");
    expect(res.stderr).not.toContain("tool.ts");
  });

  it("fails validation for update command without ID", () => {
    const res = spawnSync(toolCmd, ["update"], { encoding: "utf-8" });
    expect(res.status).not.toBe(0);
    expect(res.stderr).toContain("Error: ID is required.");
    expect(res.stderr).not.toContain("at ");
    expect(res.stderr).not.toContain("tool.ts");
  });

  it("fails validation for delete command without ID", () => {
    const res = spawnSync(toolCmd, ["delete"], { encoding: "utf-8" });
    expect(res.status).not.toBe(0);
    expect(res.stderr).toContain("Error: ID is required.");
    expect(res.stderr).not.toContain("at ");
    expect(res.stderr).not.toContain("tool.ts");
  });

  describe("CLI CRUD integration tests with real server", () => {
    let serverProcess: ChildProcess;
    let port: number;

    const checkHealth = (p: number): Promise<boolean> => {
      return new Promise((resolve) => {
        const req = http.get(`http://localhost:${p}/health`, (res) => {
          resolve(res.statusCode === 200);
        });
        req.on("error", () => {
          resolve(false);
        });
        req.end();
      });
    };

    const getFreePort = (): Promise<number> => {
      return new Promise((resolve, reject) => {
        const s = http.createServer();
        s.listen(0, () => {
          const address = s.address();
          const p = address && typeof address !== "string" ? address.port : 3001;
          s.close(() => {
            resolve(p);
          });
        });
        s.on("error", reject);
      });
    };

    beforeAll(async () => {
      port = await getFreePort();
      serverProcess = spawn("node", ["-r", "ts-node/register", "src/index.ts"], {
        env: { ...process.env, PORT: String(port) }
      });

      // Wait for health check (retry up to 20 times, 100ms apart)
      let ok = false;
      for (let i = 0; i < 20; i++) {
        ok = await checkHealth(port);
        if (ok) {
          ok = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (!ok) {
        throw new Error(`Server failed to start on port ${port}`);
      }
    }, 10000); // 10s timeout

    afterAll(() => {
      if (serverProcess) {
        serverProcess.kill("SIGTERM");
      }
    });

    it("performs complete CRUD lifecycle successfully", () => {
      // 1. List (empty)
      const listRes1 = spawnSync(toolCmd, ["list"], {
        encoding: "utf-8",
        env: { ...process.env, PORT: String(port) }
      });
      expect(listRes1.status).toBe(0);
      const list1 = JSON.parse(listRes1.stdout);
      expect(list1).toEqual([]);

      // 2. Create note 1
      const createRes1 = spawnSync(toolCmd, ["create", "Note One", "Content for one", "--tag", "work", "--tag", "urgent"], {
        encoding: "utf-8",
        env: { ...process.env, PORT: String(port) }
      });
      expect(createRes1.status).toBe(0);
      const note1 = JSON.parse(createRes1.stdout);
      expect(note1.title).toBe("Note One");
      expect(note1.content).toBe("Content for one");
      expect(note1.tags).toEqual(["work", "urgent"]);
      expect(note1.id).toBeDefined();

      // 3. Create note 2
      const createRes2 = spawnSync(toolCmd, ["create", "Note Two", "Content for two", "-t", "personal"], {
        encoding: "utf-8",
        env: { ...process.env, PORT: String(port) }
      });
      expect(createRes2.status).toBe(0);
      const note2 = JSON.parse(createRes2.stdout);
      expect(note2.title).toBe("Note Two");
      expect(note2.content).toBe("Content for two");
      expect(note2.tags).toEqual(["personal"]);

      // 4. List (all)
      const listRes2 = spawnSync(toolCmd, ["list"], {
        encoding: "utf-8",
        env: { ...process.env, PORT: String(port) }
      });
      expect(listRes2.status).toBe(0);
      const list2 = JSON.parse(listRes2.stdout);
      expect(list2.length).toBe(2);
      expect(list2.map((n: { title: string }) => n.title)).toContain("Note One");
      expect(list2.map((n: { title: string }) => n.title)).toContain("Note Two");

      // 5. List with tag filter
      const listResTag = spawnSync(toolCmd, ["list", "--tag", "work"], {
        encoding: "utf-8",
        env: { ...process.env, PORT: String(port) }
      });
      expect(listResTag.status).toBe(0);
      const listTag = JSON.parse(listResTag.stdout);
      expect(listTag.length).toBe(1);
      expect(listTag[0].title).toBe("Note One");

      // 6. List with query search
      const listResQuery = spawnSync(toolCmd, ["list", "--query", "Two"], {
        encoding: "utf-8",
        env: { ...process.env, PORT: String(port) }
      });
      expect(listResQuery.status).toBe(0);
      const listQuery = JSON.parse(listResQuery.stdout);
      expect(listQuery.length).toBe(1);
      expect(listQuery[0].title).toBe("Note Two");

      // 7. Read existing note
      const readRes1 = spawnSync(toolCmd, ["read", note1.id], {
        encoding: "utf-8",
        env: { ...process.env, PORT: String(port) }
      });
      expect(readRes1.status).toBe(0);
      const readNote1 = JSON.parse(readRes1.stdout);
      expect(readNote1.id).toBe(note1.id);
      expect(readNote1.title).toBe("Note One");

      // 8. Update existing note
      const updateRes = spawnSync(
        toolCmd,
        ["update", note1.id, "--title", "Updated Note One", "--content", "Updated content", "--tag", "archive"],
        {
          encoding: "utf-8",
          env: { ...process.env, PORT: String(port) }
        }
      );
      expect(updateRes.status).toBe(0);
      const updatedNote = JSON.parse(updateRes.stdout);
      expect(updatedNote.id).toBe(note1.id);
      expect(updatedNote.title).toBe("Updated Note One");
      expect(updatedNote.content).toBe("Updated content");
      expect(updatedNote.tags).toEqual(["archive"]);

      // Verify update persisted
      const readRes2 = spawnSync(toolCmd, ["read", note1.id], {
        encoding: "utf-8",
        env: { ...process.env, PORT: String(port) }
      });
      expect(readRes2.status).toBe(0);
      const readNote2 = JSON.parse(readRes2.stdout);
      expect(readNote2.title).toBe("Updated Note One");

      // 9. Delete note
      const deleteRes = spawnSync(toolCmd, ["delete", note1.id], {
        encoding: "utf-8",
        env: { ...process.env, PORT: String(port) }
      });
      expect(deleteRes.status).toBe(0);

      // Verify note is deleted
      const readResDeleted = spawnSync(toolCmd, ["read", note1.id], {
        encoding: "utf-8",
        env: { ...process.env, PORT: String(port) }
      });
      expect(readResDeleted.status).toBe(1);
      const errorData = JSON.parse(readResDeleted.stderr);
      expect(errorData.error).toBe("Note not found");
    });

    it("returns non-zero exit code on API errors for all operations", () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      // Read non-existent
      const readRes = spawnSync(toolCmd, ["read", nonExistentId], {
        encoding: "utf-8",
        env: { ...process.env, PORT: String(port) }
      });
      expect(readRes.status).not.toBe(0);
      expect(JSON.parse(readRes.stderr).error).toBe("Note not found");

      // Update non-existent
      const updateRes = spawnSync(toolCmd, ["update", nonExistentId, "--title", "test"], {
        encoding: "utf-8",
        env: { ...process.env, PORT: String(port) }
      });
      expect(updateRes.status).not.toBe(0);
      expect(JSON.parse(updateRes.stderr).error).toBe("Note not found");

      // Delete non-existent
      const deleteRes = spawnSync(toolCmd, ["delete", nonExistentId], {
        encoding: "utf-8",
        env: { ...process.env, PORT: String(port) }
      });
      expect(deleteRes.status).not.toBe(0);
      expect(JSON.parse(deleteRes.stderr).error).toBe("Note not found");
    });
  });
});


