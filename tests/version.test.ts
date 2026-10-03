import { ChildProcess, spawn, spawnSync } from "child_process";
import { resolve } from "path";

const entryPoint = resolve(__dirname, "../src/index.ts");
const tsNode = resolve(__dirname, "../node_modules/.bin/ts-node");

describe("CLI --version flag", () => {
  const timeout = 30000;

  test(
    "--version flag prints version and exits with code 0",
    () => {
      const result = spawnSync(tsNode, [entryPoint, "--version"], {
        cwd: resolve(__dirname, ".."),
        encoding: "utf-8",
        timeout: 10000,
      });

      expect(result.status).toBe(0);
      expect(result.stdout?.trim()).toBe("fleet-e2e-toy v1.0.0");
    },
    timeout
  );

  test(
    "-v flag prints version and exits with code 0",
    () => {
      const result = spawnSync(tsNode, [entryPoint, "-v"], {
        cwd: resolve(__dirname, ".."),
        encoding: "utf-8",
        timeout: 10000,
      });

      expect(result.status).toBe(0);
      expect(result.stdout?.trim()).toBe("fleet-e2e-toy v1.0.0");
    },
    timeout
  );

  test(
    "--version flag works with other argv tokens",
    () => {
      const result = spawnSync(
        tsNode,
        [entryPoint, "--foo", "--version", "--bar"],
        {
          cwd: resolve(__dirname, ".."),
          encoding: "utf-8",
          timeout: 10000,
        }
      );

      expect(result.status).toBe(0);
      expect(result.stdout?.trim()).toBe("fleet-e2e-toy v1.0.0");
    },
    timeout
  );

  test(
    "without version flag, process starts server and does not exit immediately",
    async () => {
      // Use a fixed port as suggested in the bead
      const freePort = 3055;
      const repoRoot = resolve(__dirname, "..");
      let childProcess: ChildProcess | null = null;
      let stdout = "";

      return new Promise<void>((resolvePromise, reject) => {
        childProcess = spawn(tsNode, [entryPoint], {
          cwd: repoRoot,
          detached: true,
          stdio: ["ignore", "pipe", "ignore"],
          env: {
            ...process.env,
            PORT: freePort.toString(),
          },
        });

        const timeoutId = setTimeout(() => {
          // If we got here, the process didn't exit immediately and (hopefully) printed the startup message
          if (childProcess && childProcess.pid) {
            // Kill the whole process group using negative PID
            try {
              process.kill(-childProcess.pid, "SIGTERM");
            } catch {
              // Process might already be dead
            }
          }
        }, 1000);

        childProcess.stdout?.on("data", (data: Buffer) => {
          stdout += data.toString();
          if (stdout.includes("NoteAPI running")) {
            clearTimeout(timeoutId);
            // Now kill it
            if (childProcess && childProcess.pid) {
              try {
                process.kill(-childProcess.pid, "SIGTERM");
              } catch {
                // Process might already be dead
              }
            }
          }
        });

        childProcess.on("exit", (code: number | null, signal: string | null) => {
          clearTimeout(timeoutId);

          // Assertions
          try {
            // Check that it didn't print the version string
            expect(stdout).not.toContain("fleet-e2e-toy v1.0.0");
            // Either the server started and we killed it, or it was killed by timeout
            // The important thing is the exit code should not be 0 (which would indicate --version)
            expect(code).not.toBe(0);
            // Process should have been killed by signal
            expect(signal).toBeTruthy();
            resolvePromise();
          } catch (err) {
            reject(err);
          }
        });

        childProcess.on("error", (err: Error) => {
          clearTimeout(timeoutId);
          reject(err);
        });
      });
    },
    timeout
  );
});
