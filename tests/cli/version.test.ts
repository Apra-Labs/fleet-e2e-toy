import { run } from "../../src/cli/index";

function captureOutput(): { stdout: string[]; stderr: string[]; restore: () => void } {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const origOut = process.stdout.write.bind(process.stdout);
  const origErr = process.stderr.write.bind(process.stderr);
  process.stdout.write = ((chunk: string) => {
    stdout.push(String(chunk));
    return true;
  }) as typeof process.stdout.write;
  process.stderr.write = ((chunk: string) => {
    stderr.push(String(chunk));
    return true;
  }) as typeof process.stderr.write;
  return {
    stdout,
    stderr,
    restore: () => {
      process.stdout.write = origOut;
      process.stderr.write = origErr;
    },
  };
}

describe("--version / -v", () => {
  it("--version prints the exact version string and exits 0", async () => {
    const cap = captureOutput();
    const code = await run(["--version"]);
    cap.restore();
    expect(code).toBe(0);
    expect(cap.stdout.join("")).toBe("fleet-e2e-toy v1.0.0\n");
    expect(cap.stderr.join("")).toBe("");
    expect(cap.stderr.join("")).not.toMatch(/at /);
  });

  it("-v behaves identically", async () => {
    const cap = captureOutput();
    const code = await run(["-v"]);
    cap.restore();
    expect(code).toBe(0);
    expect(cap.stdout.join("")).toBe("fleet-e2e-toy v1.0.0\n");
    expect(cap.stderr.join("")).toBe("");
    expect(cap.stderr.join("")).not.toMatch(/at /);
  });

  it("takes precedence and does not error when other args are present", async () => {
    const cap = captureOutput();
    const code = await run(["create", "--title", "x", "--version"]);
    cap.restore();
    expect(code).toBe(0);
    expect(cap.stdout.join("")).toBe("fleet-e2e-toy v1.0.0\n");
    expect(cap.stderr.join("")).toBe("");
    expect(cap.stderr.join("")).not.toMatch(/at /);
  });

  it("-v combined with a subcommand also short-circuits", async () => {
    const cap = captureOutput();
    const code = await run(["list", "-v"]);
    cap.restore();
    expect(code).toBe(0);
    expect(cap.stdout.join("")).toBe("fleet-e2e-toy v1.0.0\n");
    expect(cap.stderr.join("")).toBe("");
    expect(cap.stderr.join("")).not.toMatch(/at /);
  });
});
