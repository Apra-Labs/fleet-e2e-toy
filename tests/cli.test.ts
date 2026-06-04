import { exec } from "child_process";
import * as path from "path";

const toolScript = path.resolve(__dirname, "../tool");

function runCli(args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    // Quote arguments to handle spaces, empty strings, and special characters
    const escapedArgs = args.map(arg => `"${arg.replace(/"/g, '\\"')}"`).join(" ");
    const command = `"${toolScript}" ${escapedArgs}`;

    exec(command, (error, stdout, stderr) => {
      resolve({
        code: error && error.code !== undefined ? error.code : 0,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      });
    });
  });
}

describe("CLI Integration Tests", () => {
  // Increase timeout for running child process if needed, although it should be fast
  jest.setTimeout(10000);

  describe("Version Flags", () => {
    it("should print version information and exit 0 for -v", async () => {
      const result = await runCli(["-v"]);
      expect(result.code).toBe(0);
      expect(result.stdout).toBe("fleet-e2e-toy v1.0.0");
      expect(result.stderr).toBe("");
    });

    it("should print version information and exit 0 for --version", async () => {
      const result = await runCli(["--version"]);
      expect(result.code).toBe(0);
      expect(result.stdout).toBe("fleet-e2e-toy v1.0.0");
      expect(result.stderr).toBe("");
    });

    it("should take precedence and work when passed with other arguments", async () => {
      const result = await runCli(["foo", "--version", "bar"]);
      expect(result.code).toBe(0);
      expect(result.stdout).toBe("fleet-e2e-toy v1.0.0");
      expect(result.stderr).toBe("");
    });
  });

  describe("Help Flags and Command", () => {
    const expectedHelpSubstring = "Usage:";
    const expectedHelpSubstringOptions = "Options:";
    const expectedHelpSubstringCommands = "Commands:";

    it("should print help and exit 0 for -h", async () => {
      const result = await runCli(["-h"]);
      expect(result.code).toBe(0);
      expect(result.stdout).toContain(expectedHelpSubstring);
      expect(result.stdout).toContain(expectedHelpSubstringOptions);
      expect(result.stdout).toContain(expectedHelpSubstringCommands);
      expect(result.stderr).toBe("");
    });

    it("should print help and exit 0 for --help", async () => {
      const result = await runCli(["--help"]);
      expect(result.code).toBe(0);
      expect(result.stdout).toContain(expectedHelpSubstring);
      expect(result.stdout).toContain(expectedHelpSubstringOptions);
      expect(result.stdout).toContain(expectedHelpSubstringCommands);
      expect(result.stderr).toBe("");
    });

    it("should print help and exit 0 for help subcommand", async () => {
      const result = await runCli(["help"]);
      expect(result.code).toBe(0);
      expect(result.stdout).toContain(expectedHelpSubstring);
      expect(result.stdout).toContain(expectedHelpSubstringOptions);
      expect(result.stdout).toContain(expectedHelpSubstringCommands);
      expect(result.stderr).toBe("");
    });
  });

  describe("Input Validation", () => {
    const expectedErrorMsg = "Error: Empty or whitespace-only arguments are not allowed";

    it("should reject an empty string argument and exit with 1", async () => {
      const result = await runCli([""]);
      expect(result.code).toBe(1);
      expect(result.stderr).toBe(expectedErrorMsg);
      expect(result.stdout).toBe("");
    });

    it("should reject a whitespace-only argument and exit with 1", async () => {
      const result = await runCli(["   "]);
      expect(result.code).toBe(1);
      expect(result.stderr).toBe(expectedErrorMsg);
      expect(result.stdout).toBe("");
    });

    it("should reject when one of multiple arguments is empty or whitespace", async () => {
      const result = await runCli(["validArg", "   ", "anotherValidArg"]);
      expect(result.code).toBe(1);
      expect(result.stderr).toBe(expectedErrorMsg);
      expect(result.stdout).toBe("");
    });
  });

  describe("Normal Argument Passing", () => {
    it("should run successfully and show initialization with no arguments", async () => {
      const result = await runCli([]);
      expect(result.code).toBe(0);
      expect(result.stdout).toBe("NoteAPI CLI initialized");
      expect(result.stderr).toBe("");
    });

    it("should run successfully and echo arguments when valid arguments are passed", async () => {
      const result = await runCli(["arg1", "arg2"]);
      expect(result.code).toBe(0);
      expect(result.stdout).toContain("NoteAPI CLI initialized");
      expect(result.stdout).toContain("Arguments: arg1 arg2");
      expect(result.stderr).toBe("");
    });
  });
});
