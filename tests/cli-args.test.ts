import { spawnSync } from "child_process";
import { resolve } from "path";

const repoRoot = resolve(__dirname, "..");
const entryPoint = resolve(repoRoot, "src/index.ts");
const tsNode = resolve(repoRoot, "node_modules/.bin/ts-node");
const blankMessage = "arguments must not be empty or whitespace-only";

function run(args: string[]) {
  return spawnSync(tsNode, [entryPoint, ...args], {
    cwd: repoRoot,
    encoding: "utf-8",
    timeout: 15000,
    killSignal: "SIGKILL",
    env: { ...process.env, PORT: "3056" },
  });
}

describe("CLI blank argument rejection", () => {
  const timeout = 30000;

  test.each([[[""]], [["   "]], [["\t"]]])(
    "argv %j exits 1 with a clear error",
    (args: string[]) => {
      const result = run(args);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(blankMessage);
      expect(result.stderr).toContain("position 1");
      expect(result.stdout).not.toContain("NoteAPI running");
      expect(result.stderr).not.toMatch(/^\s*at /m);
    },
    timeout
  );

  test.each([[["--version", ""]], [["", "--version"]]])(
    "argv %j exits 1 before --version is handled",
    (args: string[]) => {
      const result = run(args);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(blankMessage);
      expect(result.stdout).not.toContain("fleet-e2e-toy v1.0.0");
      expect(result.stderr).not.toMatch(/^\s*at /m);
    },
    timeout
  );

  test(
    "control: --version still exits 0",
    () => {
      const result = run(["--version"]);
      expect(result.status).toBe(0);
      expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    },
    timeout
  );
});
