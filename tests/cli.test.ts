import { execSync } from "child_process";

describe("CLI tool", () => {
  const runTool = (args: string) => {
    try {
      // Use node + ts-node to run the script
      const output = execSync(`npx ts-node src/cli.ts ${args}`, { encoding: "utf8", stdio: "pipe" });
      return { output, status: 0, stderr: "" };
    } catch (error: any) {
      return { output: error.stdout || "", stderr: error.stderr || "", status: error.status };
    }
  };

  it("prints version with --version", () => {
    const { output, status } = runTool("--version");
    expect(status).toBe(0);
    expect(output).toContain("fleet-e2e-toy v1.0.0");
  });

  it("prints version with -v", () => {
    const { output, status } = runTool("-v");
    expect(status).toBe(0);
    expect(output).toContain("fleet-e2e-toy v1.0.0");
  });

  it("prints help with --help", () => {
    const { output, status } = runTool("--help");
    expect(status).toBe(0);
    expect(output).toContain("Usage:");
    expect(output).toContain("--version");
  });

  it("prints help with help subcommand", () => {
    const { output, status } = runTool("help");
    expect(status).toBe(0);
    expect(output).toContain("Usage:");
  });

  it("rejects blank strings", () => {
    const { status, stderr } = runTool('" "');
    expect(status).toBe(1);
    expect(stderr).toContain("Error: Arguments cannot be empty or blank strings.");
  });

  it("rejects unknown commands", () => {
    const { status, stderr } = runTool("unknown-cmd");
    expect(status).toBe(1);
    expect(stderr).toContain("Unknown command or flag: unknown-cmd");
  });
});
