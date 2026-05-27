import { spawnSync } from "child_process";
import * as path from "path";

const projectRoot = path.join(__dirname, "..");
const toolPath = process.platform === "win32" ? path.join(projectRoot, "tool.cmd") : path.join(projectRoot, "tool");

function runTool(...args: string[]) {
  const result = spawnSync(toolPath, args, {
    cwd: projectRoot,
    encoding: "utf-8",
  });
  return {
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    exitCode: result.status || 0,
  };
}

describe("CLI", () => {
  describe("--version flag", () => {
    it("prints version with --version flag", () => {
      const result = runTool("--version");
      expect(result.stdout).toContain("fleet-e2e-toy v1.0.0");
      expect(result.exitCode).toBe(0);
    });

    it("prints version with -v flag", () => {
      const result = runTool("-v");
      expect(result.stdout).toContain("fleet-e2e-toy v1.0.0");
      expect(result.exitCode).toBe(0);
    });
  });

  describe("help", () => {
    it("shows help with 'help' subcommand", () => {
      const result = runTool("help");
      expect(result.stdout).toContain("Usage:");
      expect(result.stdout).toContain("help");
      expect(result.stdout).toContain("add");
      expect(result.stdout).toContain("--version");
      expect(result.stdout).toContain("--help");
      expect(result.exitCode).toBe(0);
    });

    it("shows help with --help flag", () => {
      const result = runTool("--help");
      expect(result.stdout).toContain("Usage:");
      expect(result.stdout).toContain("help");
      expect(result.stdout).toContain("add");
      expect(result.stdout).toContain("--version");
      expect(result.stdout).toContain("--help");
      expect(result.exitCode).toBe(0);
    });

    it("shows help with -h flag", () => {
      const result = runTool("-h");
      expect(result.stdout).toContain("Usage:");
      expect(result.stdout).toContain("help");
      expect(result.stdout).toContain("add");
      expect(result.stdout).toContain("--version");
      expect(result.stdout).toContain("--help");
      expect(result.exitCode).toBe(0);
    });
  });

  describe("add command validation", () => {
    it("rejects empty string argument", () => {
      const result = runTool("add", "");
      expect(result.stderr).toContain("Error");
      expect(result.exitCode).toBe(1);
    });

    it("rejects whitespace-only argument", () => {
      const result = runTool("add", "   ");
      expect(result.stderr).toContain("Error");
      expect(result.exitCode).toBe(1);
    });

    it("accepts valid title argument", () => {
      const result = runTool("add", "My Note");
      expect(result.exitCode).toBe(0);
    });
  });
});
