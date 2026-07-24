import { run } from "../src/cli/index";
import { CommandIO } from "../src/cli/commands";

function makeIo(): CommandIO & { outLines: string[]; errLines: string[] } {
  const outLines: string[] = [];
  const errLines: string[] = [];
  return {
    outLines,
    errLines,
    out: (line: string) => outLines.push(line),
    err: (line: string) => errLines.push(line),
  };
}

describe("CLI --version/-v flag", () => {
  it("--version prints version string and exits 0", async () => {
    const io = makeIo();
    const code = await run(["--version"], io);
    expect(code).toBe(0);
    expect(io.outLines).toContain("fleet-e2e-toy v1.0.0");
    expect(io.errLines).toHaveLength(0);
  });

  it("-v prints version string and exits 0", async () => {
    const io = makeIo();
    const code = await run(["-v"], io);
    expect(code).toBe(0);
    expect(io.outLines).toContain("fleet-e2e-toy v1.0.0");
    expect(io.errLines).toHaveLength(0);
  });

  it("--version works even with other args present after it", async () => {
    const io = makeIo();
    const code = await run(["--version", "extra", "--flag", "value"], io);
    expect(code).toBe(0);
    expect(io.outLines).toContain("fleet-e2e-toy v1.0.0");
  });

  it("-v works even with other args present after it", async () => {
    const io = makeIo();
    const code = await run(["-v", "list", "--tag", "work"], io);
    expect(code).toBe(0);
    expect(io.outLines).toContain("fleet-e2e-toy v1.0.0");
  });
});
