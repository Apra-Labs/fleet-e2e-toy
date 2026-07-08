import { main } from "../src/cli";

describe("CLI --version flag", () => {
  it("'--version' prints exactly 'fleet-e2e-toy v1.0.0' to stdout and exits 0", async () => {
    const result = await main(["--version"]);
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(result.exitCode).toBe(0);
    expect(result.stdout).not.toMatch(/at .*\(.*:\d+:\d+\)/);
    expect(result.stderr).toBe("");
  });

  it("'-v' behaves identically to '--version'", async () => {
    const result = await main(["-v"]);
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
  });

  it("--version works combined with other flags", async () => {
    const result = await main(["list", "--tag=work", "--version"]);
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
  });

  it("-v works combined with other flags", async () => {
    const result = await main(["create", "-v", "--title=x"]);
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
  });
});
