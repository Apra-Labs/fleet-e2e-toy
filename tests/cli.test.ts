import { execSync } from "child_process";
import path from "path";

const toolCmd = path.resolve(__dirname, "../tool");

interface ExecError extends Error {
  status?: number;
  stderr?: Buffer;
}

describe("CLI Tests", () => {
  it("prints version with --version", () => {
    const stdout = execSync(`"${toolCmd}" --version`).toString();
    expect(stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("prints version with -v", () => {
    const stdout = execSync(`"${toolCmd}" -v`).toString();
    expect(stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("prints help with help subcommand", () => {
    const stdout = execSync(`"${toolCmd}" help`).toString();
    expect(stdout).toContain("Usage: tool [command] [options]");
    expect(stdout).toContain("serve");
    expect(stdout).toContain("help");
    expect(stdout).toContain("-v, --version");
    expect(stdout).toContain("-h, --help");
  });

  it("prints help with --help", () => {
    const stdout = execSync(`"${toolCmd}" --help`).toString();
    expect(stdout).toContain("Usage: tool [command] [options]");
  });

  it("prints help with -h", () => {
    const stdout = execSync(`"${toolCmd}" -h`).toString();
    expect(stdout).toContain("Usage: tool [command] [options]");
  });

  it("rejects empty string argument", () => {
    let error: ExecError | null = null;
    try {
      execSync(`"${toolCmd}" ""`, { stdio: "pipe" });
    } catch (e) {
      error = e as ExecError;
    }
    expect(error).not.toBeNull();
    expect(error?.status).not.toBe(0);
    expect(error?.stderr?.toString()).toContain("Error: Argument cannot be empty or whitespace-only.");
  });

  it("rejects whitespace-only string argument", () => {
    let error: ExecError | null = null;
    try {
      execSync(`"${toolCmd}" "   "`, { stdio: "pipe" });
    } catch (e) {
      error = e as ExecError;
    }
    expect(error).not.toBeNull();
    expect(error?.status).not.toBe(0);
    expect(error?.stderr?.toString()).toContain("Error: Argument cannot be empty or whitespace-only.");
  });
});
