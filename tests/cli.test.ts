import { spawnSync, spawn } from "child_process";
import path from "path";

const ENTRY_POINT = path.resolve(__dirname, "../src/index.ts");
const TS_NODE_REGISTER = require.resolve("ts-node/register");

function runCli(args: string[]) {
  return spawnSync(process.execPath, ["-r", TS_NODE_REGISTER, ENTRY_POINT, ...args], {
    encoding: "utf-8",
    timeout: 10000,
  });
}

describe("CLI --version flag", () => {
  it.each(["--version", "-v"])("prints the version string and exits 0 for %s", (flag) => {
    const result = runCli([flag]);
    expect(result.stdout.trim()).toBe("fleet-e2e-toy v1.0.0");
    expect(result.status).toBe(0);
  });

  it("does not start the HTTP server when --version is passed", () => {
    const result = runCli(["--version"]);
    expect(result.stdout).not.toMatch(/NoteAPI running/);
  });

  it("starts the HTTP server normally when no flag is passed", (done) => {
    const child = spawn(process.execPath, ["-r", TS_NODE_REGISTER, ENTRY_POINT], {
      env: { ...process.env, PORT: "3999" },
    });

    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
      if (output.includes("NoteAPI running")) {
        child.kill();
      }
    });

    child.on("exit", () => {
      expect(output).toMatch(/NoteAPI running on http:\/\/localhost:3999/);
      done();
    });
  }, 10000);
});
