import { spawnSync } from "child_process";
import * as path from "path";

const cliPath = path.resolve(__dirname, "../src/cli.ts");

function runCli(args: string[]) {
  return spawnSync(process.execPath, ["-r", "ts-node/register", cliPath, ...args], {
    encoding: "utf8",
  });
}

describe("CLI Tests", () => {
  describe("Version Flags", () => {
    it("should print version on -v", () => {
      const result = runCli(["-v"]);
      expect(result.status).toBe(0);
      expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    });

    it("should print version on --version", () => {
      const result = runCli(["--version"]);
      expect(result.status).toBe(0);
      expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    });
  });

  describe("Help Commands & Flags", () => {
    it("should print usage information on help, --help, and -h, and they must be identical", () => {
      const resHelp = runCli(["help"]);
      const resDoubleDashHelp = runCli(["--help"]);
      const resDashH = runCli(["-h"]);

      expect(resHelp.status).toBe(0);
      expect(resDoubleDashHelp.status).toBe(0);
      expect(resDashH.status).toBe(0);

      expect(resHelp.stdout).toContain("Usage: fleet-e2e-toy [command] [options]");
      expect(resHelp.stdout).toEqual(resDoubleDashHelp.stdout);
      expect(resHelp.stdout).toEqual(resDashH.stdout);
    });
  });

  describe("Input Validation", () => {
    it("should reject empty string argument", () => {
      const result = runCli([""]);
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("Error: Empty or whitespace-only arguments are not allowed.");
    });

    it("should reject whitespace-only string argument", () => {
      const result = runCli(["   "]);
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("Error: Empty or whitespace-only arguments are not allowed.");
    });

    it("should reject empty title in add command", () => {
      const result = runCli(["add", ""]);
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("Error: Empty or whitespace-only arguments are not allowed.");
    });

    it("should reject missing title in add command", () => {
      const result = runCli(["add"]);
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("Error: The title argument is required for the \"add\" command and cannot be blank.");
    });

    it("should accept valid title in add command", () => {
      const result = runCli(["add", "my valid note title"]);
      expect(result.status).toBe(0);
    });
  });
});
