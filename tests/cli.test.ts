import { execSync } from "child_process";
import * as path from "path";

const TOOL_PATH = path.resolve(__dirname, "../tool");

describe("CLI tool", () => {
  it("should show version with --version", () => {
    const stdout = execSync(`"${TOOL_PATH}" --version`, { encoding: "utf8" });
    expect(stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("should show version with -v", () => {
    const stdout = execSync(`"${TOOL_PATH}" -v`, { encoding: "utf8" });
    expect(stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("should show help with help subcommand", () => {
    const stdout = execSync(`"${TOOL_PATH}" help`, { encoding: "utf8" });
    expect(stdout).toContain("Usage: tool [options] [command]");
    expect(stdout).toContain("--help");
    expect(stdout).toContain("--version");
  });

  it("should show help with --help", () => {
    const stdout = execSync(`"${TOOL_PATH}" --help`, { encoding: "utf8" });
    expect(stdout).toContain("Usage: tool [options] [command]");
    expect(stdout).toContain("--help");
    expect(stdout).toContain("--version");
  });

  it("should show help with -h", () => {
    const stdout = execSync(`"${TOOL_PATH}" -h`, { encoding: "utf8" });
    expect(stdout).toContain("Usage: tool [options] [command]");
    expect(stdout).toContain("--help");
    expect(stdout).toContain("--version");
  });
});

