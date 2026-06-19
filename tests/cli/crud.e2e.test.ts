import { spawnSync, spawn, ChildProcess } from "child_process";
import * as net from "net";
import * as path from "path";

const isWindows = process.platform === "win32";
const tsNodeBin = isWindows ? "ts-node.cmd" : "ts-node";
const tsNode = path.resolve(
  __dirname,
  "../../node_modules/.bin",
  tsNodeBin
);
const cliEntry = path.resolve(__dirname, "../../src/cli/index.ts");
const serverEntry = path.resolve(__dirname, "../../src/index.ts");
const cwd = path.resolve(__dirname, "../..");

let serverProcess: ChildProcess;
let serverPort: number;
let baseUrl: string;

function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (!addr || typeof addr === "string") {
        reject(new Error("Could not get port"));
        return;
      }
      const port = addr.port;
      server.close(() => resolve(port));
    });
  });
}

function waitForServer(url: string, maxMs = 15000): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function check() {
      fetch(`${url}/health`)
        .then((r) => {
          if (r.ok) resolve();
          else retry();
        })
        .catch(() => retry());
    }
    function retry() {
      if (Date.now() - start > maxMs) {
        reject(new Error(`Server did not start within ${maxMs}ms`));
      } else {
        setTimeout(check, 200);
      }
    }
    check();
  });
}

beforeAll(async () => {
  serverPort = await findFreePort();
  baseUrl = `http://127.0.0.1:${serverPort}`;

  serverProcess = spawn(tsNode, [serverEntry], {
    cwd,
    shell: true,
    env: { ...process.env, PORT: String(serverPort) },
    stdio: "pipe",
  });

  await waitForServer(baseUrl);
}, 30000);

afterAll(async () => {
  if (serverProcess) {
    await new Promise<void>((resolve) => {
      serverProcess.on("exit", () => resolve());
      serverProcess.on("error", () => resolve());
      serverProcess.kill("SIGKILL");
      setTimeout(resolve, 3000);
    });
  }
});

function runCli(
  args: string[]
): { stdout: string; stderr: string; status: number | null } {
  const result = spawnSync(tsNode, [cliEntry, ...args], {
    cwd,
    encoding: "utf-8",
    shell: true,
    env: { ...process.env, NOTEAPI_URL: baseUrl },
    timeout: 15000,
  });
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    status: result.status,
  };
}

describe("CLI CRUD end-to-end lifecycle", () => {
  it("full CRUD lifecycle: create, list, read, update, delete", () => {
    // Use values without spaces to avoid shell quoting issues on Windows
    const testTitle = "E2ETestNote";
    const testContent = "E2EContentBody";
    const testTag = "e2e";
    const updatedTitle = "UpdatedTitle";

    // Step 1: create a note
    const create = runCli([
      "create",
      `--title=${testTitle}`,
      `--content=${testContent}`,
      `--tag=${testTag}`,
    ]);
    expect(create.stderr).toBe("");
    expect(create.status).toBe(0);
    const noteId = create.stdout.trim();
    expect(noteId).toBeTruthy();

    // Step 2: list and assert the note appears
    const list = runCli(["list"]);
    expect(list.status).toBe(0);
    expect(list.stdout).toContain(noteId);
    expect(list.stdout).toContain(testTitle);

    // Step 3: list with --tag filter — should find it
    const listByTag = runCli(["list", `--tag=${testTag}`]);
    expect(listByTag.status).toBe(0);
    expect(listByTag.stdout).toContain(noteId);

    // Step 4: list with --tag filter that doesn't match — should be empty
    const listByWrongTag = runCli(["list", "--tag=nonexistent-tag"]);
    expect(listByWrongTag.status).toBe(0);
    expect(listByWrongTag.stdout.trim()).toBe("");

    // Step 5: list with --q search filter
    const listByQ = runCli(["list", `--q=${testTitle}`]);
    expect(listByQ.status).toBe(0);
    expect(listByQ.stdout).toContain(noteId);

    // Step 6: list with --q search that doesn't match — should be empty
    const listByWrongQ = runCli(["list", "--q=no-match-xyz"]);
    expect(listByWrongQ.status).toBe(0);
    expect(listByWrongQ.stdout.trim()).toBe("");

    // Step 7: read the note by id
    const read = runCli(["read", `--id=${noteId}`]);
    expect(read.status).toBe(0);
    expect(read.stdout).toContain(`id: ${noteId}`);
    expect(read.stdout).toContain(`title: ${testTitle}`);
    expect(read.stdout).toContain(`content: ${testContent}`);
    expect(read.stdout).toContain(testTag);

    // Step 8: update the note
    const update = runCli([
      "update",
      `--id=${noteId}`,
      `--title=${updatedTitle}`,
    ]);
    expect(update.status).toBe(0);
    expect(update.stdout).toContain(`title: ${updatedTitle}`);
    expect(update.stdout).toContain(`content: ${testContent}`);

    // Step 9: read again to confirm update persisted
    const readAfterUpdate = runCli(["read", `--id=${noteId}`]);
    expect(readAfterUpdate.status).toBe(0);
    expect(readAfterUpdate.stdout).toContain(`title: ${updatedTitle}`);

    // Step 10: delete the note
    const del = runCli(["delete", `--id=${noteId}`]);
    expect(del.status).toBe(0);
    expect(del.stdout).toContain(noteId);

    // Step 11: read after delete should fail with 'Note not found'
    const readAfterDelete = runCli(["read", `--id=${noteId}`]);
    expect(readAfterDelete.status).not.toBe(0);
    expect(readAfterDelete.stderr).toContain("Note not found");
  }, 120000);
});

describe("CLI exit codes on errors", () => {
  it("read with blank --id exits non-zero and prints error to stderr", () => {
    const result = runCli(["read", "--id="]);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("--id");
  });

  it("create with blank --title exits non-zero", () => {
    const result = runCli(["create", "--title=", "--content=some content"]);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("--title");
  });

  it("create with whitespace-only --content exits non-zero", () => {
    const result = runCli(["create", "--title=A Title", "--content=   "]);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("--content");
  });

  it("update with blank --id exits non-zero", () => {
    const result = runCli(["update", "--id=", "--title=New Title"]);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("--id");
  });

  it("delete with blank --id exits non-zero", () => {
    const result = runCli(["delete", "--id="]);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("--id");
  });

  it("read non-existent note exits non-zero with 'Note not found'", () => {
    const result = runCli(["read", "--id=non-existent-id-xyz"]);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Note not found");
  });
});
