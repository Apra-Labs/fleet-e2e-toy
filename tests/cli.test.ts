import { execSync } from "child_process";
import * as path from "path";

describe("CLI Interface", () => {
  const cliPath = path.resolve(__dirname, "../src/cli.ts");

  const runCLI = (args: string) => {
    return execSync(`npx ts-node "${cliPath}" ${args}`, { encoding: "utf8" });
  };

  const runCLIFail = (args: string) => {
    try {
      execSync(`npx ts-node "${cliPath}" ${args}`, { encoding: "utf8", stdio: "pipe" });
      throw new Error("Expected CLI to fail but it succeeded");
    } catch (error: any) {
      return {
        status: error.status,
        stdout: error.stdout?.toString() || "",
        stderr: error.stderr?.toString() || "",
      };
    }
  };

  it("prints version with --version flag", () => {
    const output = runCLI("--version");
    expect(output.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("prints version with -v flag", () => {
    const output = runCLI("-v");
    expect(output.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("prints help with help command", () => {
    const output = runCLI("help");
    expect(output).toContain("Usage: fleet-e2e-toy [command] [options]");
    expect(output).toContain("Commands:");
    expect(output).toContain("help");
    expect(output).toContain("Options:");
    expect(output).toContain("-v, --version");
    expect(output).toContain("-h, --help");
  });

  it("prints help with --help flag", () => {
    const output = runCLI("--help");
    expect(output).toContain("Usage: fleet-e2e-toy [command] [options]");
  });

  it("prints help with -h flag", () => {
    const output = runCLI("-h");
    expect(output).toContain("Usage: fleet-e2e-toy [command] [options]");
  });

  it("prints help with zero arguments", () => {
    const output = runCLI("");
    expect(output).toContain("Usage: fleet-e2e-toy [command] [options]");
  });

  it("rejects empty argument string", () => {
    const res = runCLIFail('""');
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("Error: Arguments cannot be empty or blank strings.");
  });

  it("rejects whitespace-only argument string", () => {
    const res = runCLIFail('"   "');
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("Error: Arguments cannot be empty or blank strings.");
  });

  it("rejects unknown command", () => {
    const res = runCLIFail("unknown");
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("Unknown command or flag: unknown");
  });

  it("rejects unknown flag", () => {
    const res = runCLIFail("-x");
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("Unknown command or flag: -x");
  });
});
