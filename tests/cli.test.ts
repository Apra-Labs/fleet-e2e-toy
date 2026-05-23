import { spawnSync } from "child_process";
import * as path from "path";

describe("CLI Tests", () => {
  const runCLI = (args: string[]) => {
    const cliPath = path.resolve(__dirname, "../src/cli.ts");
    
    const result = spawnSync("node", ["-r", "ts-node/register", cliPath, ...args], {
      encoding: "utf8",
    });
    
    return {
      stdout: result.stdout || "",
      stderr: result.stderr || "",
      status: result.status,
    };
  };

  it("prints version with --version flag", () => {
    const { stdout, status } = runCLI(["--version"]);
    expect(status).toBe(0);
    expect(stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("prints version with -v flag", () => {
    const { stdout, status } = runCLI(["-v"]);
    expect(status).toBe(0);
    expect(stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("prints usage with help subcommand", () => {
    const { stdout, status } = runCLI(["help"]);
    expect(status).toBe(0);
    expect(stdout).toContain("Usage: fleet-e2e-toy");
    expect(stdout).toContain("Options:");
    expect(stdout).toContain("Commands:");
  });

  it("prints usage with --help flag", () => {
    const { stdout, status } = runCLI(["--help"]);
    expect(status).toBe(0);
    expect(stdout).toContain("Usage: fleet-e2e-toy");
  });

  it("prints usage with -h flag", () => {
    const { stdout, status } = runCLI(["-h"]);
    expect(status).toBe(0);
    expect(stdout).toContain("Usage: fleet-e2e-toy");
  });

  it("rejects empty string argument", () => {
    const { stderr, status } = runCLI([""]);
    expect(status).toBe(1);
    expect(stderr.trim()).toContain("Error: Arguments cannot be empty or blank strings.");
  });

  it("rejects blank string argument", () => {
    const { stderr, status } = runCLI(["   "]);
    expect(status).toBe(1);
    expect(stderr.trim()).toContain("Error: Arguments cannot be empty or blank strings.");
  });

  it("rejects unknown command", () => {
    const { stderr, status } = runCLI(["unknown_command"]);
    expect(status).toBe(1);
    expect(stderr.trim()).toContain("Unknown command or flag: unknown_command");
  });
});
