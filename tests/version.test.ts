import { spawnSync } from "child_process";
import path from "path";

const ENTRYPOINT = path.join(__dirname, "..", "src", "index.ts");
const TS_NODE = path.join(__dirname, "..", "node_modules", ".bin", "ts-node");

function runCli(args: string[]) {
  return spawnSync(TS_NODE, [ENTRYPOINT, ...args], {
    encoding: "utf-8",
    timeout: 15000,
    env: { ...process.env, PORT: "0" },
  });
}

describe("--version flag", () => {
  it("prints the version string and exits 0 for --version", () => {
    const result = runCli(["--version"]);
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(result.status).toBe(0);
    expect(result.stdout).not.toContain("NoteAPI running");
  });

  it("prints the version string and exits 0 for -v", () => {
    const result = runCli(["-v"]);
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(result.status).toBe(0);
    expect(result.stdout).not.toContain("NoteAPI running");
  });

  it("works when --version appears alongside other args", () => {
    const result = runCli(["--foo", "--version", "--bar"]);
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(result.status).toBe(0);
  });

  it("starts the server normally when the flag is absent", () => {
    const result = spawnSync(
      TS_NODE,
      ["-e", `require(${JSON.stringify(ENTRYPOINT)})`],
      {
        encoding: "utf-8",
        timeout: 3000,
        env: { ...process.env, PORT: "0" },
      }
    );
    // Process is killed by the timeout because the server stays listening
    // (it never exits on its own) -- that itself proves normal startup.
    expect(result.stdout).toContain("NoteAPI running");
    expect(result.stdout).not.toContain("fleet-e2e-toy v1.0.0");
  });
});
