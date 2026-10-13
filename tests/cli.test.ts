import { spawnSync } from "child_process";
import path from "path";

const CLI_PATH = path.join(__dirname, "../src/cli.ts");

function runCLI(args: string[]): { stdout: string; stderr: string; status: number | null } {
  const result = spawnSync("npx", ["ts-node", CLI_PATH, ...args], {
    encoding: "utf8",
    cwd: path.join(__dirname, ".."),
  });
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    status: result.status,
  };
}

describe("CLI --version flag", () => {
  it("prints fleet-e2e-toy v1.0.0 with --version", () => {
    const { stdout, status } = runCLI(["--version"]);
    expect(stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(status).toBe(0);
  });

  it("prints fleet-e2e-toy v1.0.0 with -v", () => {
    const { stdout, status } = runCLI(["-v"]);
    expect(stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(status).toBe(0);
  });
});
