import { exec } from "child_process";
import * as path from "path";

jest.setTimeout(20000);

const cliScript = path.resolve(__dirname, "../src/cli.ts");

function runCli(args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    // For executing in terminal, quote each argument.
    // Replace double quotes inside the arg with escaped double quotes.
    const escapedArgs = args.map(arg => {
      const escaped = arg.replace(/"/g, '\\"');
      return `"${escaped}"`;
    }).join(" ");

    const cmd = `npx ts-node "${cliScript}" ${escapedArgs}`;

    exec(cmd, (error, stdout, stderr) => {
      resolve({
        code: error ? (error.code ?? 1) : 0,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      });
    });
  });
}

describe("CLI Tool", () => {
  describe("Version Flags", () => {
    it("should print version and exit 0 for --version", async () => {
      const result = await runCli(["--version"]);
      expect(result.code).toBe(0);
      expect(result.stdout).toBe("fleet-e2e-toy v1.0.0");
      expect(result.stderr).toBe("");
    });

    it("should print version and exit 0 for -v", async () => {
      const result = await runCli(["-v"]);
      expect(result.code).toBe(0);
      expect(result.stdout).toBe("fleet-e2e-toy v1.0.0");
      expect(result.stderr).toBe("");
    });
  });

  describe("Help Commands", () => {
    const expectedHelpText = 
      "Usage: fleet-e2e-toy [command] [options]\n\n" +
      "Commands:\n" +
      "  add <title>      Add a new note\n" +
      "  serve            Start the API server\n" +
      "  help             Show this help message\n\n" +
      "Options:\n" +
      "  --version, -v    Show version information\n" +
      "  --help, -h       Show this help message";

    it("should print help and exit 0 for help command", async () => {
      const result = await runCli(["help"]);
      expect(result.code).toBe(0);
      expect(result.stdout).toBe(expectedHelpText);
      expect(result.stderr).toBe("");
    });

    it("should print help and exit 0 for --help flag", async () => {
      const result = await runCli(["--help"]);
      expect(result.code).toBe(0);
      expect(result.stdout).toBe(expectedHelpText);
      expect(result.stderr).toBe("");
    });

    it("should print help and exit 0 for -h flag", async () => {
      const result = await runCli(["-h"]);
      expect(result.code).toBe(0);
      expect(result.stdout).toBe(expectedHelpText);
      expect(result.stderr).toBe("");
    });
  });

  describe("Input Validation", () => {
    it("should fail and exit 1 for empty string argument", async () => {
      const result = await runCli([""]);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain("Error: Argument cannot be empty or whitespace-only.");
      expect(result.stdout).toBe("");
    });

    it("should fail and exit 1 for whitespace-only argument", async () => {
      const result = await runCli(["   "]);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain("Error: Argument cannot be empty or whitespace-only.");
      expect(result.stdout).toBe("");
    });

    it("should succeed and exit 0 for valid arguments", async () => {
      const result = await runCli(["valid-arg"]);
      expect(result.code).toBe(0);
      expect(result.stdout).toBe("");
      expect(result.stderr).toBe("");
    });
  });
});
