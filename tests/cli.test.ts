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
