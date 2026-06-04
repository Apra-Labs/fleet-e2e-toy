import { execSync } from "child_process";
import * as path from "path";

const runTool = (args: string): { stdout: string; stderr: string; status: number } => {
  const toolScript = path.resolve(__dirname, "../tool");
  try {
    const stdout = execSync(`"${toolScript}" ${args}`, { encoding: "utf8", stdio: "pipe" });
    return { stdout, stderr: "", status: 0 };
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string; status?: number };
    return {
      stdout: err.stdout || "",
      stderr: err.stderr || "",
      status: err.status !== undefined ? err.status : 1,
    };
  }
};

describe("CLI tests", () => {
  it("prints version information and exits with 0 for --version and -v", () => {
    const res1 = runTool("--version");
    expect(res1.status).toBe(0);
    expect(res1.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");

    const res2 = runTool("-v");
    expect(res2.status).toBe(0);
    expect(res2.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("prints usage info and exits with 0 for help command and flags", () => {
    const helpUsage = `Usage: fleet-e2e-toy [options] [command]

Options:
  -v, --version  Show version number
  -h, --help     Show help

Commands:
  help           Show help`;

    const res1 = runTool("help");
    expect(res1.status).toBe(0);
    expect(res1.stdout.trim()).toBe(helpUsage);

    const res2 = runTool("--help");
    expect(res2.status).toBe(0);
    expect(res2.stdout.trim()).toBe(helpUsage);

    const res3 = runTool("-h");
    expect(res3.status).toBe(0);
    expect(res3.stdout.trim()).toBe(helpUsage);
  });

  it("rejects empty or whitespace-only arguments and exits with non-zero code", () => {
    const res1 = runTool('""');
    expect(res1.status).not.toBe(0);
    expect(res1.stderr).toContain("Error: Empty or whitespace-only arguments are not allowed.");

    const res2 = runTool('"   "');
    expect(res2.status).not.toBe(0);
    expect(res2.stderr).toContain("Error: Empty or whitespace-only arguments are not allowed.");
  });
});
