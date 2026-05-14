import { spawnSync } from "child_process";
import * as path from "path";

const CLI_PATH = path.resolve(__dirname, "../dist/cli.js");

function runCLI(args: string[]) {
  return spawnSync("node", [CLI_PATH, ...args], { encoding: "utf8" });
}

describe("CLI", () => {
  describe("Version", () => {
    it("prints version with --version", () => {
      const result = runCLI(["--version"]);
      expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
      expect(result.status).toBe(0);
    });

    it("prints version with -v", () => {
      const result = runCLI(["-v"]);
      expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
      expect(result.status).toBe(0);
    });
  });

  describe("Help", () => {
    const helpOutput = "Usage: fleet-e2e-toy [options] [command]";

    it("prints help with help subcommand", () => {
      const result = runCLI(["help"]);
      expect(result.stdout).toContain(helpOutput);
      expect(result.status).toBe(0);
    });

    it("prints help with --help flag", () => {
      const result = runCLI(["--help"]);
      expect(result.stdout).toContain(helpOutput);
      expect(result.status).toBe(0);
    });

    it("prints help with -h flag", () => {
      const result = runCLI(["-h"]);
      expect(result.stdout).toContain(helpOutput);
      expect(result.status).toBe(0);
    });
  });

  describe("Validation", () => {
    const errorMsg = "Error: Argument cannot be empty or whitespace only.";

    it("fails with empty string argument", () => {
      const result = runCLI([""]);
      expect(result.stderr).toContain(errorMsg);
      expect(result.status).toBe(1);
    });

    it("fails with whitespace-only argument", () => {
      const result = runCLI(["   "]);
      expect(result.stderr).toContain(errorMsg);
      expect(result.status).toBe(1);
    });

    it("fails if any argument is empty string", () => {
      const result = runCLI(["valid", ""]);
      expect(result.stderr).toContain(errorMsg);
      expect(result.status).toBe(1);
    });
  });
});
