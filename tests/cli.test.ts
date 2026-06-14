import { spawnSync } from "child_process";
import * as path from "path";

const CLI = path.resolve(__dirname, "..", "dist", "cli.js");

function run(args: string[]) {
  return spawnSync(process.execPath, [CLI, ...args], { encoding: "utf8" });
}

describe("cli --version (smoke)", () => {
  test("--version prints exact version and exits 0", () => {
    const r = run(["--version"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toBe("fleet-e2e-toy v1.0.0\n");
  });

  test("-v is an alias for --version", () => {
    const r = run(["-v"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toBe("fleet-e2e-toy v1.0.0\n");
  });

  test("non-version invocation exits 0 (placeholder)", () => {
    const r = run([]);
    expect(r.status).toBe(0);
  });
});

describe("cli help", () => {
  test("help (positional) prints help text and exits 0", () => {
    const r = run(["help"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("Usage:");
    expect(r.stdout).toContain("--version");
    expect(r.stdout).toContain("--help");
  });

  test("--help prints help text and exits 0", () => {
    const r = run(["--help"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("Usage:");
    expect(r.stdout).toContain("--version");
    expect(r.stdout).toContain("--help");
  });

  test("-h prints help text and exits 0", () => {
    const r = run(["-h"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("Usage:");
    expect(r.stdout).toContain("--version");
    expect(r.stdout).toContain("--help");
  });
});

describe("cli precedence", () => {
  test("--version takes precedence over --help", () => {
    const r = run(["--version", "--help"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toBe("fleet-e2e-toy v1.0.0\n");
    expect(r.stdout).not.toContain("Usage:");
  });
});

describe("cli validation", () => {
  test("empty string argument exits 1 with error on stderr", () => {
    const r = spawnSync(process.execPath, [CLI, ""], { encoding: "utf8" });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("must not be empty or blank");
  });

  test("whitespace-only argument exits 1 with error on stderr", () => {
    const r = spawnSync(process.execPath, [CLI, "   "], { encoding: "utf8" });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("must not be empty or blank");
  });
});
