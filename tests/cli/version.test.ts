import { run } from "../../src/cli/index";

function captureStdout(): { output: string[]; restore: () => void } {
  const output: string[] = [];
  const orig = process.stdout.write.bind(process.stdout);
  process.stdout.write = ((chunk: string) => {
    output.push(String(chunk));
    return true;
  }) as typeof process.stdout.write;
  return {
    output,
    restore: () => {
      process.stdout.write = orig;
    },
  };
}

describe("--version / -v", () => {
  it("--version prints the exact version string and exits 0", async () => {
    const cap = captureStdout();
    const code = await run(["--version"]);
    cap.restore();
    expect(code).toBe(0);
    expect(cap.output.join("")).toBe("fleet-e2e-toy v1.0.0\n");
  });

  it("-v behaves identically", async () => {
    const cap = captureStdout();
    const code = await run(["-v"]);
    cap.restore();
    expect(code).toBe(0);
    expect(cap.output.join("")).toBe("fleet-e2e-toy v1.0.0\n");
  });

  it("takes precedence and does not error when other args are present", async () => {
    const cap = captureStdout();
    const code = await run(["create", "--title", "x", "--version"]);
    cap.restore();
    expect(code).toBe(0);
    expect(cap.output.join("")).toBe("fleet-e2e-toy v1.0.0\n");
  });

  it("-v combined with a subcommand also short-circuits", async () => {
    const cap = captureStdout();
    const code = await run(["list", "-v"]);
    cap.restore();
    expect(code).toBe(0);
    expect(cap.output.join("")).toBe("fleet-e2e-toy v1.0.0\n");
  });
});
