import { spawnSync } from "child_process";
import path from "path";

const entryPoint = path.join(__dirname, "..", "src", "index.ts");

describe("CLI --version flag", () => {
  it.each(["--version", "-v"])(
    "prints the version and exits 0 for %s",
    (flag) => {
      const result = spawnSync(
        process.execPath,
        ["-r", "ts-node/register", entryPoint, flag],
        { encoding: "utf-8" },
      );

      expect(result.status).toBe(0);
      expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    },
  );
});
