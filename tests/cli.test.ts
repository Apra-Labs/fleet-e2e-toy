import { execSync, spawnSync } from "child_process";
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

  it("should reject empty string argument with error and non-zero exit code", () => {
    const result = spawnSync(TOOL_PATH, [""]);
    expect(result.status).not.toBe(0);
    expect(result.stderr.toString().trim()).toBe("Error: argument cannot be empty or blank");
  });

  it("should reject blank/whitespace string argument with error and non-zero exit code", () => {
    const result = spawnSync(TOOL_PATH, ["   "]);
    expect(result.status).not.toBe(0);
    expect(result.stderr.toString().trim()).toBe("Error: argument cannot be empty or blank");
  });

  it("should bypass validation when --help is present alongside empty string", () => {
    const result = spawnSync(TOOL_PATH, ["--help", ""]);
    expect(result.status).toBe(0);
    expect(result.stdout.toString()).toContain("Usage: tool [options] [command]");
  });

  it("should bypass validation when --version is present alongside empty string", () => {
    const result = spawnSync(TOOL_PATH, ["--version", ""]);
    expect(result.status).toBe(0);
    expect(result.stdout.toString().trim()).toBe("fleet-e2e-toy v1.0.0");
  });
});

