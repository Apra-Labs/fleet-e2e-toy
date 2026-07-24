import { spawnSync } from "child_process";
import path from "path";

const entryPoint = path.resolve(__dirname, "../src/index.ts");
const tsNode = path.resolve(__dirname, "../node_modules/.bin/ts-node");

describe("CLI --version / -v", () => {
  it("prints the version string and exits 0 for --version", () => {
    const result = spawnSync(tsNode, [entryPoint, "--version"], {
      encoding: "utf-8",
    });
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(result.status).toBe(0);
  });

  it("prints the version string and exits 0 for -v", () => {
    const result = spawnSync(tsNode, [entryPoint, "-v"], {
      encoding: "utf-8",
    });
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(result.status).toBe(0);
  });
});
