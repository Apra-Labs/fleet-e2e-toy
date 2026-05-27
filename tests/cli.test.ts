import { execSync } from "child_process";

function runCLI(argsString: string): { stdout: string; stderr: string; status: number } {
  try {
    const stdout = execSync(`npx ts-node src/cli.ts ${argsString}`, { stdio: "pipe" });
    return {
      stdout: stdout.toString(),
      stderr: "",
      status: 0,
    };
  } catch (error) {
    const err = error as { stdout?: Buffer; stderr?: Buffer; status?: number };
    return {
      stdout: err.stdout ? err.stdout.toString() : "",
      stderr: err.stderr ? err.stderr.toString() : "",
      status: err.status ?? 1,
    };
  }
}

describe("CLI Tests", () => {
  it("prints version for --version flag", () => {
    const result = runCLI("--version");
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("prints version for -v flag", () => {
    const result = runCLI("-v");
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("prints help for --help flag", () => {
    const result = runCLI("--help");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Usage:");
    expect(result.stdout).toContain("Commands:");
    expect(result.stdout).toContain("Flags:");
  });

  it("prints help for -h flag", () => {
    const result = runCLI("-h");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Usage:");
    expect(result.stdout).toContain("Commands:");
    expect(result.stdout).toContain("Flags:");
  });

  it("prints help for help command", () => {
    const result = runCLI("help");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Usage:");
    expect(result.stdout).toContain("Commands:");
    expect(result.stdout).toContain("Flags:");
  });

  it("rejects empty first argument", () => {
    const result = runCLI('""');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Error: Command or argument cannot be empty or whitespace-only.");
  });

  it("rejects whitespace-only first argument", () => {
    const result = runCLI('"   "');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Error: Command or argument cannot be empty or whitespace-only.");
  });

  it("rejects empty note title on add command", () => {
    const result = runCLI('add ""');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Error: Note title cannot be empty or whitespace-only.");
  });

  it("rejects whitespace-only note title on add command", () => {
    const result = runCLI('add "   "');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Error: Note title cannot be empty or whitespace-only.");
  });

  it("logs success message on valid add command", () => {
    const result = runCLI('add "Test Note"');
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe("Note added: Test Note");
  });

  it("logs success message on valid serve command", () => {
    const result = runCLI("serve");
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe("Starting server...");
  });
});
