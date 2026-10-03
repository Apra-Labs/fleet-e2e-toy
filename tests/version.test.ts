import { spawnSync } from "child_process";
import { resolve } from "path";

const entryPoint = resolve(__dirname, "../src/index.ts");

describe("CLI --version flag", () => {
  const timeout = 30000;

  test(
    "--version flag prints version and exits with code 0",
    () => {
      const result = spawnSync("npx", ["ts-node", entryPoint, "--version"], {
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
      const result = spawnSync("npx", ["ts-node", entryPoint, "-v"], {
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
        "npx",
        ["ts-node", entryPoint, "--foo", "--version", "--bar"],
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
    () => {
      // Use a random port to avoid conflicts from previous test runs
      const freePort = 30000 + Math.floor(Math.random() * 5000);
      const result = spawnSync(
        "npx",
        ["ts-node", entryPoint],
        {
          cwd: resolve(__dirname, ".."),
          encoding: "utf-8",
          env: {
            ...process.env,
            PORT: freePort.toString(),
          },
          timeout: 3000,
          stdio: ["ignore", "pipe", "ignore"],
        }
      );

      // Process should not exit cleanly with code 0 (indicating --version wasn't triggered)
      // When killed by timeout, signal should be SIGTERM or process runs but times out
      // Check that it didn't print the version string (which would indicate version flag worked)
      expect(result.stdout).not.toContain("fleet-e2e-toy v1.0.0");
      // And the process should have been terminated (not successful exit)
      expect(result.status).not.toBe(0);
    },
    timeout
  );
});
