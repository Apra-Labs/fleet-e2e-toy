// Integration test for the CLI's --version / -v flag.

import { runCli } from "./helpers/cli-harness";
import packageJson from "../package.json";

describe("--version flag", () => {
  it("prints the version from package.json and exits 0 for --version", async () => {
    const result = await runCli(["--version"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(packageJson.version);
    expect(result.stderr).not.toContain("at ");
  });

  it("prints the version from package.json and exits 0 for -v", async () => {
    const result = await runCli(["-v"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(packageJson.version);
    expect(result.stderr).not.toContain("at ");
  });
});
