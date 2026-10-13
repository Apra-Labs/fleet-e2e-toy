import { spawnSync } from "child_process";
import path from "path";

const entryPoint = path.resolve(__dirname, "../src/index.ts");

function runCLI(...args: string[]) {
  return spawnSync("npx", ["ts-node", entryPoint, ...args], {
    encoding: "utf8",
    cwd: path.resolve(__dirname, ".."),
    timeout: 15000,
    shell: true,
  });
}

describe("--version flag", () => {
  it("prints version string with --version and exits 0", () => {
    const result = runCLI("--version");
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
  });

  it("prints version string with -v and exits 0", () => {
    const result = runCLI("-v");
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
  });
});
