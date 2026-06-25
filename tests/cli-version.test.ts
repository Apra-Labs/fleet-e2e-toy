import { runCli } from "../src/cli/index";

describe("CLI --version / -v flag", () => {
  it("--version prints version string and exits 0", () => {
    const result = runCli(["--version"]);
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(result.exitCode).toBe(0);
  });

  it("-v prints identical output and exits 0", () => {
    const result = runCli(["-v"]);
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(result.exitCode).toBe(0);
  });

  it("--version combined with other args still prints version and exits 0", () => {
    const result = runCli(["--version", "list", "create"]);
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(result.exitCode).toBe(0);
  });
});
