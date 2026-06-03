import { execSync } from "child_process";
import path from "path";

const TOOL_PATH = path.resolve(__dirname, "../tool");

describe("CLI Wrapper and Version Flag", () => {
  it("prints version with --version flag", () => {
    const stdout = execSync(`"${TOOL_PATH}" --version`, { encoding: "utf8" });
    expect(stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("prints version with -v flag", () => {
    const stdout = execSync(`"${TOOL_PATH}" -v`, { encoding: "utf8" });
    expect(stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("prints version when mixed with other flags", () => {
    const stdout1 = execSync(`"${TOOL_PATH}" --version --foo`, { encoding: "utf8" });
    expect(stdout1.trim()).toBe("fleet-e2e-toy v1.0.0");

    const stdout2 = execSync(`"${TOOL_PATH}" --foo -v`, { encoding: "utf8" });
    expect(stdout2.trim()).toBe("fleet-e2e-toy v1.0.0");
  });
});

describe("Help Command and Flags", () => {
  const expectedHelpSubstr = "Usage: fleet-e2e-toy [command|options]";

  it("prints help with help subcommand", () => {
    const stdout = execSync(`"${TOOL_PATH}" help`, { encoding: "utf8" });
    expect(stdout).toContain(expectedHelpSubstr);
    expect(stdout).toContain("Commands:");
    expect(stdout).toContain("help");
    expect(stdout).toContain("Options:");
    expect(stdout).toContain("-h, --help");
    expect(stdout).toContain("-v, --version");
  });

  it("prints help with --help flag", () => {
    const stdout = execSync(`"${TOOL_PATH}" --help`, { encoding: "utf8" });
    expect(stdout).toContain(expectedHelpSubstr);
  });

  it("prints help with -h flag", () => {
    const stdout = execSync(`"${TOOL_PATH}" -h`, { encoding: "utf8" });
    expect(stdout).toContain(expectedHelpSubstr);
  });

  it("exits with code 0 on help", () => {
    // execSync throws if exit code is non-zero, so successful run means exit code 0
    expect(() => {
      execSync(`"${TOOL_PATH}" -h`);
    }).not.toThrow();
  });
});

describe("CLI Argument Validation", () => {
  it("rejects empty argument and exits with non-zero code", () => {
    let threw = false;
    try {
      execSync(`"${TOOL_PATH}" ""`, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
    } catch (error) {
      const err = error as { status: number; stderr: string };
      threw = true;
      expect(err.status).not.toBe(0);
      expect(err.stderr).toContain("Error: CLI arguments cannot be empty or blank.");
    }
    expect(threw).toBe(true);
  });

  it("rejects whitespace-only argument and exits with non-zero code", () => {
    let threw = false;
    try {
      execSync(`"${TOOL_PATH}" "   "`, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
    } catch (error) {
      const err = error as { status: number; stderr: string };
      threw = true;
      expect(err.status).not.toBe(0);
      expect(err.stderr).toContain("Error: CLI arguments cannot be empty or blank.");
    }
    expect(threw).toBe(true);
  });

  it("rejects empty argument mixed with valid arguments", () => {
    let threw = false;
    try {
      execSync(`"${TOOL_PATH}" --version ""`, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
    } catch (error) {
      const err = error as { status: number; stderr: string };
      threw = true;
      expect(err.status).not.toBe(0);
      expect(err.stderr).toContain("Error: CLI arguments cannot be empty or blank.");
    }
    expect(threw).toBe(true);
  });
});


