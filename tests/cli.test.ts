import { spawn } from "child_process";
import path from "path";

function runCLI(args: string[], timeoutMs: number = 5000): Promise<{ stdout: string; stderr: string; exitCode: number | null }> {
  return new Promise((resolve) => {
    const child = spawn("node", ["-r", "ts-node/register", "src/index.ts", ...args], {
      cwd: path.join(__dirname, ".."),
      shell: true,
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      if (!timedOut) {
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code,
        });
      }
    });

    // Timeout - kill the process
    const timeoutHandle = setTimeout(() => {
      timedOut = true;
      child.kill();
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: null,
      });
    }, timeoutMs);

    child.on("close", () => {
      clearTimeout(timeoutHandle);
    });
  });
}

describe("CLI version flag", () => {
  it("prints version with --version flag and exits with code 0", async () => {
    const result = await runCLI(["--version"], 2000);
    expect(result.stdout).toBe("fleet-e2e-toy v1.0.0");
    expect(result.exitCode).toBe(0);
  });

  it("prints version with -v flag and exits with code 0", async () => {
    const result = await runCLI(["-v"], 2000);
    expect(result.stdout).toBe("fleet-e2e-toy v1.0.0");
    expect(result.exitCode).toBe(0);
  });
});

describe("CLI without version flag", () => {
  it("does not print version output when no version flag is provided", async () => {
    const result = await runCLI([], 1000);
    // When running without version flag, the app starts listening
    // The process will be killed by timeout (exitCode will be null)
    // The key assertion is that it doesn't print the version string
    // This verifies that the version flag doesn't interfere with normal operation
    expect(result.stdout).not.toBe("fleet-e2e-toy v1.0.0");
  });
});
