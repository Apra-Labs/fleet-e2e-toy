import { spawn, ChildProcess } from "child_process";
import { resolve } from "path";

const TS_NODE = resolve(__dirname, "..", "node_modules", "ts-node", "dist", "bin.js");
const INDEX_SRC = resolve(__dirname, "..", "src", "index.ts");
const VERSION_OUTPUT = "fleet-e2e-toy v1.0.0";
const PORT = 3097;
const SPAWN_TIMEOUT = 10_000;
const SERVER_WAIT_TIMEOUT = 15_000;

/**
 * Spawn ts-node with the given args. Returns { proc, killAll } where killAll
 * always terminates the process and kills any spawned grandchildren.
 */
function spawnIndex(args: string[] = []): { proc: ChildProcess; killAll: () => void } {
  const proc = spawn("node", [TS_NODE, INDEX_SRC, ...args], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: ["ignore", "pipe", "pipe"],
    detached: false,
  });

  const killAll = (): void => {
    if (proc.exitCode === null && proc.killed === false) {
      if (process.platform === "win32") {
        // Windows: kill the process group via taskkill
        spawn("taskkill", ["/F", "/T", "/PID", String(proc.pid)], {
          stdio: "ignore",
        });
      } else {
        process.kill(-proc.pid!, "SIGTERM");
      }
      // Force kill after a short delay
      setTimeout(() => {
        try {
          if (proc.pid) {
            if (process.platform === "win32") {
              spawn("taskkill", ["/F", "/T", "/PID", String(proc.pid)], {
                stdio: "ignore",
              });
            } else {
              process.kill(-proc.pid!, "SIGKILL");
            }
          }
        } catch {
          // Process already dead
        }
      }, 1000).unref();
    }
  };

  return { proc, killAll };
}

describe("--version and -v flags", () => {
  afterEach((): void => {
    // Kill any remaining processes from previous tests
    // (each test creates its own process, but safety net)
  });

  test("--version prints version and exits 0", (done) => {
    const { proc, killAll } = spawnIndex(["--version"]);
    let output = "";

    proc.stdout!.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });

    proc.on("exit", (code) => {
      try {
        expect(output.trim()).toBe(VERSION_OUTPUT);
        expect(code).toBe(0);
      } finally {
        killAll();
        done();
      }
    });

    proc.on("error", (err) => {
      killAll();
      done(err);
    });

    // Timeout: if the process hangs, fail the test
    const timer = setTimeout(() => {
      killAll();
      done(new Error("--version did not exit within timeout"));
    }, SPAWN_TIMEOUT);
    timer.unref();
  });

  test("-v prints version and exits 0", (done) => {
    const { proc, killAll } = spawnIndex(["-v"]);
    let output = "";

    proc.stdout!.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });

    proc.on("exit", (code) => {
      try {
        expect(output.trim()).toBe(VERSION_OUTPUT);
        expect(code).toBe(0);
      } finally {
        killAll();
        done();
      }
    });

    proc.on("error", (err) => {
      killAll();
      done(err);
    });

    const timer = setTimeout(() => {
      killAll();
      done(new Error("-v did not exit within timeout"));
    }, SPAWN_TIMEOUT);
    timer.unref();
  });

  test("--foo --version prints version and exits 0", (done) => {
    const { proc, killAll } = spawnIndex(["--foo", "--version"]);
    let output = "";

    proc.stdout!.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });

    proc.on("exit", (code) => {
      try {
        expect(output.trim()).toBe(VERSION_OUTPUT);
        expect(code).toBe(0);
      } finally {
        killAll();
        done();
      }
    });

    proc.on("error", (err) => {
      killAll();
      done(err);
    });

    const timer = setTimeout(() => {
      killAll();
      done(new Error("--foo --version did not exit within timeout"));
    }, SPAWN_TIMEOUT);
    timer.unref();
  });

  test("-v --foo prints version and exits 0", (done) => {
    const { proc, killAll } = spawnIndex(["-v", "--foo"]);
    let output = "";

    proc.stdout!.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });

    proc.on("exit", (code) => {
      try {
        expect(output.trim()).toBe(VERSION_OUTPUT);
        expect(code).toBe(0);
      } finally {
        killAll();
        done();
      }
    });

    proc.on("error", (err) => {
      killAll();
      done(err);
    });

    const timer = setTimeout(() => {
      killAll();
      done(new Error("-v --foo did not exit within timeout"));
    }, SPAWN_TIMEOUT);
    timer.unref();
  });
});

describe("no flag: server starts", () => {
  test(
    "spawns the server and prints 'NoteAPI running'",
    (done) => {
      const { proc, killAll } = spawnIndex();
      let stdout = "";
      let found = false;

      proc.stdout!.on("data", (chunk: Buffer) => {
        stdout += chunk.toString();
        if (stdout.includes("NoteAPI running") && !found) {
          found = true;
        }
      });

      proc.on("exit", (code) => {
        killAll();
        if (found) {
          done();
        } else {
          done(new Error(`Server exited without printing 'NoteAPI running'. Exit code: ${code}, stdout: ${stdout}`));
        }
      });

      proc.on("error", (err) => {
        killAll();
        done(err);
      });

      // Wait for the server to start printing "NoteAPI running"
      const startTime = Date.now();
      const waitTimer = setInterval(() => {
        if (found) {
          clearInterval(waitTimer);
          killAll();
          done();
          return;
        }
        if (Date.now() - startTime >= SERVER_WAIT_TIMEOUT) {
          clearInterval(waitTimer);
          killAll();
          done(new Error(`Server did not print 'NoteAPI running' within ${SERVER_WAIT_TIMEOUT}ms`));
        }
      }, 200);
    },
    20000
  );
});
