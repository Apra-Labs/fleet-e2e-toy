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

describe("CLI rejects blank required flags", () => {
  describe("create --title validation", () => {
    it("blank --title exits non-zero", () => {
      const { status } = runCli(["create", "--title=", "--content=x"]);
      expect(status).not.toBe(0);
    });

    it("blank --title prints 'Error: --title must not be empty' to stderr", () => {
      const { stderr } = runCli(["create", "--title=", "--content=x"]);
      expect(stderr).toContain("Error: --title must not be empty");
    });

    it("blank --title has no stack trace", () => {
      const { stderr } = runCli(["create", "--title=", "--content=x"]);
      expect(stderr).not.toMatch(/\bat /);
    });

    it("whitespace-only --title exits non-zero", () => {
      const { status } = runCli(["create", "--title=   ", "--content=x"]);
      expect(status).not.toBe(0);
    });

    it("whitespace-only --title prints 'Error: --title must not be empty' to stderr", () => {
      const { stderr } = runCli(["create", "--title=   ", "--content=x"]);
      expect(stderr).toContain("Error: --title must not be empty");
    });
  });

  describe("create --content validation", () => {
    it("blank --content exits non-zero", () => {
      const { status } = runCli(["create", "--title=MyTitle", "--content="]);
      expect(status).not.toBe(0);
    });

    it("blank --content prints 'Error: --content must not be empty' to stderr", () => {
      const { stderr } = runCli(["create", "--title=MyTitle", "--content="]);
      expect(stderr).toContain("Error: --content must not be empty");
    });

    it("blank --content has no stack trace", () => {
      const { stderr } = runCli(["create", "--title=MyTitle", "--content="]);
      expect(stderr).not.toMatch(/\bat /);
    });
  });

  describe("read --id validation", () => {
    it("blank --id on read exits non-zero", () => {
      const { status } = runCli(["read", "--id="]);
      expect(status).not.toBe(0);
    });

    it("blank --id on read prints error about --id to stderr", () => {
      const { stderr } = runCli(["read", "--id="]);
      expect(stderr).toContain("--id");
      expect(stderr).toContain("must not be empty");
    });

    it("blank --id on read has no stack trace", () => {
      const { stderr } = runCli(["read", "--id="]);
      expect(stderr).not.toMatch(/\bat /);
    });
  });

  describe("update --id validation", () => {
    it("blank --id on update exits non-zero", () => {
      const { status } = runCli(["update", "--id=", "--title=x"]);
      expect(status).not.toBe(0);
    });

    it("blank --id on update prints error about --id to stderr", () => {
      const { stderr } = runCli(["update", "--id=", "--title=x"]);
      expect(stderr).toContain("--id");
      expect(stderr).toContain("must not be empty");
    });

    it("blank --id on update has no stack trace", () => {
      const { stderr } = runCli(["update", "--id=", "--title=x"]);
      expect(stderr).not.toMatch(/\bat /);
    });
  });

  describe("delete --id validation", () => {
    it("blank --id on delete exits non-zero", () => {
      const { status } = runCli(["delete", "--id="]);
      expect(status).not.toBe(0);
    });

    it("blank --id on delete prints error about --id to stderr", () => {
      const { stderr } = runCli(["delete", "--id="]);
      expect(stderr).toContain("--id");
      expect(stderr).toContain("must not be empty");
    });

    it("blank --id on delete has no stack trace", () => {
      const { stderr } = runCli(["delete", "--id="]);
      expect(stderr).not.toMatch(/\bat /);
    });
  });

  describe("control: valid inputs do NOT trigger validation error", () => {
    it("non-blank --title and --content does not produce validation error (exits 0 or network error, not validation)", () => {
      // With a running server, this should succeed (exit 0)
      const { stderr, status } = runCli([
        "create",
        "--title=ValidTitle",
        "--content=ValidContent",
      ]);
      expect(status).toBe(0);
      expect(stderr).not.toContain("must not be empty");
    });

    it("non-blank --id on read does not produce validation error", () => {
      // Create a note first to read
      const create = runCli([
        "create",
        "--title=ControlNote",
        "--content=ControlContent",
      ]);
      expect(create.status).toBe(0);
      const noteId = create.stdout.trim();

      const { stderr } = runCli(["read", `--id=${noteId}`]);
      expect(stderr).not.toContain("must not be empty");
    });
  });
});
