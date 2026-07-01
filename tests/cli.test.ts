import { spawnSync } from "child_process";
import path from "path";
import { getVersionString, hasVersionFlag } from "../src/cli";
import pkg from "../package.json";

describe("hasVersionFlag", () => {
  it("detects --version", () => {
    expect(hasVersionFlag(["--version"])).toBe(true);
  });

  it("detects -v", () => {
    expect(hasVersionFlag(["-v"])).toBe(true);
  });

  it("returns false when neither flag is present", () => {
    expect(hasVersionFlag(["--other", "arg"])).toBe(false);
  });
});

describe("getVersionString", () => {
  it("reads the version from package.json", () => {
    expect(getVersionString()).toBe(`fleet-e2e-toy v${pkg.version}`);
  });
});

describe("CLI --version integration", () => {
  const tsNodeBin = path.join(__dirname, "..", "node_modules", ".bin", "ts-node");
  const entry = path.join(__dirname, "..", "src", "index.ts");

  it("prints the version and exits 0 for --version", () => {
    const result = spawnSync(tsNodeBin, [entry, "--version"], { encoding: "utf-8" });

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe(`fleet-e2e-toy v${pkg.version}`);
  });

  it("prints the version and exits 0 for -v", () => {
    const result = spawnSync(tsNodeBin, [entry, "-v"], { encoding: "utf-8" });

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe(`fleet-e2e-toy v${pkg.version}`);
  });
});
